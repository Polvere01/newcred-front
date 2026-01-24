/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './components/**/*.{vue,js,ts}',
        './pages/**/*.{vue,js,ts}',
        './layouts/**/*.{vue,js,ts}',
        './app.vue',
        './app/**/*.{vue,js,ts}', // (Nuxt 3 às vezes usa /app)
    ],
    safelist: [
        'hover:bg-[color:var(--surface2)]',
        'bg-[color:var(--surface2)]',
        'bg-[color:var(--surface)]',
        'text-[color:var(--text)]',
        'text-[color:var(--muted)]',
        'border-[color:var(--border)]',
    ],
}
