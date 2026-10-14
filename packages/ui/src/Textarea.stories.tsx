import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./Textarea";

// The component renders a bare <textarea>; the accessible name comes from the caller,
// so every story provides one (aria-label here) to satisfy the a11y check.
const meta = {
  title: "Textarea",
  component: Textarea,
  args: { "aria-label": "Description", placeholder: "Enter a description", rows: 4 },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "Milk, eggs, bread" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read only" },
};
