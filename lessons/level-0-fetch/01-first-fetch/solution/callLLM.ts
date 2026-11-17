interface CallArgs {
  fetchFn: typeof fetch;
  url: string;
  apiKey: string;
  model: string;
  question: string;
}

export async function callLLM({ fetchFn, url, apiKey, model, question }: CallArgs): Promise<string> {
  const res = await fetchFn(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: question }] }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}
