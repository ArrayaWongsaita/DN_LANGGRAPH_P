export type NodeState = "running" | "complete" | "error";

export interface NodeView {
  node: string;
  status: NodeState;
  error?: string;
}

export interface UiState {
  status: "idle" | "running" | "complete" | "error";
  nodes: NodeView[];
  values: Record<string, unknown> | undefined;
  error?: string;
}

export interface StreamEvent {
  method: string;
  params: { namespace: string[]; data?: any };
}

export function initialUi(): UiState {
  return { status: "idle", nodes: [], values: undefined };
}

export function reduceUi(state: UiState, event: StreamEvent): UiState {
  const root = event.params.namespace.length === 0;
  const data = event.params.data;

  if (root && event.method === "lifecycle") {
    if (data?.event === "running") return { ...state, status: "running", error: undefined };
    if (data?.event === "completed") return { ...state, status: "complete" };
    if (data?.event === "failed") return { ...state, status: "error", error: String(data.error) };
    return state;
  }
  if (root && event.method === "values") return { ...state, values: data };

  if (event.method === "custom:node-status") {
    const ok = data && typeof data.node === "string" && ["running", "complete", "error"].includes(data.status);
    if (!ok) return state;
    const view: NodeView = { node: data.node, status: data.status, ...(data.error !== undefined ? { error: data.error } : {}) };
    const index = state.nodes.findIndex((n) => n.node === data.node);
    const nodes = index === -1 ? [...state.nodes, view] : state.nodes.map((n, i) => (i === index ? view : n));
    return { ...state, nodes };
  }
  return state;
}

export function progressPercent(nodes: NodeView[], expectedTotal: number): number {
  const total = Math.max(1, expectedTotal);
  const done = nodes.filter((n) => n.status === "complete").length;
  return Math.min(100, Math.round((done / total) * 100));
}

const count = (text: string, token: string) => text.split(token).length - 1;

export function closeMarkdown(partial: string): string {
  if (count(partial, "```") % 2 === 1) return partial.endsWith("\n") ? `${partial}\`\`\`` : `${partial}\n\`\`\``;
  let out = partial;
  const withoutFences = partial.replaceAll("```", "");
  if (count(withoutFences, "**") % 2 === 1) out += "**";
  if (count(withoutFences.replaceAll("**", ""), "`") % 2 === 1) out += "`";
  return out;
}

export function applyEvents(events: StreamEvent[], from: UiState = initialUi()): UiState {
  return events.reduce(reduceUi, from);
}

export function headline(ui: UiState, expectedTotal: number): string {
  if (ui.status === "error") return `ล้มเหลว: ${ui.error ?? "ไม่ทราบสาเหตุ"}`;
  if (ui.status === "complete") return "เสร็จแล้ว";
  if (ui.status === "idle") return "พร้อม";
  const running = ui.nodes.filter((n) => n.status === "running").map((n) => n.node);
  return `กำลังทำงาน ${progressPercent(ui.nodes, expectedTotal)}%${running.length ? ` (${running.join(", ")})` : ""}`;
}
