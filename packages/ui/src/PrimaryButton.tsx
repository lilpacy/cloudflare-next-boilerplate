import type { ComponentProps } from "react";

export function PrimaryButton({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
}
