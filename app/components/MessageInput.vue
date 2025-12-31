<template>
  <div class="p-3 bg-white border-t flex gap-2 items-center">
    <!-- Botão de gravar/enviar -->
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
}>()

const texto = ref('')
const gravando = ref(false)
const busy = ref(false)

let recorder: MediaRecorder | null = null
let chunks: BlobPart[] = []
let stream: MediaStream | null = null

function onSendTexto() {
  const t = texto.value.trim()
  if (!t) return
  emit('send', t)
  texto.value = ''
}

async function toggleGravacao() {
  console.log('[MessageInput] click, gravando=', gravando.value)
  if (busy.value) return

  if (!gravando.value) {
    // START
    busy.value = true
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // preferir webm/opus (Chrome) ou ogg/opus (alguns)
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
        console.log('[MessageInput] onstop, chunks=', chunks.length)
        // envia pro pai (index.vue) pra chamar backend
        emit('send-audio', blob, type)
        console.log('[MessageInput] emitiu send-audio', blob.size, type)
        // limpa mic
        stream?.getTracks().forEach(t => t.stop())
        stream = null
        recorder = null
        chunks = []
      }

      recorder.start()
      gravando.value = true
    } catch (e) {
      console.error(e)
      // se usuário negar permissão do mic, vai cair aqui
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
