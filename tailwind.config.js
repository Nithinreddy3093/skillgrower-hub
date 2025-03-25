/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enables dark mode switching
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // Ensure Tailwind scans all files
  theme: {
    extend: {
      colors: {
        border: "hsl(214.3, 31.8%, 91.4%)", // Default border color
        "border-dark": "hsl(217.2, 32.6%, 17.5%)", // Dark mode border
        background: "hsl(222.2, 84%, 4.9%)",
        foreground: "hsl(210, 40%, 98%)",
      },
    },
  },
  plugins: [],
};

