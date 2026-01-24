import { ref, onMounted } from 'vue'

const isDark = ref(false)

export function useTheme() {
    function apply(dark: boolean) {
        isDark.value = dark
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }

    function toggle() {
        apply(!isDark.value)
    }

    onMounted(() => {
        const saved = localStorage.getItem('theme')

        if (saved === 'dark') apply(true)
        else if (saved === 'light') apply(false)
        else apply(window.matchMedia('(prefers-color-scheme: dark)').matches)
    })

    return { isDark, toggle }
}
