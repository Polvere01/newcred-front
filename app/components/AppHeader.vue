<template>
  <header class="flex items-center justify-between px-4 py-3 bg-white border-b">
    <div class="font-semibold">NewCred</div>

    <button
      @click="logout"
      class="text-sm text-red-600 hover:underline"
    >
      Sair
    </button>
  </header>
</template>

<script setup lang="ts">
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  navigateTo('/login')
}
</script>
