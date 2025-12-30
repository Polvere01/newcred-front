<template>
  <div class="p-3 bg-white border-t flex gap-2">
    <input
      v-model="texto"
      type="text"
      placeholder="Digite uma mensagem"
      class="flex-1 border rounded-lg px-3 py-2 outline-none"
      @keyup.enter="onSend"
    />
    <button class="bg-green-500 text-white px-4 rounded-lg" @click="onSend">
      Enviar
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'send', texto: string): void
}>()

const texto = ref('')

function onSend() {
  const t = texto.value.trim()
  if (!t) return
  emit('send', t)
  texto.value = ''
}
</script>
