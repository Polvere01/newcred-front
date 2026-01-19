<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import type { Conversa } from '~/types/chat'
import { formatarTelefone } from '~/utils/phone'

const unreadById = ref<Record<number, number>>({})
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

function previewUltima(c: Conversa) {
  // se tiver texto, usa ele
  const txt = (c.ultimaMensagem || '').trim()
  if (txt) return txt

  // senão, cai pro tipo
  switch (c.ultimaTipo) {
    case 'audio': return '🎤 Áudio'
    case 'image': return '🖼️ Imagem'
    case 'video': return '🎬 Vídeo'
    case 'imagem': return '🖼️ Imagem'
    case 'pdf': return '📄 PDF'
    case 'document': return '📎 Documento'
    default: return ''
  }
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
        if (props.selecionadaId !== c.id) {
          unreadById.value[c.id] = (unreadById.value[c.id] || 0) + 1
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

    <div class="flex-1 overflow-y-auto custom-scroll">
      <div v-for="c in conversas" :key="c.id" class="p-4 cursor-pointer hover:bg-[#2b2b2b] border-b"
        :class="selecionadaId === c.id ? 'bg-[#2b2b2b]' : ''"
        @click="() => { unreadById[c.id] = 0; emit('select', c) }">
        <div class="font-medium flex items-center justify-between gap-2">
          <span>{{ formatarTelefone(c.nome) }}</span>

          <span v-if="(unreadById[c.id] || 0) > 0"
            class="min-w-[20px] h-5 px-2 rounded-full bg-green-500 text-black text-xs flex items-center justify-center shrink-0">
            {{ unreadById[c.id] }}
          </span>
        </div>

        <div class="text-xs text-[#c9c9c9] ">
          {{ c.operadorNome || '' }}
        </div>
        <div class="text-sm text-[#c9c9c9] truncate">
          {{ previewUltima(c) }}
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 10px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #3a3a3a;
  border-radius: 999px;
  border: 3px solid transparent;
  background-clip: content-box;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #4a4a4a;
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #3a3a3a transparent;
}
</style>
