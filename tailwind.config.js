import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea', // Hover purple
                    700: '#7e22ce', // Primary purple brand
                    800: '#6b21a8',
                    900: '#581c87', // Dark purple
                    950: '#3b0764',
                },
                brand: {
                    DEFAULT: '#7e22ce',
                    hover: '#9333ea',
                    dark: '#581c87',
                    light: '#f3e8ff',
                    subtle: '#faf5ff',
                },
            },
        },
    },
    plugins: [],
};

