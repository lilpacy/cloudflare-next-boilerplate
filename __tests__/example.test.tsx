import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

function ExampleComponent({ message }: { message: string }) {
  return <div role="alert">{message}</div>;
}

describe("Example Test", () => {
  it("renders component with message", () => {
    render(<ExampleComponent message="Hello, World!" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Hello, World!");
  });

  it("basic assertion works", () => {
    expect(1 + 1).toBe(2);
  });
});
