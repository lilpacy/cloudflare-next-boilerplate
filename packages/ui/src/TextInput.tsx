import type { ComponentProps } from "react";

export function TextInput({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
}
