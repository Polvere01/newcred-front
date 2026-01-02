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
                        <option value="ADMIN">Supervisor</option>
                    </select>
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

const form = reactive({
    nome: '',
    email: '',
    senha: '',
    role: 'OPERADOR', // padrão
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

        await $fetch(`${baseURL}/operadores`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        })

        ok.value = true
        form.nome = ''
        form.email = ''
        form.senha = ''
        form.role = ''
    } catch (e: any) {
        erro.value = e?.data?.message || 'Falha ao cadastrar'
    } finally {
        loading.value = false
    }
}
</script>
