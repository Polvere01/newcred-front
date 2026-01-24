<template>
  <div class="min-h-screen bg-[color:var(--bg)] flex items-center justify-center p-4">
    <div
      class="w-full max-w-md bg-[color:var(--surface)] rounded-2xl shadow-lg p-8 border-2 border-[color:var(--border)]">
      <!-- Logo + nome -->
      <div class="flex flex-col items-center gap-3 mb-8">
        <!-- Troca esse src pelo teu -->
        <img src="/logo.png" alt="Logo" class="h-14 w-auto" />
        <h1 class="text-xl font-semibold text-[color:var(--text)]">NewCred</h1>
        <p class="text-sm text-[color:var(--muted)]">Acesse sua conta</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium text-[color:var(--muted)] mb-1">E-mail</label>
          <input v-model="email" type="email" autocomplete="email" placeholder="seu@email.com"
            class="w-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            :disabled="busy" />
        </div>

        <div>
          <label class="block text-sm font-medium text-[color:var(--muted)] mb-1">Senha</label>
          <input v-model="senha" type="password" autocomplete="current-password" placeholder="••••••••"
            class="w-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            :disabled="busy" />
        </div>

        <div class="flex items-center justify-between">
          <button type="button" class="text-sm text-green-700 hover:underline" @click="onForgot" :disabled="busy">
            Esqueci a senha
          </button>

          <button type="submit"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
            :disabled="busy || !email || !senha">
            <span v-if="!busy">Entrar</span>
            <span v-else>Entrando...</span>
          </button>
        </div>

        <div v-if="erro"
          class="text-sm text-red-600 bg-red-50 border-[color:var(--border)] border-[color:var(--border)]-red-200 p-3 rounded-lg">
          {{ erro }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const config = useRuntimeConfig()
const email = ref('')
const senha = ref('')
const erro = ref<string | null>(null)
const busy = ref(false)

async function onSubmit() {
  erro.value = null
  busy.value = true

  try {
    const baseURL = config.public.apiBase as string

    const resp = await $fetch<{ token: string; user: any }>(
      `${baseURL}/auth/login`,
      {
        method: 'POST',
        body: {
          email: email.value,
          senha: senha.value,
        },
      }
    )

    // salva token e usuário
    localStorage.setItem('token', resp.token)
    localStorage.setItem('user', JSON.stringify(resp.user))

    // vai pro chat
    await navigateTo('/')
  } catch (e: any) {
    erro.value =
      e?.data?.message ||
      e?.message ||
      'E-mail ou senha inválidos.'
  } finally {
    busy.value = false
  }
}

function onForgot() {
  // do jeito mais simples: manda pra uma rota /forgot
  navigateTo('/forgot')
}
</script>
