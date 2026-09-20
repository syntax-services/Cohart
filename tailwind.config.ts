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
        cohart: {
          bg: "#07090E",
          surface: "#0D111A",
          card: "#111724",
          elevated: "#182032",
          border: "#1E293B",
          borderLight: "rgba(255, 255, 255, 0.08)",
          cyan: "#00F0FF",
          azure: "#0066FF",
          muted: "#94A3B8",
          subtle: "#64748B",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cohart-gradient": "linear-gradient(135deg, #00F0FF 0%, #0066FF 100%)",
        "cohart-glow": "radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.15) 0%, rgba(0, 102, 255, 0.05) 50%, transparent 100%)",
      },
      boxShadow: {
        "electric-cyan": "0 0 20px -3px rgba(0, 240, 255, 0.35)",
        "electric-azure": "0 0 25px -4px rgba(0, 102, 255, 0.4)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
