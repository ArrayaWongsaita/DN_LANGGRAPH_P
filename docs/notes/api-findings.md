# LangGraph API findings (verified against @langchain/langgraph 1.7.5, zod 4.6.7)

Source: official quickstart (docs.langchain.com/oss/javascript/langgraph/quickstart) + a runnable spike. **All lessons use `StateSchema` (the style the current docs use), not `Annotation`.**

## Imports
```ts
import { StateGraph, StateSchema, ReducedValue, MessagesValue, START, END } from "@langchain/langgraph";
import { z } from "zod";
```

## State
```ts
const State = new StateSchema({
  question: z.string().default(""),          // plain field: last write wins
  answer: z.string().default(""),
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),                 // type of each update
    reducer: (cur: string[], next: string) => [...cur, next],
  }),
});
```
- `messages: MessagesValue` is the built-in append reducer for chat messages (used from Part 3).
- Defaults apply: `graph.invoke({})` fills `question: ""` etc.
- Input is validated: `invoke({ question: 5 })` throws `Validation failed for field "question"...`.
- A reducer also applies to input: `invoke({ score: 5 })` with a sum reducer starts at 0+5.

## Graph
```ts
const graph = new StateGraph(State)
  .addNode("a", (s) => ({ answer: s.question + "!", log: "a" }))   // returns a partial update
  .addNode("b", (s) => ({ answer: s.answer + "?", log: "b" }))
  .addEdge(START, "a")
  .addConditionalEdges("a", (s) => (s.answer.length > 3 ? "b" : END), ["b", END])
  .addEdge("b", END)
  .compile();
await graph.invoke({ question: "hello" });   // -> { question, answer: "hello!?", log: ["a","b"] }
```
- Node functions receive state and return a partial update (async allowed).
- `addConditionalEdges(from, router, [possibleTargets])`; router returns a node name or `END`.

## Streaming
- `for await (const c of await graph.stream(input, { streamMode: "updates" }))` -> `{ nodeName: update }` per step.
- `streamMode: "values"` -> full state after each step, **including the initial input state** (2 nodes => 3 chunks).

## Behaviours worth teaching
- Two parallel nodes writing the same plain field in one step -> error `LastValue can only receive one value per step`. With a reducer the writes combine.
- Sequential writes to a plain field: later overwrites earlier.
- `compile()` throws `Node \`x\` is not reachable` when START has no path to a node.

## Decisions
- State style: `StateSchema` + zod. Lesson 16 teaches it; later lessons reuse.
- Lesson 16's "extra key" exercise: see behaviour in lesson implementation (verify while writing).

## Gotchas found while writing Part 2 (verified by tests)
- A node name must not equal a state field name (`answer is already being used as a state attribute...`). Lessons name nodes `ask`, `writeDraft`, `improve`.
- A graph whose nodes write nothing returns `undefined` from `invoke`, so defaults tests make a node echo a field.
