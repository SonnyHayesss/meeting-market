/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10151b",
        coal: "#161b20",
        gold: "#d9a76a",
        cream: "#f7efe1",
        ember: "#d95d4f"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(5, 8, 12, 0.28)"
      }
    }
  },
  plugins: []
};
