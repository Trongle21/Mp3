import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0a",
          secondary: "#121212",
          elevated: "#1a1a1a",
          highlight: "#282828",
        },
        accent: {
          DEFAULT: "#1db954",
          hover: "#1ed760",
          dim: "rgba(29,185,84,0.15)",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a0a0a0",
          muted: "#666666",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
        },
        danger: "#e91429",
        warning: "#f59e0b",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["2.5rem", { fontWeight: "700" }],
        h2: ["1.75rem", { fontWeight: "600" }],
        h3: ["1.25rem", { fontWeight: "600" }],
        body: ["0.875rem", { fontWeight: "400" }],
        caption: ["0.75rem", { fontWeight: "400" }],
      },
      spacing: {
        sidebar: "240px",
        player: "90px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "fade-slide-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        "fade-slide-in": "fade-slide-in 300ms ease-out",
      },
      backdropBlur: {
        player: "40px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
