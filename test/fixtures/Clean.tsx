import { useState } from "react";

interface CounterProps {
  label: string;
  onChange?: (count: number) => void;
}

export function Counter({ label, onChange }: CounterProps) {
  const [count, setCount] = useState(0);

  return (
    <button
      className="rounded-sm px-4 py-2"
      type="button"
      onClick={() => {
        setCount(count + 1);
        onChange?.(count + 1);
      }}
    >
      {label}: {count}
    </button>
  );
}
