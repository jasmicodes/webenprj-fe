<!-- src/views/AdminDashboardView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminUsersApi } from '@/services/api/users'
import type { AdminUser } from '@/services/api/types'
import { getErrorMessage } from '@/services/api/client'
import { useToastStore } from '@/stores/toastStore'

const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const togglingUserId = ref<string | null>(null)
const toast = useToastStore()

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
  // Prevent double-clicks
  if (togglingUserId.value) return

  togglingUserId.value = user.id
  const newStatus = !user.active

  try {
    const updated = await adminUsersApi.toggleUserActive(user.id, newStatus)
    user.active = updated.active
    toast.showSuccess(
      `User ${user.username} ${newStatus ? 'activated' : 'deactivated'} successfully`,
      'User Status'
    )
  } catch (err) {
    const errorMsg = getErrorMessage(err)
    toast.showError(`Failed to update user status: ${errorMsg}`, 'Error')
  } finally {
    togglingUserId.value = null
  }
}

async function deleteUser(user: AdminUser) {
  if (!confirm(`Delete user ${user.username}?`)) return

  try {
    await adminUsersApi.deleteUser(user.id)
    users.value = users.value.filter((u) => u.id !== user.id)
    toast.showSuccess(`User ${user.username} deleted successfully`, 'User Management')
  } catch (err) {
    const errorMsg = getErrorMessage(err)
    toast.showError(`Failed to delete user: ${errorMsg}`, 'Error')
  }
}
</script>

<template>
  <section class="max-w-4xl py-8 px-6">
    <!-- Page Header -->
    <header class="mb-6 pb-3 border-b border-slate-100">
      <h1 class="text-lg font-medium text-slate-800 tracking-tight">Admin Dashboard</h1>
      <p class="text-sm text-slate-500 mt-0.5">Manage users and system settings</p>
    </header>

    <div v-if="loading" class="text-sm text-slate-500">Loading users…</div>
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
            <button
              class="text-blue-600 underline disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="togglingUserId === u.id"
              @click="toggleActive(u)"
            >
              {{ togglingUserId === u.id ? 'Processing...' : (u.active ? 'Deactivate' : 'Activate') }}
            </button>

            <button class="text-red-600 underline" @click="deleteUser(u)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
