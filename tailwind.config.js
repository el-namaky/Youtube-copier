/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#09090b",
                foreground: "#fafafa",
                card: "#18181b",
                'card-foreground': "#fafafa",
                primary: "#8b5cf6",
                'primary-foreground': "#fafafa",
                muted: "#27272a",
                'muted-foreground': "#a1a1aa",
                accent: "#27272a",
                'accent-foreground': "#fafafa",
                border: "#27272a",
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
            }
        },
    },
    plugins: [],
}
