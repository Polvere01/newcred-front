<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow p-8 border">
      <div class="mb-6">
        <h1 class="text-xl font-semibold">Recuperar senha</h1>
        <p class="text-sm text-gray-500">Digite seu e-mail pra receber o link.</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <input
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          class="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
          :disabled="busy"
        />

        <button
          class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
          :disabled="busy || !email"
        >
          <span v-if="!busy">Enviar</span>
          <span v-else>Enviando...</span>
        </button>

        <button type="button" class="w-full text-sm text-gray-600 hover:underline" @click="navigateTo('/login')">
          Voltar pro login
        </button>

        <div v-if="msg" class="text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg">
          {{ msg }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const busy = ref(false)
const msg = ref<string | null>(null)

async function onSubmit() {
  busy.value = true
  msg.value = null
  try {
    // TODO: endpoint real: POST /auth/forgot { email }
    msg.value = 'Se esse e-mail existir, você vai receber um link em instantes.'
  } finally {
    busy.value = false
  }
}
</script>
