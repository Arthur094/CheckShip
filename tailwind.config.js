/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    light: '#f8fafc',   // slate-50
                    dark: '#0f172a',    // slate-900
                },
                surface: {
                    light: '#ffffff',
                    dark: '#1e293b',    // slate-800
                },
                slate: {
                    main: '#334155', // slate-700
                }
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
