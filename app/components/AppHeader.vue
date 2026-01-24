<template>
  <header class="w-full bg-[color:var(--surface)] border-b border-[color:var(--border)]">
    <div class="px-4 h-14 flex items-center justify-between">
      <div class="flex items-center gap-2 font-semibold text-[color:var(--text)]">
        <span>NewCred</span>
        <span v-if="user" class="text-sm text-gray-400">• {{ user.nome }}</span>
      </div>

      <!-- DIREITA: botão tema + hamburger -->
      <div class="flex items-center gap-2">
        <!-- botão tema -->
        <button
          class="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface2)]"
          @click="toggleTheme" title="Alternar tema">
          <span v-if="isDark">🌙</span>
          <span v-else>☀️</span>
        </button>

        <!-- menu -->
        <div class="relative">
          <button
            class="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface2)] active:bg-[color:var(--surface2)]"
            @click="toggleMenu" aria-label="Abrir menu">
            <svg class="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div v-if="open"
            class="absolute right-0 mt-3 w-52 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl overflow-hidden z-50">
            <button v-if="podeGerenciarOperadores" @click="goDisparo"
              class="w-full text-left px-4 py-3 text-sm hover:bg-[color:var(--surface2)] flex items-center gap-2 text-[color:var(--text)]">
              <span class="inline-block h-2 w-2 rounded-full bg-green-500"></span>
              Disparo em massa
            </button>

            <button v-if="podeGerenciarOperadores" @click="goNovoOperador"
              class="w-full text-left px-4 py-3 text-sm hover:bg-[color:var(--surface2)] flex items-center gap-2 text-[color:var(--text)]">
              <span class="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
              Novo operador
            </button>

            <button @click="logout"
              class="w-full text-left px-4 py-3 text-sm hover:bg-[color:var(--surface2)] text-red-600 flex items-center gap-2 border-t border-[color:var(--border)]">
              <span class="inline-block h-2 w-2 rounded-full bg-red-500"></span>
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)

// tema
const { isDark, toggle: toggleTheme } = useTheme()

const user = computed(() => {
  if (import.meta.server) return null
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
})

const podeGerenciarOperadores = computed(
  () => user.value?.role === 'ADMIN' || user.value?.role === 'SUPERVISOR'
)

function toggleMenu() {
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
