import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        card: "var(--color-card)",
        border: "var(--color-border)",
        primary: "var(--color-primary)",
        "text-sec": "var(--color-text-sec)",
        "text-muted": "var(--color-text-muted)",
        blue: "var(--color-blue)",
        purple: "var(--color-purple)",
        pink: "var(--color-pink)",
      },
    },
  },
  plugins: [],
};
export default config;
