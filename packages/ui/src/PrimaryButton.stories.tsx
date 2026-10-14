import type { Meta, StoryObj } from "@storybook/react-vite";

import { PrimaryButton } from "./PrimaryButton";

const meta = {
  title: "PrimaryButton",
  component: PrimaryButton,
  args: { children: "Save" },
} satisfies Meta<typeof PrimaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
