<template>
  <!-- Skip to main content link for accessibility -->
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded"
  >
    Skip to main content
  </a>

  <!-- Navbar ausblenden auf auth pages -->
  <Navbar v-if="isAuthenticated && !route.meta.authPage" />

  <main
    id="main-content"
    class="section"
    :class="{ 'md:pl-64 pb-16 md:pb-0': isAuthenticated && !route.meta.authPage }"
  >
    <RouterView />
  </main>

  <div
    class="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 md:px-0 md:left-auto md:right-6 md:translate-x-0 space-y-2 z-50"
  >
    <ToastMessage
      v-if="toast.show"
      :show="toast.show"
      :message="toast.message"
      :title="toast.title || undefined"
      :variant="toast.variant"
      @close="toast.clear()"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'
import Navbar from '@/components/organisms/Navbar.vue'
import ToastMessage from '@/components/molecules/ToastMessage.vue'

const route = useRoute()
const userStore = useUserStore()
const toast = useToastStore()
const { isAuthenticated } = storeToRefs(userStore)
</script>
