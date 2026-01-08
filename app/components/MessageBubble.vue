<template>
  <div class="w-full flex mb-2" :class="mensagem.direcao === 'SAIDA' ? 'justify-end' : 'justify-start'">
    <div class="max-w-[70%] px-3 py-2 rounded-lg text-sm text-white" :class="mensagem.direcao === 'SAIDA'
      ? 'bg-[#0b5421] text-white rounded-br-none'
      : 'bg-[#000000] text-white rounded-bl-none'
      ">
      <!-- dentro do bubble -->
      <div v-if="mensagem.tipo === 'text'">
        {{ mensagem.texto }}
      </div>

      <audio v-if="mensagem.tipo === 'audio'" controls :src="mediaSrc ?? ''" class="w-[220px]" />

      <img v-else-if="mensagem.tipo === 'image'" :src="mediaSrc ?? ''" class="w-[220px] h-auto rounded-lg" />

      <video v-else-if="mensagem.tipo === 'video'" controls :src="mediaSrc ?? ''" class="w-[220px] h-auto rounded-lg" />

      <a v-else-if="mensagem.tipo === 'pdf'" :href="mediaSrc ?? '#'" target="_blank" class="text-blue-600 underline">📄
        Ver documento</a>

      <a v-else-if="mensagem.tipo === 'document'" :href="mediaSrc ?? '#'" target="_blank"
        class="text-blue-600 underline">📄 Ver documento</a>

      <div class="text-[10px] opacity-70 mt-1 text-right">
        {{ hora }}
        <!-- pauzinhos só pra SAIDA -->
        <span v-if="mensagem.direcao === 'SAIDA'" class="leading-none">
          <template v-if="mensagem.status === 'sent'">✓</template>
          <template v-else-if="mensagem.status === 'delivered'">✓✓</template>
          <template v-else-if="mensagem.status === 'read'">
            <span class="text-white">✓✓</span>
          </template>
          <template v-else-if="mensagem.status === 'failed'">⚠️</template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Mensagem } from '~/types/chat'

const props = defineProps<{ mensagem: Mensagem }>()
const emit = defineEmits<{ (e: 'mediaLoaded'): void }>()

const config = useRuntimeConfig()
const baseURL = config.public.apiBase as string

const mediaSrc = ref<string | null>(null)

const hora = computed(() => {
  const d = new Date(props.mensagem.createdAt)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

async function carregarMedia() {
  if (!['audio', 'image', 'video', 'pdf', 'document'].includes(props.mensagem.tipo as any)) return

  const token = localStorage.getItem('token')
  if (!token) return

  const url = `${baseURL}/conversas/${props.mensagem.id}/media`

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!resp.ok) throw new Error(`Falha ao baixar media: ${resp.status}`)

  const blob = await resp.blob()
  mediaSrc.value = URL.createObjectURL(blob)
  emit('mediaLoaded')
}

onMounted(() => {
  if (props.mensagem.id) carregarMedia().catch(console.error)
})

onBeforeUnmount(() => {
  if (mediaSrc.value) URL.revokeObjectURL(mediaSrc.value)
})
</script>