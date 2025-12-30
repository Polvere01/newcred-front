<template>
  <main class="flex-1 flex flex-col">
    <div class="p-4 bg-white border-b font-semibold">
      {{ titulo || 'Selecione uma conversa' }}
    </div>

    <div class="flex-1 p-4 overflow-y-auto space-y-2">
      <MessageBubble v-for="m in mensagens" :key="m.id" :mensagem="m" />
    </div>

    <MessageInput @send="(texto) => emit('send', texto)" />
  </main>
</template>

<script setup lang="ts">
import type { Mensagem } from '~/types/chat'
import MessageBubble from '~/components/MessageBubble.vue'
import MessageInput from '~/components/MessageInput.vue'

defineProps<{
  titulo: string
  mensagens: Mensagem[]
}>()

const emit = defineEmits<{
  (e: 'send', texto: string): void
}>()
</script>
