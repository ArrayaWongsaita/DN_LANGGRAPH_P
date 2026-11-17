interface StreamArgs {
  fetchFn: typeof fetch;
  url: string;
  apiKey: string;
  model: string;
  question: string;
}

export async function* streamText({ fetchFn, url, apiKey, model, question }: StreamArgs): AsyncGenerator<string> {
  const res = await fetchFn(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, stream: true, messages: [{ role: "user", content: question }] }),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") return;
      const content = JSON.parse(payload).choices?.[0]?.delta?.content;
      if (typeof content === "string" && content !== "") yield content;
    }
  }
}
