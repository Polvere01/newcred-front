<template>
  <div class="h-screen flex bg-gray-100">
    <ConversaList
      :conversas="conversas"
      :selecionada-id="conversaSelecionada?.id ?? null"
      @select="conversaSelecionada = $event"
    />

    <ChatWindow
    :titulo="conversaSelecionada ? formatarTelefone(conversaSelecionada.nome) : ''"
    :mensagens="mensagens"
    @send="enviarMensagem"
    @send-audio="enviarAudio"
    @send-video="enviarVideo"
    @send-image="enviarImagem"
    @send-pdf="enviarPdf"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { ref, onMounted, watch } from 'vue'
import type { Conversa, Mensagem } from '~/types/chat'
import ConversaList from '~/components/ConversaList.vue'
import ChatWindow from '~/components/ChatWindow.vue'
import { useChatApi } from '~/composables/useChatApi'
import { formatarTelefone } from '~/utils/phone'

const { listarConversas, listarMensagens, enviarMensagem: enviarMensagemApi, enviarAudio: enviarAudioApi, enviarVideo: enviarVideoApi, enviarImagem: enviarImagemApi, enviarPdf: enviarPdfApi } = useChatApi()

const conversas = ref<Conversa[]>([])
const conversaSelecionada = ref<Conversa | null>(null)
const mensagens = ref<Mensagem[]>([])
let pollId: ReturnType<typeof setInterval> | null = null
let convPollId: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  try {
    conversas.value = await listarConversas()
    conversaSelecionada.value = conversas.value[0] ?? null
    iniciarPollingConversas()
  } catch (e) {
    console.error(e)
    conversas.value = []
    conversaSelecionada.value = null
  }
})

function pararPolling() {
  if (pollId) {
    clearInterval(pollId)
    pollId = null
  }
}

async function carregarMensagens(conversaId: number) {
  try {
    const novas = await listarMensagens(conversaId)

    const ultimoAtual = mensagens.value[mensagens.value.length - 1]?.id
    const ultimoNovo = novas[novas.length - 1]?.id

    if (ultimoAtual === ultimoNovo && mensagens.value.length === novas.length) return

    mensagens.value = novas
  } catch (e) {
    console.error(e)
  }
}

function iniciarPolling(conversaId: number) {
  pararPolling()
  pollId = setInterval(() => {
    carregarMensagens(conversaId)
  }, 500)
}


function pararPollingConversas() {
  if (convPollId) {
    clearInterval(convPollId)
    convPollId = null
  }
}

async function carregarConversas() {
  try {
    const novas = await listarConversas()
    conversas.value = novas
  } catch (e) {
    console.error(e)
  }
}

function iniciarPollingConversas() {
  pararPollingConversas()
  convPollId = setInterval(() => {
    carregarConversas()
  }, 2000) // 2s 
}

// Carrega mensagens quando muda a conversa (observando só o ID)
watch(
  () => conversaSelecionada.value?.id,
  async (id) => {
    pararPolling()

    if (!id) {
      mensagens.value = []
      return
    }

    await carregarMensagens(id)
    iniciarPolling(id)
  },
  { immediate: true }
)

async function enviarAudio(blob: Blob, mime: string) {
  const c = conversaSelecionada.value
  if (!c) return

  const msg = await enviarAudioApi(c, blob, mime)
  mensagens.value.push(msg)
}

async function enviarVideo(file: File) {
  const c = conversaSelecionada.value
  if (!c) return

  try {
    const msg = await enviarVideoApi(c, file)
    mensagens.value.push(msg)

    // opcional: atualizar preview da conversa
    const idx = conversas.value.findIndex(x => x.id === c.id)
    if (idx >= 0) {
      conversas.value[idx] = { ...conversas.value[idx]!, ultimaMensagem: '[vídeo]' }
      const item = conversas.value.splice(idx, 1)[0]
      if (item) conversas.value.unshift(item)
    }
  } catch (e) {
    console.error(e)
  }
}

async function enviarImagem(file: File) {
  const c = conversaSelecionada.value
  if (!c) return

  const msg = await enviarImagemApi(c, file)
  mensagens.value.push(msg)
}

async function enviarPdf(file: File) {
  const c = conversaSelecionada.value
  if (!c) return

  const msg = await enviarPdfApi(c, file)
  mensagens.value.push(msg)
}

async function enviarMensagem(texto: string) {
  const c = conversaSelecionada.value
  if (!c) return

  try {
    // Envia pro backend e recebe a mensagem criada (ideal)
    const msg = await enviarMensagemApi(c, texto)
    mensagens.value.push(msg)

    // Atualiza preview + move conversa pro topo (estilo WhatsApp)
    const idx = conversas.value.findIndex(x => x.id === c.id)
    if (idx >= 0) {
      conversas.value[idx] = { ...conversas.value[idx]!, ultimaMensagem: texto }

      const item = conversas.value.splice(idx, 1)[0]
      if (item) conversas.value.unshift(item)


      // mantém selecionada apontando pro objeto atualizado (opcional, mas bom)
      conversaSelecionada.value = conversas.value[0] ?? conversaSelecionada.value
    }
  } catch (e) {
    console.error(e)
  }
}

onBeforeUnmount(() => {
  pararPolling()
  pararPollingConversas()
})
</script>
