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
          bg: "#06080D",
          surface: "#0B0F18",
          card: "#101624",
          elevated: "#161E30",
          border: "#1E293B",
          borderLight: "rgba(255, 255, 255, 0.07)",
          blueBorder: "rgba(59, 130, 246, 0.2)",
          blue: {
            DEFAULT: "#387BFF",
            primary: "#1A73E8",
            bright: "#387BFF",
            soft: "#60A5FA",
            light: "#93C5FD",
            dark: "#0C2340",
            deep: "#081326",
          },
          muted: "#94A3B8",
          subtle: "#64748B",
        },
      },
      backgroundImage: {
        "gemini-radial": "radial-gradient(circle at 50% 0%, rgba(56, 123, 255, 0.18) 0%, rgba(6, 8, 13, 0) 70%)",
        "gemini-glow": "radial-gradient(circle at 50% 50%, rgba(56, 123, 255, 0.12) 0%, transparent 60%)",
      },
      boxShadow: {
        "gemini-blue": "0 0 24px -2px rgba(56, 123, 255, 0.35)",
        "gemini-subtle": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
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
