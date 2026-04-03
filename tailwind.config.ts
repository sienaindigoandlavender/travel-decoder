import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1a1a1a",
        foreground: "#f5f0e8",
        terracotta: { DEFAULT: "#c4613a", light: "#d4826a", dark: "#a14a30" },
        amber: { DEFAULT: "#d4915a", glow: "rgba(212,145,90,0.6)" },
        cream: "#f5f0e8",
        card: "#faf6f1",
        muted: "#8a8078",
        charcoal: "#1a1a1a",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
