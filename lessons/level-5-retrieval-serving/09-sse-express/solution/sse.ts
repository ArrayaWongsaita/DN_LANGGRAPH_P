export interface SseMessage {
  event?: string;
  data: unknown;
  id?: string | number;
}

export function formatSse(message: SseMessage): string {
  let out = "";
  if (message.id !== undefined) out += `id: ${message.id}\n`;
  if (message.event !== undefined) out += `event: ${message.event}\n`;
  const lines = typeof message.data === "string" ? message.data.split("\n") : [JSON.stringify(message.data)];
  for (const line of lines) out += `data: ${line}\n`;
  return `${out}\n`;
}

export function sseHeaders(): Record<string, string> {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

export interface Sink {
  write(chunk: string): unknown;
  end(): unknown;
}

export async function streamToSink(source: AsyncIterable<{ type?: string }>, sink: Sink, signal: AbortSignal): Promise<void> {
  try {
    for await (const item of source) {
      if (signal.aborted) break;
      sink.write(formatSse({ event: item.type, data: item }));
    }
  } catch (error) {
    if (!signal.aborted) {
      sink.write(formatSse({ event: "error", data: { message: error instanceof Error ? error.message : String(error) } }));
    }
  } finally {
    sink.end();
  }
}
