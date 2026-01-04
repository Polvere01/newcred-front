<template>
    <main class="min-h-[calc(100vh-56px)] px-4 flex items-center justify-center">
        <div class="w-full max-w-md bg-white border rounded-2xl shadow-sm p-6">

            <button type="button" @click="voltar"
                class="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
            </button>
            <h1 class="text-xl font-semibold mb-4">Cadastrar operador</h1>

            <form class="space-y-3" @submit.prevent="salvar">
                <div>
                    <label class="block text-sm text-gray-700 mb-1">Nome</label>
                    <input v-model="form.nome" class="w-full border p-2 rounded-lg" placeholder="Nome" />
                </div>

                <div>
                    <label class="block text-sm text-gray-700 mb-1">Email</label>
                    <input v-model="form.email" class="w-full border p-2 rounded-lg" placeholder="Email" />
                </div>

                <div>
                    <label class="block text-sm text-gray-700 mb-1">Senha</label>
                    <input v-model="form.senha" type="password" class="w-full border p-2 rounded-lg"
                        placeholder="Senha" />
                </div>

                <div>
                    <label class="block text-sm text-gray-700 mb-1">Função</label>

                    <select v-model="form.role" class="w-full border p-2 rounded-lg bg-white">
                        <option disabled value="">Selecione a função</option>
                        <option value="OPERADOR">Operador</option>
                        <option value="SUPERVISOR">Supervisor</option>
                    </select>

                    <div v-if="form.role === 'OPERADOR'">
                        <label class="block text-sm text-gray-700 mb-1">Números / Produto</label>

                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" value="CLT" v-model="produtosSelecionados" />
                            CLT
                        </label>

                        <label class="flex items-center gap-2 text-sm mt-1">
                            <input type="checkbox" value="INSS" v-model="produtosSelecionados" />
                            INSS
                        </label>

                        <p class="text-xs text-gray-500 mt-1">Pode marcar até 2.</p>
                    </div>

                </div>

                <button
                    class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                    :disabled="loading">
                    {{ loading ? 'Salvando...' : 'Cadastrar' }}
                </button>

                <p v-if="erro" class="text-red-600 text-sm">{{ erro }}</p>
                <p v-if="ok" class="text-green-700 text-sm">Operador criado.</p>
            </form>
        </div>
    </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const config = useRuntimeConfig()
const baseURL = config.public.apiBase as string

const loading = ref(false)
const erro = ref<string | null>(null)
const ok = ref(false)

const phoneNumberIdByProduto: Record<'CLT' | 'INSS', string> = {
    CLT: '',
    INSS: '956785587513587',
}

const user = computed(() => {
    if (import.meta.server) return null
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
})

const produtosSelecionados = ref<Array<'CLT' | 'INSS'>>(['CLT'])

const form = reactive({
    nome: '',
    email: '',
    senha: '',
    role: 'OPERADOR',
    supervisorId: null as number | null,
    phoneNumberIds: [] as string[],
})

function voltar() {
    navigateTo('/')
}

async function salvar() {
    erro.value = null
    ok.value = false
    loading.value = true

    try {
        const token = localStorage.getItem('token')
        if (!token) return navigateTo('/login')

        const u = user.value // { id, nome, email, role }

        const phoneNumberIds =
            form.role === 'OPERADOR'
                ? produtosSelecionados.value.map(p => phoneNumberIdByProduto[p])
                : []

        const payload = {
            nome: form.nome,
            email: form.email,
            senha: form.senha,
            role: form.role,
            supervisorId:
                form.role === 'OPERADOR' && u?.role === 'SUPERVISOR'
                    ? u.id
                    : null,
            phoneNumberIds,
        }



        await $fetch(`${baseURL}/operadores`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: payload,
        })

        ok.value = true
        form.nome = ''
        form.email = ''
        form.senha = ''
        form.role = 'OPERADOR'
    } catch (e: any) {
        erro.value = e?.data?.message || e?.message || 'Falha ao cadastrar'
    } finally {
        loading.value = false
    }
}
produtosSelecionados.value = ['INSS']
</script>
