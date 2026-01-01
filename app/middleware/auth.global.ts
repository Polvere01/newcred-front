export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return

    const token = localStorage.getItem('token')

    // não logado → manda pro login
    if (!token && to.path !== '/login') {
        return navigateTo('/login')
    }

    // já logado → não deixa voltar pro login
    if (token && to.path === '/login') {
        return navigateTo('/')
    }
})