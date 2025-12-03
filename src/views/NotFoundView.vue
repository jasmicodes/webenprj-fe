<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const goHome = () => router.push({ name: 'home' })
const goBack = () => router.back()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
    <div class="text-center">
      <!-- 404 Number -->
      <h1 class="text-9xl font-bold text-indigo-600 mb-4">404</h1>

      <!-- Message -->
      <h2 class="text-3xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p class="text-lg text-gray-600 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <BaseButton @click="goBack" variant="outline">
          Go Back
        </BaseButton>
        <BaseButton @click="goHome">
          Go to Home
        </BaseButton>
      </div>
    </div>

    <!-- Optional: Illustration or icon -->
    <div class="mt-12 text-gray-400">
      <svg
        class="w-64 h-64"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
    </div>
  </div>
</template>
