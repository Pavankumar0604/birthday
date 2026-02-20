/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: "#f4d03f",
                background: "#0a0a1a", // strict dark purple-black
                cosmic: "#1a0a2e",
                surface: "#11112b",
                "heart-pink": {
                    400: "#ff69b4",
                    500: "#ff1493"
                }
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(244, 208, 63, 0.5)',
                'glow-strong': '0 0 40px rgba(244, 208, 63, 0.8)',
                'heart-glow': '0 0 15px rgba(255, 105, 180, 0.6)',
            }
        },
        keyframes: {
            shimmer: {
                '0%': { transform: 'translateX(-150%) skewX(-12deg)' },
                '100%': { transform: 'translateX(150%) skewX(-12deg)' },
            }
        },
        animation: {
            shimmer: 'shimmer 2.5s infinite',
        }
    },
    plugins: [],
}
