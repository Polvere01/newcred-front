<template>
  <header class="w-full bg-white border-b">
    <div class="px-4 h-14 flex items-center justify-between">
      <div class="font-semibold text-gray-900">NewCred</div>

      <div class="relative">
        <!-- Botão hamburger -->
        <button
          class="h-9 w-9 inline-flex items-center justify-center rounded-lg border bg-white hover:bg-gray-50 active:bg-gray-100"
          @click="toggle" aria-label="Abrir menu">
          <svg class="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Dropdown (fica acima do overlay) -->
        <div v-if="open" class="absolute right-0 mt-2 w-52 rounded-xl border bg-white shadow-lg overflow-hidden z-50">

          <button v-if="podeGerenciarOperadores" @click="goDisparo"
            class="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2">
            <span class="inline-block h-2 w-2 rounded-full bg-green-500"></span>
            Disparo em massa
          </button>

          <button v-if="podeGerenciarOperadores" @click="goNovoOperador"
            class="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2">
            <span class="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
            Novo operador
          </button>

          <button @click="logout"
            class="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 border-t">
            <span class="inline-block h-2 w-2 rounded-full bg-red-500"></span>
            Sair
          </button>
        </div>
      </div>
    </div>

    <!-- overlay por trás do dropdown, clicável -->
    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)

const user = computed(() => {
  if (import.meta.server) return null
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
})

const podeGerenciarOperadores = computed(() => user.value?.role === 'ADMIN' || user.value?.role === 'SUPERVISOR')

function toggle() {
  open.value = !open.value
}

function goNovoOperador() {
  open.value = false
  navigateTo('/novooperador')
}

function goDisparo() {
  open.value = false
  navigateTo('/disparos')
}
function logout() {
  open.value = false
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  navigateTo('/login')
}
</script>
