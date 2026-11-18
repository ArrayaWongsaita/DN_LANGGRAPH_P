import type { ProtocolEvent } from "@langchain/langgraph";

export function onChannel(events: ProtocolEvent[], method: string): ProtocolEvent[] {
  return events.filter((ev) => ev.method === method);
}

export function startedNodes(events: ProtocolEvent[]): string[] {
  return onChannel(events, "tasks")
    .filter((ev) => ev.params.namespace.length === 0 && "input" in (ev.params.data as object))
    .map((ev) => (ev.params.data as { name: string }).name);
}

export interface ToolRun {
  id: string;
  name: string;
  output: string;
}

export function finishedTools(events: ProtocolEvent[]): ToolRun[] {
  const names = new Map<string, string>();
  const done: ToolRun[] = [];
  for (const ev of onChannel(events, "tools")) {
    const data = ev.params.data as { event: string; tool_call_id: string; tool_name?: string; output?: { content: unknown } };
    if (data.event === "tool-started") names.set(data.tool_call_id, String(data.tool_name));
    if (data.event === "tool-finished") {
      const content = data.output?.content;
      done.push({
        id: data.tool_call_id,
        name: names.get(data.tool_call_id) ?? "?",
        output: typeof content === "string" ? content : JSON.stringify(content),
      });
    }
  }
  return done;
}
