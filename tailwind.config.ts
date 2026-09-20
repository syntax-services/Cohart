import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gemini: {
          // Dark theme (Google Gemini official #131314 / #1E1F20)
          dark: {
            bg: "#131314",
            surface: "#1E1F20",
            elevated: "#282A2C",
            hover: "#333537",
            border: "rgba(255, 255, 255, 0.08)",
            text: "#E3E3E3",
            muted: "#C4C7C5",
            subtle: "#8E918F",
            blue: "#A8C7FA",
            blueHover: "#8AB4F8",
            blueContainer: "rgba(168, 199, 250, 0.12)",
          },
          // Light theme (Google Gemini official #F0F4F9 / #FFFFFF)
          light: {
            bg: "#F0F4F9",
            surface: "#FFFFFF",
            elevated: "#E9EEF6",
            hover: "#E1E7F0",
            border: "rgba(0, 0, 0, 0.08)",
            text: "#1F1F1F",
            muted: "#444746",
            subtle: "#747775",
            blue: "#0B57D0",
            blueHover: "#1A73E8",
            blueContainer: "#D3E3FD",
          },
        },
      },
      boxShadow: {
        "gemini-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "gemini-md": "0 2px 8px -1px rgba(0, 0, 0, 0.08)",
        "gemini-elevated": "0 4px 16px -2px rgba(0, 0, 0, 0.12)",
        "gemini-dark-elevated": "0 4px 20px -2px rgba(0, 0, 0, 0.4)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Google Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
