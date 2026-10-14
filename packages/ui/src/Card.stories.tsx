import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card } from "./Card";

const meta = {
  title: "Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <h2 className="text-xl font-semibold mb-2">Card title</h2>
        <p className="text-gray-600">Body text inside the card.</p>
      </>
    ),
  },
};
