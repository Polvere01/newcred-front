export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return

    // só protege rotas de admin
    if (to.path !== '/novooperador') return

    const token = localStorage.getItem('token')
    const userRaw = localStorage.getItem('user')
    if (!token || !userRaw) return navigateTo('/login')

    const user = JSON.parse(userRaw)
    const canManage =
        user.role === 'ADMIN' ||
        user.role === 'SUPERVISOR' ||
        (Array.isArray(user.roles) && (user.roles.includes('ADMIN') || user.roles.includes('SUPERVISOR')))

    if (!canManage) return navigateTo('/') // ou /forbidden

})