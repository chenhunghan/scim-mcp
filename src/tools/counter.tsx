import { useState } from "react";
import { ToolMetadata } from "xmcp";

export const metadata: ToolMetadata = {
  name: "counter",
  description: "Interactive counter widget",
  _meta: {
    openai: {
      toolInvocation: {
        invoking: "Loading counter...",
        invoked: "Counter ready!",
      },
      widgetAccessible: true,
    },
  },
};

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}