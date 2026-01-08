<template>
  <div class="p-3 bg-[#1c1c1c] border-t flex gap-2 items-center relative text-white">
    <!-- Botão + -->
    <button type="button" class="px-3 py-2 rounded-lg bg-[#2b2b2b] hover:bg-[#2b2b2b]" @click="menuOpen = !menuOpen"
      :disabled="busy || gravando" title="Adicionar">
      +
    </button>

    <!-- menu -->
    <div v-if="menuOpen"
      class="absolute bottom-14 left-3 bg-[#1c1c1c] border rounded-lg shadow-md w-44 overflow-hidden z-10">
      <button type="button" class="w-full text-left px-3 py-2 hover:bg-[#2b2b2b]" @click="selecionarVideo">Adicionar
        vídeo
      </button>

      <button type="button" class="w-full text-left px-3 py-2 hover:bg-[#2b2b2b]" @click="abrirImagem">Adicionar imagem
      </button>

      <button type="button" class="w-full text-left px-3 py-2 hover:bg-[#2b2b2b]" @click="abrirPdf">Adicionar
        PDF</button>

    </div>

    <!-- input hidden de vídeo -->
    <input ref="videoInput" type="file" accept="video/*" class="hidden" @change="onVideoChange" />

    <input ref="imgInput" type="file" accept="image/*" class="hidden" @change="onPickImagem" />

    <input ref="pdfInput" type="file" accept="application/pdf" class="hidden" @change="onPickPdf" />

    <!-- Botão de gravar/enviar áudio -->
    <button type="button" class="px-3 py-2 rounded-lg text-white " :class="gravando ? 'bg-red-600' : 'bg-gray-600'"
      @click="toggleGravacao" :disabled="busy" title="Gravar áudio">
      <span v-if="!gravando">🎤</span>
      <span v-else>⏹</span>
    </button>

    <button v-if="gravando" type="button" class="px-3 py-2 rounded-lg bg-[#2b2b2b] hover:bg-[#3a3a3a] text-white"
      @click="cancelarAudio" :disabled="busy" title="Cancelar áudio">
      ✖
    </button>

    <!-- Input texto normal -->
    <textarea v-model="texto" rows="1" placeholder="Digite uma mensagem"
      class="flex-1 border rounded-lg px-3 py-2 outline-none resize-none bg-[#2b2b2b] text-white" @keydown="onKeydown"
      :disabled="gravando" />

    <button class="bg-green-500 text-white px-4 rounded-lg py-2" @click="onSendTexto" :disabled="busy || gravando">
      Enviar
    </button>

    <!-- status pequeno -->
    <div v-if="gravando" class="text-xs text-red-600 ml-2">
      gravando...
    </div>

    <!-- Preview da imagem -->
    <div v-if="previewImage" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div class="bg-[#1c1c1c] rounded-xl p-4 max-w-md w-full">
        <img :src="previewImage" class="max-h-[60vh] w-full object-contain rounded-lg mb-4" />

        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded-lg bg-[#2b2b2b] text-white" @click="cancelarPreview">
            Cancelar
          </button>

          <button class="px-4 py-2 rounded-lg bg-green-600 text-white" @click="enviarImagemPreview">
            Enviar
          </button>
        </div>
      </div>
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

let cancelarGravacao = false
let recorder: MediaRecorder | null = null
let chunks: BlobPart[] = []
let stream: MediaStream | null = null

const previewImage = ref<string | null>(null)
const previewFile = ref<File | null>(null)

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

  previewFile.value = file
  previewImage.value = URL.createObjectURL(file)

    ; (e.target as HTMLInputElement).value = ''
}

function enviarImagemPreview() {
  if (!previewFile.value) return
  emit('send-image', previewFile.value)
  limparPreview()
}

function cancelarPreview() {
  limparPreview()
}

function limparPreview() {
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value)
  }
  previewImage.value = null
  previewFile.value = null
}

function abrirPdf() {
  pdfInput.value?.click()
}

function onPickPdf(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  emit('send-pdf', file)
    ; (e.target as HTMLInputElement).value = ''
}

function onKeydown(e: KeyboardEvent) {
  // Enter sozinho = enviar
  if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
    e.preventDefault()
    onSendTexto()
    return
  }

  // Shift+Enter ou Alt+Enter = quebra linha
  if (e.key === 'Enter' && (e.shiftKey || e.altKey)) {
    // deixa o comportamento normal do textarea
    return
  }
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

        // libera mic sempre
        stream?.getTracks().forEach(t => t.stop())
        stream = null
        recorder = null

        const foiCancelado = cancelarGravacao
        cancelarGravacao = false
        chunks = []

        if (foiCancelado) return // <-- NÃO envia

        emit('send-audio', blob, type)
      }
      cancelarGravacao = false
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

function cancelarAudio() {
  if (!gravando.value) return
  cancelarGravacao = true
  gravando.value = false
  recorder?.stop()
}
</script>
