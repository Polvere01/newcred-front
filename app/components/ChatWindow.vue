<template>
  <main class="flex-1 flex flex-col">
    <!-- Header -->
    <div class="p-4 bg-white border-b font-semibold">
      {{ props.titulo || 'Selecione uma conversa' }}
    </div>

    <!-- Mensagens -->
    <div
      ref="listRef"
      class="flex-1 p-4 overflow-y-auto space-y-2"
    >
      <MessageBubble
        v-for="m in props.mensagens"
        :key="m.id"
        :mensagem="m"
      />
    </div>

    <!-- Input -->
    <MessageInput @send="(texto) => emit('send', texto)" />
  </main>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Mensagem } from '~/types/chat'
import MessageBubble from '~/components/MessageBubble.vue'
import MessageInput from '~/components/MessageInput.vue'

const props = defineProps<{
  titulo: string
  mensagens: Mensagem[]
}>()

const emit = defineEmits<{
  (e: 'send', texto: string): void
}>()

const listRef = ref<HTMLElement | null>(null)

function scrollToBottom() {
  const el = listRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

// desce o scroll quando:
// - troca de conversa (titulo muda)
// - chega mensagem nova (length muda)
watch(
  () => [props.titulo, props.mensagens.length],
  async () => {
    await nextTick()
    scrollToBottom()
  }
)
</script>
