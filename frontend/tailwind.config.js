/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      md: "768px",
      lg: "1024px",
    },

    fontFamily: {
      satoshi: ['Satoshi', 'sans-serif'],
      clash: ['Clash-Display', 'sans-serif'],
    },

    extend: {
      colors: {
        Disabled: "#7F8487",
        White: "#FFFFFF",
        MilkWhite: "#F8FAFC",
        Gray900: "#393646",
        Gray800: "#3C3D37",
      },
      animation: {
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        scaleIn: {
          '0%': {
            transform: 'scale(0)',
            opacity: '0'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          },
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
}