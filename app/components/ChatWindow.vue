<template>
  <main class="flex-1 flex flex-col min-h-0 min-w-0">
    <!-- Header -->
    <div class="p-4 bg-white border-b font-semibold">
      {{ props.titulo || 'Selecione uma conversa' }}
    </div>

    <!-- Mensagens -->
    <div ref="listRef" class="flex-1 min-h-0 p-4 overflow-y-auto space-y-2">
      <MessageBubble
        v-for="m in props.mensagens"
        :key="m.id"
        :mensagem="m"
        @mediaLoaded="onMediaLoaded"
      />
      <div ref="bottomRef" class="h-px"></div>
    </div>
    <!-- Input -->
    <MessageInput
      @send="(texto) => emit('send', texto)"
      @send-audio="(blob, mime) => emit('send-audio', blob, mime)"
      @send-video="(file) => emit('send-video', file)"
      @send-image="(file) => emit('send-image', file)"
      @send-pdf="(file) => emit('send-pdf', file)"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Mensagem } from '~/types/chat'
import MessageBubble from '~/components/MessageBubble.vue'
import MessageInput from '~/components/MessageInput.vue'

const listRef = ref<HTMLElement | null>(null)
const bottomRef = ref<HTMLElement | null>(null)
let rafId: number | null = null



const props = defineProps<{
  titulo: string
  mensagens: Mensagem[]
}>()

const emit = defineEmits<{
  (e: 'send', texto: string): void
  (e: 'send-audio', blob: Blob, mime: string): void
  (e: 'send-video', file: File): void
  (e: 'send-image', file: File): void
  (e: 'send-pdf', file: File): void
}>()

watch(
  () => props.mensagens.length,
  async () => {
    await nextTick()
    scrollToBottom()
  },
  { immediate: true }
)

function isNearBottom() {
  const el = listRef.value
  if (!el) return true
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight
  return distance < 120 // tolerância
}

function scrollToBottom(force = false) {
  const el = listRef.value
  const bottom = bottomRef.value
  if (!el || !bottom) return

  // se o cara subiu pra ler, não força
  if (!force && !isNearBottom()) return

  // cancela qualquer loop anterior
  if (rafId) cancelAnimationFrame(rafId)

  let tries = 0
  const run = () => {
    bottom.scrollIntoView({ block: 'end' }) // mais confiável que scrollTop
    tries++
    if (tries < 6) rafId = requestAnimationFrame(run) // segura mudanças de layout
    else rafId = null
  }

  // roda já e depois segura por alguns frames
  run()
}

watch(
  () => props.mensagens.length,
  async () => {
    await nextTick()
    scrollToBottom(true) // quando chega msg nova, força
  },
  { immediate: true }
)

function onMediaLoaded() {
  nextTick(() => scrollToBottom(false)) // só força se estiver “perto do fim”
}
</script>
