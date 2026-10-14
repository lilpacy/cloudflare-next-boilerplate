import type { Preview } from "@storybook/react-vite";

import "./preview.css";

const preview: Preview = {
  parameters: {
    // Without this, a11y violations only show as warnings in the Storybook UI
    // and never fail `storybook:test`.
    a11y: { test: "error" },
  },
};

export default preview;
