import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { createAgent, llmToolSelectorMiddleware, todoListMiddleware, toolEmulatorMiddleware } from "langchain";

type AnyTool = StructuredToolInterface;

export function buildSelectiveAgent(llm: BaseChatModel, selectorLlm: BaseChatModel, tools: AnyTool[]) {
  return createAgent({
    model: llm,
    tools,
    middleware: [llmToolSelectorMiddleware({ model: selectorLlm as never, maxTools: 2, alwaysInclude: ["search"] })],
  });
}

export function buildPlanner(llm: BaseChatModel) {
  return createAgent({ model: llm, tools: [], middleware: [todoListMiddleware()] });
}

export function buildTestAgent(llm: BaseChatModel, emulatorLlm: BaseChatModel, tools: AnyTool[], emulate: string[]) {
  return createAgent({
    model: llm,
    tools,
    middleware: [toolEmulatorMiddleware({ tools: emulate, model: emulatorLlm as never })],
  });
}

export interface TodoItem {
  content: string;
  status: "pending" | "in_progress" | "completed";
}

const LABEL: Record<TodoItem["status"], string> = { pending: "รอ", in_progress: "กำลังทำ", completed: "เสร็จ" };

export function renderTodos(todos: TodoItem[] | undefined): string {
  if (!todos || todos.length === 0) return "(ยังไม่มีแผน)";
  return todos.map((t, i) => `${i + 1}. [${LABEL[t.status]}] ${t.content}`).join("\n");
}

export function toolsToEmulate(tools: { name: string }[], readOnly: string[]): string[] {
  return tools.map((t) => t.name).filter((name) => !readOnly.includes(name));
}
