/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1d72f3',
                    dark: '#1557c7',
                },
                'background-light': '#f5f7fa',
                'background-dark': '#0f172a',
                'surface-light': '#ffffff',
                'surface-dark': '#1e293b',
                'slate-main': '#1e293b',
                emerald: {
                    500: '#10b981',
                    600: '#059669',
                },
                orange: {
                    500: '#f97316',
                    600: '#ea580c',
                },
                cyan: {
                    500: '#06b6d4',
                    600: '#0891b2',
                },
            },
            fontFamily: {
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
        },
    },
    plugins: [],
}
