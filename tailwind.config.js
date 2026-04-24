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
        paper: "#f6efe5",
        ink: "#231913",
        muted: "#6f6257",
        line: "#d8c9b4",
        card: "#fbf5ec",
        surface: "#f0e4d3",
        command: "#eadbc7",
        accent: "#bd6f41",
        accentSoft: "#6f8fb2"
      },
      fontFamily: {
        sans: ["Inter", "Aptos", "Segoe UI Variable", "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Consolas", "monospace"]
      },
      boxShadow: {
        soft: "0 24px 70px rgba(96, 64, 38, 0.14)",
        key: "0 4px 0 rgba(35, 25, 19, 0.18)"
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};
