import type { ProtocolEvent } from "@langchain/langgraph";

export type Progress =
  | { type: "node"; node: string }
  | { type: "tool-start"; tool: string; input: string }
  | { type: "tool-end"; tool: string; output: string }
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

const isRoot = (ev: ProtocolEvent) => ev.params.namespace.length === 0;

function nodeProgress(ev: ProtocolEvent): Progress | null {
  if (ev.method !== "tasks" || !isRoot(ev)) return null;
  const data = ev.params.data as { name: string };
  return "input" in data ? { type: "node", node: data.name } : null;
}

function toolProgress(ev: ProtocolEvent, names: Map<string, string>): Progress | null {
  if (ev.method !== "tools") return null;
  const data = ev.params.data as { event: string; tool_call_id: string; tool_name?: string; input?: string; output?: { content: unknown } };
  if (data.event === "tool-started") {
    const tool = String(data.tool_name);
    names.set(data.tool_call_id, tool);
    return { type: "tool-start", tool, input: String(data.input ?? "") };
  }
  if (data.event === "tool-finished") {
    const content = data.output?.content;
    return {
      type: "tool-end",
      tool: names.get(data.tool_call_id) ?? "?",
      output: typeof content === "string" ? content : JSON.stringify(content),
    };
  }
  return null;
}

function tokenProgress(ev: ProtocolEvent): Progress | null {
  if (ev.method !== "messages") return null;
  const data = ev.params.data as { event: string; delta?: { type: string; text?: string } };
  if (data.event !== "content-block-delta" || data.delta?.type !== "text-delta" || !data.delta.text) return null;
  return { type: "token", text: data.delta.text };
}

function lifecycleProgress(ev: ProtocolEvent): Progress | null {
  if (ev.method !== "lifecycle" || !isRoot(ev)) return null;
  const data = ev.params.data as { event: string; error?: string };
  if (data.event === "completed") return { type: "done" };
  if (data.event === "failed") return { type: "error", message: data.error ?? "ไม่ทราบสาเหตุ" };
  return null;
}

export function createMapper(): (ev: ProtocolEvent) => Progress | null {
  const names = new Map<string, string>();
  return (ev) => nodeProgress(ev) ?? toolProgress(ev, names) ?? tokenProgress(ev) ?? lifecycleProgress(ev);
}

export async function* progressStream(run: AsyncIterable<ProtocolEvent>): AsyncGenerator<Progress> {
  const map = createMapper();
  let failed = false;
  try {
    for await (const ev of run) {
      const progress = map(ev);
      if (!progress) continue;
      if (progress.type === "error") failed = true;
      yield progress;
    }
  } catch (error) {
    if (!failed) yield { type: "error", message: error instanceof Error ? error.message : String(error) };
  }
}
