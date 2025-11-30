<!-- src/views/ProfileView.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
</script>

<template>
  <section class="max-w-2xl">
    <h1 class="text-2xl font-heading mb-4">Profile</h1>

    <p><strong>Email:</strong> {{ user?.email ?? '—' }}</p>
    <p><strong>Username:</strong> {{ user?.username ?? '—' }}</p>

    <button class="btn btn-outline mt-4" @click="userStore.logout()">Logout</button>
  </section>
</template>
