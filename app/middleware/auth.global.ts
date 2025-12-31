export default defineNuxtRouteMiddleware((to) => {
    // middleware pode rodar no server; localStorage só no client
    if (import.meta.server) return

    const token = localStorage.getItem('token')

    // deixa a página /login aberta
    if (!token && to.path !== '/login') {
        return navigateTo('/login')
    }

    // se já tem token e tá indo pro /login, manda pra home
    if (token && to.path === '/login') {
        return navigateTo('/')
    }
})
