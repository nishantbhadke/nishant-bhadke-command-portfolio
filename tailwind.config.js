/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#0b0b09",
        ink: "#fff4cf",
        muted: "#d5c493",
        line: "#3d3214",
        card: "#17140b",
        surface: "#211b0d",
        command: "#2c240f",
        accent: "#f5bd35",
        accentSoft: "#ffd966"
      },
      fontFamily: {
        sans: ["Manrope", "Aptos", "Segoe UI Variable", "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "Aptos", "Segoe UI Variable", "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Fira Code", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "Consolas", "monospace"]
      },
      boxShadow: {
        soft: "0 24px 70px rgba(0, 0, 0, 0.34)",
        key: "0 4px 0 rgba(0, 0, 0, 0.28)"
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};
