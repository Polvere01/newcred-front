<template>
  <div
    class="w-full flex mb-2"
    :class="mensagem.direcao === 'SAIDA' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[70%] px-3 py-2 rounded-lg text-sm"
      :class="
        mensagem.direcao === 'SAIDA'
          ? 'bg-green-500 text-white rounded-br-none'
          : 'bg-gray-200 text-gray-900 rounded-bl-none'
      "
    >
      <div>{{ mensagem.texto }}</div>

      <div class="text-[10px] opacity-70 mt-1 text-right">
        {{ hora }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Mensagem } from '~/types/chat'

const props = defineProps<{ mensagem: Mensagem }>()

const hora = computed(() => {
  // pega HH:mm do createdAt
  const d = new Date(props.mensagem.createdAt)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})
</script>
