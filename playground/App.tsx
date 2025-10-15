import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      className="flex items-center justify-center rounded-full bg-green-700 px-6 py-3 font-bold tracking-tight text-white uppercase hover:bg-white hover:text-green-700 focus:ring-2 focus:ring-green-700/25 focus:outline-none"
      onClick={() => setCount((prev) => prev + 1)}
    >
      Hello, {count}
    </button>
  );
}
