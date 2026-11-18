import { END, START, StateGraph, StateSchema, StreamChannel } from "@langchain/langgraph";
import { z } from "zod";

export interface NodeStatus {
  node: string;
  status: "running" | "complete" | "error";
  error?: string;
}

export interface ProtocolEvent {
  method: string;
  params: { namespace: string[]; data?: any };
}

export function nodeStatusFromEvent(event: ProtocolEvent): NodeStatus | null {
  if (event.method !== "tasks" || event.params.namespace.length !== 0) return null;
  const data = event.params.data;
  if (!data || typeof data.name !== "string") return null;
  if (data.error !== undefined && data.error !== null) {
    return { node: data.name, status: "error", error: String(data.error?.message ?? data.error) };
  }
  if ("result" in data) return { node: data.name, status: "complete" };
  if ("input" in data) return { node: data.name, status: "running" };
  return null;
}

export function createNodeStatusTransformer() {
  return () => {
    const channel = StreamChannel.remote<NodeStatus>("node-status");
    const running = new Set<string>();
    return {
      init: () => ({ nodeStatus: channel }),
      process(event: ProtocolEvent): boolean {
        const s = nodeStatusFromEvent(event);
        if (s) {
          channel.push(s);
          if (s.status === "running") running.add(s.node);
          else running.delete(s.node);
        } else if (event.method === "lifecycle" && event.params.namespace.length === 0 && event.params.data?.event === "failed") {
          for (const node of running) channel.push({ node, status: "error", error: String(event.params.data.error) });
          running.clear();
        }
        return true;
      },
    };
  };
}

const State = new StateSchema({ text: z.string().default("") });

export function buildObservedGraph(failAt?: string) {
  const step = (name: string) => () => {
    if (name === failAt) throw new Error("boom");
    return { text: name };
  };
  return new StateGraph(State)
    .addNode("plan", step("plan"))
    .addNode("work", step("work"))
    .addNode("report", step("report"))
    .addEdge(START, "plan")
    .addEdge("plan", "work")
    .addEdge("work", "report")
    .addEdge("report", END)
    .compile({ transformers: [createNodeStatusTransformer()] });
}

export interface Collected {
  statuses: NodeStatus[];
  failed: boolean;
}

export async function collectNodeStatuses(graph: ReturnType<typeof buildObservedGraph>, input: object = {}): Promise<Collected> {
  const statuses: NodeStatus[] = [];
  let failed = false;
  try {
    const run = await (graph as unknown as { streamEvents: (i: object, o: object) => Promise<AsyncIterable<ProtocolEvent>> }).streamEvents(input, { version: "v3" });
    for await (const event of run) if (event.method === "custom:node-status") statuses.push(event.params.data as NodeStatus);
  } catch {
    failed = true;
  }
  return { statuses, failed };
}

export function latestByNode(statuses: NodeStatus[]): NodeStatus[] {
  const byNode = new Map<string, NodeStatus>();
  for (const s of statuses) byNode.set(s.node, s);
  return [...byNode.values()];
}
