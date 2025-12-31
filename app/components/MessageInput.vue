<template>
  <div class="p-3 bg-white border-t flex gap-2 items-center relative">
    <!-- Botão + -->
    <button
      type="button"
      class="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
      @click="menuOpen = !menuOpen"
      :disabled="busy || gravando"
      title="Adicionar"
    >
      +
    </button>

    <!-- menu -->
    <div
      v-if="menuOpen"
      class="absolute bottom-14 left-3 bg-white border rounded-lg shadow-md w-44 overflow-hidden z-10"
    >
      <button
        type="button"
        class="w-full text-left px-3 py-2 hover:bg-gray-100"
        @click="selecionarVideo"
      >Adicionar vídeo
      </button>
      
      <button type="button" class="w-full text-left px-3 py-2 hover:bg-gray-100"
        @click="abrirImagem">Adicionar imagem
      </button>

      <button type="button" class="w-full text-left px-3 py-2 hover:bg-gray-100"
      @click="abrirPdf">Adicionar PDF</button>

    </div>

    <!-- input hidden de vídeo -->
    <input
      ref="videoInput"
      type="file"
      accept="video/*"
      class="hidden"
      @change="onVideoChange"
    />

    <input
      ref="imgInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onPickImagem"
    />

    <input
      ref="pdfInput"
      type="file"
      accept="application/pdf"
      class="hidden"
      @change="onPickPdf"
    />

    <!-- Botão de gravar/enviar áudio -->
    <button
      type="button"
      class="px-3 py-2 rounded-lg text-white"
      :class="gravando ? 'bg-red-600' : 'bg-gray-600'"
      @click="toggleGravacao"
      :disabled="busy"
      title="Gravar áudio"
    >
      <span v-if="!gravando">🎤</span>
      <span v-else>⏹</span>
    </button>

    <!-- Input texto normal -->
    <input
      v-model="texto"
      type="text"
      placeholder="Digite uma mensagem"
      class="flex-1 border rounded-lg px-3 py-2 outline-none"
      @keyup.enter="onSendTexto"
      :disabled="gravando"
    />

    <button
      class="bg-green-500 text-white px-4 rounded-lg py-2"
      @click="onSendTexto"
      :disabled="busy || gravando"
    >
      Enviar
    </button>

    <!-- status pequeno -->
    <div v-if="gravando" class="text-xs text-red-600 ml-2">
      gravando...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'send', texto: string): void
  (e: 'send-audio', blob: Blob, mime: string): void
  (e: 'send-video', file: File): void
  (e: 'send-image', file: File): void
  (e: 'send-pdf', file: File): void
}>()

const texto = ref('')
const gravando = ref(false)
const busy = ref(false)

const menuOpen = ref(false)
const videoInput = ref<HTMLInputElement | null>(null)
const pdfInput = ref<HTMLInputElement | null>(null)

let recorder: MediaRecorder | null = null
let chunks: BlobPart[] = []
let stream: MediaStream | null = null

function onSendTexto() {
  const t = texto.value.trim()
  if (!t) return
  emit('send', t)
  texto.value = ''
}

function selecionarVideo() {
  menuOpen.value = false
  videoInput.value?.click()
}

function onVideoChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  emit('send-video', file)

  // reset pra permitir selecionar o mesmo arquivo de novo
  input.value = ''
}

const imgInput = ref<HTMLInputElement | null>(null)

function abrirImagem() {
  imgInput.value?.click()
}

function onPickImagem(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  emit('send-image', file)

  // limpa pra poder escolher o mesmo arquivo de novo
  ;(e.target as HTMLInputElement).value = ''
}

function abrirPdf() {
  pdfInput.value?.click()
}

function onPickPdf(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  emit('send-pdf', file)
  ;(e.target as HTMLInputElement).value = ''
}

async function toggleGravacao() {
  if (busy.value) return

  if (!gravando.value) {
    // START
    busy.value = true
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mime =
        MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
          ? 'audio/ogg;codecs=opus'
          : ''

      recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunks = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = () => {
        const type = recorder?.mimeType || 'audio/webm'
        const blob = new Blob(chunks, { type })
        emit('send-audio', blob, type)

        stream?.getTracks().forEach(t => t.stop())
        stream = null
        recorder = null
        chunks = []
      }

      recorder.start()
      gravando.value = true
    } catch (e) {
      console.error(e)
    } finally {
      busy.value = false
    }
  } else {
    // STOP + SEND
    gravando.value = false
    recorder?.stop()
  }
}
</script>
