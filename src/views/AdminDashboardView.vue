<!-- src/views/AdminDashboardView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminUsersApi } from '@/services/api/users'
import type { AdminUser } from '@/services/api/types'
import { getErrorMessage } from '@/services/api/client'
import { useToastStore } from '@/stores/toastStore'
import { useUserStore } from '@/stores/userStore'
import { useAppearanceStore } from '@/stores/appearanceStore'
import { useMediaQuery } from '@/composables/useMediaQuery'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { TrashIcon, NoSymbolIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import type { UserRole } from '@/services/api/types'

const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const togglingUserId = ref<string | null>(null)
const toast = useToastStore()
const userStore = useUserStore()

// Current user check (to prevent self-modification)
const currentUserId = computed(() => userStore.user?.id)
const isCurrentUser = (userId: string) => userId === currentUserId.value

// Ambient mode detection
const appearanceStore = useAppearanceStore()
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

// User count for header badge
const userCount = computed(() => users.value.length)
const activeCount = computed(() => users.value.filter(u => u.active).length)

// Role update state
const updatingRoleUserId = ref<string | null>(null)

async function updateRole(user: AdminUser, newRole: UserRole) {
  if (newRole === user.role) return

  updatingRoleUserId.value = user.id
  try {
    const updated = await adminUsersApi.updateUser(user.id, { role: newRole })
    user.role = updated.role
    toast.showSuccess(
      `${user.username}'s role changed to ${newRole}`,
      'Role Updated'
    )
  } catch (err) {
    toast.showError(`Failed to update role: ${getErrorMessage(err)}`, 'Error')
  } finally {
    updatingRoleUserId.value = null
  }
}

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
  if (!confirm(`Are you sure you want to delete "${user.username}"? This action cannot be undone.`)) return

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
  <div class="min-h-screen flex items-start justify-center px-8">
    <div
      class="w-full max-w-5xl py-8 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- Page Header -->
      <header class="mb-6 pb-3 border-b border-slate-100">
        <div class="flex items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <h1 class="text-lg font-medium text-slate-800 tracking-tight">Admin Dashboard</h1>
            <p class="text-sm text-slate-500 mt-0.5">Manage users and system settings</p>
          </div>
          <!-- User count badge -->
          <div
            v-if="!loading && !error"
            class="text-xs font-medium px-2.5 py-1 rounded-md flex-shrink-0 text-slate-500 bg-slate-50/80 border border-slate-100"
          >
            {{ userCount }} {{ userCount === 1 ? 'user' : 'users' }} · {{ activeCount }} active
          </div>
        </div>
      </header>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-slate-200 rounded w-1/4"></div>
            <div class="space-y-3">
              <div v-for="i in 5" :key="i" class="flex gap-4">
                <div class="h-3 bg-slate-100 rounded w-1/5"></div>
                <div class="h-3 bg-slate-100 rounded w-1/4"></div>
                <div class="h-3 bg-slate-100 rounded w-1/6"></div>
                <div class="h-3 bg-slate-100 rounded w-1/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
      >
        <p class="text-sm text-red-600">{{ error }}</p>
        <BaseButton class="mt-4" variant="outline" @click="loading = true; error = null; $forceUpdate()">
          Retry
        </BaseButton>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="users.length === 0"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center"
      >
        <p class="text-sm text-slate-600 mb-1">No users found</p>
        <p class="text-xs text-slate-500">Users will appear here once they register</p>
      </div>

      <!-- Users Table -->
      <BaseCard v-else class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Username
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="u in users"
                :key="u.id"
                class="transition-colors"
                :class="isCurrentUser(u.id) ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-slate-900">{{ u.username }}</span>
                    <span
                      v-if="isCurrentUser(u.id)"
                      class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
                    >
                      You
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  {{ u.email }}
                </td>
                <td class="px-4 py-3">
                  <!-- Current user: show static badge (can't change own role) -->
                  <span
                    v-if="isCurrentUser(u.id)"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="u.role === 'ADMIN'
                      ? 'bg-purple-50 text-purple-700 border border-purple-100'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'"
                  >
                    {{ u.role }}
                  </span>
                  <!-- Other users: inline role dropdown -->
                  <select
                    v-else
                    :value="u.role"
                    :disabled="updatingRoleUserId === u.id"
                    class="text-xs font-medium px-2 py-0.5 rounded border appearance-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
                    :class="u.role === 'ADMIN'
                      ? 'bg-purple-50 text-purple-700 border-purple-100 hover:border-purple-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'"
                    @change="updateRole(u, ($event.target as HTMLSelectElement).value as UserRole)"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="u.active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-red-50 text-red-600 border border-red-100'"
                  >
                    {{ u.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <!-- Toggle Active Button -->
                    <button
                      class="p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      :class="isCurrentUser(u.id)
                        ? 'text-slate-400'
                        : u.active
                          ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                          : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'"
                      :disabled="togglingUserId === u.id || isCurrentUser(u.id)"
                      :title="isCurrentUser(u.id)
                        ? 'Cannot modify your own account'
                        : u.active ? 'Deactivate user' : 'Activate user'"
                      @click="toggleActive(u)"
                    >
                      <component
                        :is="u.active ? NoSymbolIcon : CheckCircleIcon"
                        class="w-4 h-4"
                        :class="{ 'animate-pulse': togglingUserId === u.id }"
                      />
                    </button>

                    <!-- Delete Button -->
                    <button
                      class="p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      :class="isCurrentUser(u.id)
                        ? 'text-slate-400'
                        : 'text-red-500 hover:bg-red-50 hover:text-red-600'"
                      :disabled="isCurrentUser(u.id)"
                      :title="isCurrentUser(u.id) ? 'Cannot delete your own account' : 'Delete user'"
                      @click="deleteUser(u)"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
/**
 * Admin Dashboard container
 * Clean mode: minimal styling
 * Ambient mode: premium glass panel
 */
.content-glass-container {
  /* Clean mode: very minimal */
  background: transparent;
  border-radius: 24px;
  margin-top: 16px;
  margin-bottom: 16px;
  padding-left: 24px;
  padding-right: 24px;
}

/* Ambient mode: premium glass panel */
.content-glass-container.ambient-mode {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(10px)) {
  .content-glass-container.ambient-mode {
    background: rgba(255, 255, 255, 0.85);
  }
}
</style>
