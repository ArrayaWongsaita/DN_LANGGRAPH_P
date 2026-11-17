export interface Turn {
  role: "user" | "assistant";
  content: string;
}

interface ChatArgs {
  fetchFn: typeof fetch;
  url: string;
  apiKey: string;
  model: string;
  system: string;
  history: Turn[];
  question: string;
}

export async function chat({ fetchFn, url, apiKey, model, system, history, question }: ChatArgs): Promise<string> {
  const messages = [{ role: "system", content: system }, ...history, { role: "user", content: question }];
  const res = await fetchFn(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

export function appendTurn(history: Turn[], question: string, answer: string): Turn[] {
  return [...history, { role: "user", content: question }, { role: "assistant", content: answer }];
}
