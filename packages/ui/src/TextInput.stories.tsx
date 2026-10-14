import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextInput } from "./TextInput";

// The component renders a bare <input>; the accessible name comes from the caller,
// so every story provides one (aria-label here) to satisfy the a11y check.
const meta = {
  title: "TextInput",
  component: TextInput,
  args: { "aria-label": "Title", placeholder: "Enter a title" },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "Buy milk" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read only" },
};
