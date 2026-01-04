<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import type { Conversa } from '~/types/chat'
import { formatarTelefone } from '~/utils/phone'


// guarda último texto por conversa
const lastById = ref<Record<number, string>>({})

const props = defineProps<{
  conversas: Conversa[]
  selecionadaId: number | null
}>()

const emit = defineEmits<{
  (e: 'select', conversa: Conversa): void
}>()

let audio: HTMLAudioElement | null = null


onMounted(() => {
  audio = new Audio('/sounds/som.mp3')
  audio.volume = 0.6
})

const guard = useSoundGuard()
// guarda "estado anterior" por conversa
const lastSigById = ref<Record<number, string>>({})

watch(
  () =>
    props.conversas.map(c => ({
      id: c.id,
      ultima: (c.ultimaMensagem || '').trim()
    })),
  (lista) => {
    // primeira carga
    if (Object.keys(lastById.value).length === 0) {
      const init: Record<number, string> = {}
      for (const c of lista) init[c.id] = c.ultima
      lastById.value = init
      return
    }

    for (const c of lista) {
      const prev = lastById.value[c.id]
      const curr = c.ultima

      if (!prev || prev === curr) continue

      // 👇 se foi você que enviou, não toca
      if (guard.value[c.id] === curr) {
        delete guard.value[c.id]
        lastById.value[c.id] = curr
        continue
      }

      // 👉 mensagem nova REAL (cliente)
      tocarSom()
      lastById.value[c.id] = curr
      break
    }
  },
  { deep: true }
)
function tocarSom() {
  const a = audio
  if (!a) return

  try {
    a.currentTime = 0
    void a.play()
  } catch {
    console.warn('Som bloqueado pelo navegador')
  }
}
</script>

<template>
  <aside class="w-80 bg-white border-r flex flex-col">
    <div class="p-4 font-semibold border-b">Conversas</div>

    <div class="flex-1 overflow-y-auto">
      <div v-for="c in conversas" :key="c.id" class="p-4 cursor-pointer hover:bg-gray-100 border-b"
        :class="selecionadaId === c.id ? 'bg-gray-200' : ''" @click="emit('select', c)">
        <div class="font-medium">
          {{ formatarTelefone(c.nome) }}
        </div>
        <div class="text-xs text-gray-500">
          {{ c.operadorNome || '' }}
        </div>
        <div class="text-sm text-gray-500 truncate">
          {{ c.ultimaMensagem }}
        </div>
      </div>
    </div>
  </aside>
</template>
