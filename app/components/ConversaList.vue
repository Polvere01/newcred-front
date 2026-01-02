<script setup lang="ts">
  
import { watch, ref } from 'vue'

const audio = new Audio('/sounds/new-message.mp3')

// guarda o estado anterior
const lastIds = ref<number[]>([])
  
import type { Conversa } from '~/types/chat'
import { formatarTelefone } from '~/utils/phone'

defineProps<{
  conversas: Conversa[]
  selecionadaId: number | null
}>()

const emit = defineEmits<{
  (e: 'select', conversa: Conversa): void
}>()

watch(
  () => props.conversas,
  (novaLista) => {
    const novosIds = novaLista.map(c => c.id)

    // primeira carga não toca som
    if (lastIds.value.length === 0) {
      lastIds.value = novosIds
      return
    }

    // detecta conversa nova
    const chegouNovaConversa = novosIds.some(
      id => !lastIds.value.includes(id)
    )

    if (chegouNovaConversa) {
      tocarSom()
    }

    lastIds.value = novosIds
  },
  { deep: true }
)

function tocarSom() {
  try {
    audio.currentTime = 0
    audio.play()
  } catch (e) {
    // browser pode bloquear autoplay se usuário nunca interagiu
    console.warn('Som bloqueado pelo navegador')
  }
}

</script>

<template>
  <aside class="w-80 bg-white border-r flex flex-col">
    <div class="p-4 font-semibold border-b">Conversas</div>

    <div class="flex-1 overflow-y-auto">
      <div
        v-for="c in conversas"
        :key="c.id"
        class="p-4 cursor-pointer hover:bg-gray-100 border-b"
        :class="selecionadaId === c.id ? 'bg-gray-200' : ''"
        @click="emit('select', c)"
      >
        <div class="font-medium">
          {{ formatarTelefone(c.nome) }}
        </div>
        <div class="text-sm text-gray-500 truncate">
          {{ c.ultimaMensagem }}
        </div>
      </div>
    </div>
  </aside>
</template>
