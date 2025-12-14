<!-- src/views/AdminDashboardView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminUsersApi } from '@/services/api/users'
import type { AdminUser } from '@/services/api/types'
import { getErrorMessage } from '@/services/api/client'

const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const page = await adminUsersApi.getAllUsers()
    users.value = page.content as AdminUser[]
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
})

async function toggleActive(user: AdminUser) {
  const updated = await adminUsersApi.updateUser(user.id, { active: !user.active })
  user.active = (updated as AdminUser).active
}

async function deleteUser(user: AdminUser) {
  if (!confirm(`Delete user ${user.username}?`)) return
  await adminUsersApi.deleteUser(user.id)
  users.value = users.value.filter((u) => u.id !== user.id)
}
</script>

<template>
  <section class="max-w-4xl">
    <h1 class="text-2xl font-heading mb-4">Admin Dashboard</h1>

    <div v-if="loading">Loading users…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <table v-else class="w-full border text-sm">
      <thead class="bg-neutral-100">
        <tr>
          <th class="p-2 text-left">Username</th>
          <th class="p-2">Email</th>
          <th class="p-2">Role</th>
          <th class="p-2">Active</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in users" :key="u.id" class="border-t">
          <td class="p-2">{{ u.username }}</td>
          <td class="p-2">{{ u.email }}</td>
          <td class="p-2">{{ u.role }}</td>
          <td class="p-2">
            <span :class="u.active ? 'text-green-600' : 'text-red-600'">
              {{ u.active ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <td class="p-2 flex gap-2">
            <button class="text-blue-600 underline" @click="toggleActive(u)">
              {{ u.active ? 'Deactivate' : 'Activate' }}
            </button>

            <button class="text-red-600 underline" @click="deleteUser(u)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
