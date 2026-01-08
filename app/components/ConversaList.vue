<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import type { Conversa } from '~/types/chat'
import { formatarTelefone } from '~/utils/phone'

const unreadById = ref<Record<number, boolean>>({})
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
        // só marca como não lida se NÃO estiver aberta
        if (props.selecionadaId !== c.id) {
          unreadById.value[c.id] = true
        }

        tocarSom()
        break
      }
    }
  },
  { deep: true }
)
</script>

<template>
  <aside class="w-80 bg-[#1c1c1c] border-r flex flex-col text-white">
    <div class="p-4 font-semibold border-b">Conversas</div>

    <div class="flex-1 overflow-y-auto">
      <div v-for="c in conversas" :key="c.id" class="p-4 cursor-pointer hover:bg-[#2b2b2b] border-b"
        :class="selecionadaId === c.id ? 'bg-[#2b2b2b]' : ''"
        @click="() => { unreadById[c.id] = false; emit('select', c) }">
        <div class="font-medium flex items-center justify-between gap-2">
          <span>{{ formatarTelefone(c.nome) }}</span>

          <span v-if="unreadById[c.id]" class="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" title="Nova mensagem" />
        </div>

        <div class="text-xs text-[#c9c9c9] ">
          {{ c.operadorNome || '' }}
        </div>
        <div class="text-sm text-[#c9c9c9] truncate">
          {{ c.ultimaMensagem }}
        </div>
      </div>
    </div>
  </aside>
</template>
