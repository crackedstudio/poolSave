/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1A',
        secondary: '#00D4D4',
        accent: '#FF8C42',
        text: '#FFFFFF99',
        shadow: {
            secondary: "#184242",
            accent:"#4B3425"
        },
        card: "#E5E7EB",
        highlight: '#5A5A5A',
        bg: "#303030",
        cardbg: "#FFFFFF1A",
        background: "#252525"
      },
      boxShadow: {
        custom: "8px 8px 0 0 rgba(0, 0, 0, 0.8)",
      },
    },
  },
  plugins: [],
}