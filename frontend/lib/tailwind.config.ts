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
        bg: "#060a12",
        surface: "#0c1220",
        panel: "#101828",
        border: "#1c2d45",
        "border-light": "#243650",
        accent: "#4f8ef7",
        "accent-dim": "rgba(79,142,247,0.12)",
        "blue-bright": "#6fa8ff",
        teal: "#38d9c0",
        white: "#f0f6ff",
        grey: "#8aa0bb",
        dim: "#3a5068",
        red: "#f04f6a",
        amber: "#f5a623",
        green: "#34d399",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;