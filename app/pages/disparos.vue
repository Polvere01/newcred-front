<template>
    <main class="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gray-50">
        <div class="w-full max-w-lg bg-white border rounded-2xl shadow-sm p-6">

            <button type="button" @click="voltar"
                class="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
            </button>
            <h1 class="text-xl font-semibold mb-1">Disparo em massa</h1>
            <p class="text-sm text-gray-500 mb-6">Envio de template via WhatsApp Cloud API</p>

            <form class="space-y-4" @submit.prevent="disparar">
                <div>
                    <label class="block text-sm text-gray-700 mb-1">Template</label>
                    <input v-model="template"
                        class="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="ex: newcred_positivo" />
                </div>

                <div>
                    <label class="block text-sm text-gray-700 mb-1">Planilha (xlsx) ou (csv)</label>
                    <input type="file" accept=".xlsx,.csv,text/csv,application/vnd.ms-excel" class="w-full"
                        @change="onFile" />
                    <p class="text-xs text-gray-500 mt-1">
                        Aceita XLSX ou CSV. Precisa ter colunas: TELEFONE1 e NOME
                    </p>
                </div>

                <button class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                    :disabled="busy || !template || !file">
                    {{ busy ? 'Disparando...' : 'Disparar' }}
                </button>

                <div v-if="erro" class="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                    {{ erro }}
                </div>

                <div v-if="resultado" class="text-sm bg-gray-50 border rounded-lg p-3">
                    <div>Total: <b>{{ resultado.total }}</b></div>
                    <div>Enviados: <b>{{ resultado.enviados }}</b></div>
                    <div>Falhas: <b>{{ resultado.falhas }}</b></div>

                    <details v-if="resultado.erros?.length" class="mt-2">
                        <summary class="cursor-pointer">Ver erros</summary>
                        <ul class="mt-2 space-y-1">
                            <li v-for="(e, i) in resultado.erros" :key="i" class="text-xs text-gray-700">
                                {{ e.telefone }} - {{ e.nome }} — <span class="text-red-600">{{ e.motivo }}</span>
                            </li>
                        </ul>
                    </details>
                </div>
            </form>
        </div>
    </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

// 1️⃣ pega o composable
const chatApi = useChatApi()

// 2️⃣ estados da tela
const template = ref('')
const file = ref<File | null>(null)

const busy = ref(false)
const erro = ref<string | null>(null)
const resultado = ref<any>(null)

// 3️⃣ handler do input file
function onFile(ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0] || null
    file.value = f
}


function voltar() {
    navigateTo('/')
}

async function disparar() {
    erro.value = null
    resultado.value = null
    busy.value = true

    try {
        resultado.value = await chatApi.disparoTemplate(
            template.value,
            file.value!
        )
    } catch (e: any) {
        erro.value =
            e?.data?.message ||
            e?.message ||
            'Falha no disparo'
    } finally {
        busy.value = false
    }
}
</script>
