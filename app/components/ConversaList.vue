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

const lastSigById = ref<Record<number, string>>({})

function tocarSom() {
  const a = audio
  if (!a) return
  a.currentTime = 0
  void a.play()
}

watch(
  () => props.conversas.map(c => ({
    id: c.id,
    ultima: (c.ultimaMensagem || '').trim(),
    direcao: c.ultimaDirecao,
    tipo: c.ultimaTipo
  })),
  (lista) => {
    if (Object.keys(lastSigById.value).length === 0) {
      const init: Record<number, string> = {}
      for (const c of lista) init[c.id] = `${c.direcao}|${c.tipo}|${c.ultima}`
      lastSigById.value = init
      return
    }

    for (const c of lista) {
      const sig = `${c.direcao}|${c.tipo}|${c.ultima}`
      const prev = lastSigById.value[c.id]
      if (prev === sig) continue

      lastSigById.value[c.id] = sig

      console.log('[SOM DEBUG]', {
        id: c.id,
        ultima: c.ultima,
        direcao: c.direcao,
        tipo: c.tipo,
        sigAtual: sig,
        sigAnterior: prev
      })

      if (c.direcao === 'ENTRADA') {
        tocarSom()
        break
      }
    }
  },
  { deep: true }
)
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
