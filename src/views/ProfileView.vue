<!-- src/views/ProfileView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getErrorMessage } from '@/services/api/client'

const userStore = useUserStore()
const loading = ref(true)
const error = ref<string | null>(null)

const user = computed(() => userStore.user)

onMounted(async () => {
  try {
    if (!userStore.user) {
      await userStore.fetchCurrentUser()
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="max-w-2xl">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <p class="text-gray-600">Loading profile...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="user">
      <h1 class="text-2xl font-heading mb-4">Profile</h1>

      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Country:</strong> {{ user.countryCode }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>

      <button class="btn btn-outline mt-4" @click="userStore.logout()">Logout</button>
    </div>

    <!-- No user state -->
    <div v-else class="text-center py-8">
      <p class="text-gray-600">No user data available</p>
    </div>
  </section>
</template>
