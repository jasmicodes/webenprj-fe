<!-- src/views/AdminDashboardView.vue -->
<script setup lang="ts">
defineOptions({ name: 'AdminDashboardView' })

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { adminUsersApi } from '@/services/api/users'
import type { AdminUser } from '@/services/api/types'
import { getErrorMessage } from '@/services/api/client'
import { useToastStore } from '@/stores/toastStore'
import { useUserStore } from '@/stores/userStore'
import { useAppearanceStore } from '@/stores/appearanceStore'
import { useMediaQuery } from '@/composables/useMediaQuery'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import PageHeader from '@/components/atoms/PageHeader.vue'
import { TrashIcon, NoSymbolIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import type { UserRole } from '@/services/api/types'

const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const togglingUserId = ref<string | null>(null)
const toast = useToastStore()
const userStore = useUserStore()

// Pagination state
const page = ref(0)
const pageSize = 20
const totalPages = ref(1)
const totalElements = ref(0)
const loadingMore = ref(false)

// Search state
const searchInput = ref('')
const searchQuery = ref('')
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

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

// Load users with pagination and search
async function loadUsers(reset = false) {
  if (reset) {
    page.value = 0
    users.value = []
  }

  const isFirstPage = page.value === 0 && users.value.length === 0
  if (isFirstPage) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  error.value = null

  try {
    const result = await adminUsersApi.getAllUsers(
      searchQuery.value || undefined,
      page.value,
      pageSize
    )
    users.value = reset ? (result.content as AdminUser[]) : [...users.value, ...(result.content as AdminUser[])]
    totalPages.value = result.totalPages
    totalElements.value = result.totalElements
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (page.value + 1 >= totalPages.value) return
  page.value += 1
  loadUsers()
}

// Debounced search
watch(searchInput, (newValue) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    searchQuery.value = newValue
    loadUsers(true)
  }, 300)
})

// Cleanup debounce timer
onUnmounted(() => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})

onMounted(() => {
  loadUsers(true)
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
      <PageHeader title="Admin Dashboard" subtitle="Manage users and system settings">
        <div class="flex items-center gap-3">
          <!-- Search input -->
          <div class="relative">
            <svg
              class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              v-model="searchInput"
              type="text"
              placeholder="Search users..."
              class="w-48 pl-8 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
            <button
              v-if="searchInput"
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              @click="searchInput = ''"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- User count badge -->
          <div
            v-if="!loading && !error"
            class="text-xs font-medium px-2.5 py-1 rounded-md flex-shrink-0 text-slate-500 bg-slate-50/80 border border-slate-100"
          >
            <template v-if="searchQuery">
              {{ userCount }} of {{ totalElements }}
            </template>
            <template v-else>
              {{ totalElements }} {{ totalElements === 1 ? 'user' : 'users' }} · {{ activeCount }} active
            </template>
          </div>
        </div>
      </PageHeader>

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
        <BaseButton class="mt-4" variant="outline" @click="loadUsers(true)">
          Retry
        </BaseButton>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="users.length === 0"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center"
      >
        <p class="text-sm text-slate-600 mb-1">
          {{ searchQuery ? 'No users match your search' : 'No users found' }}
        </p>
        <p v-if="!searchQuery" class="text-xs text-slate-500">Users will appear here once they register</p>
        <p v-else class="text-xs text-slate-500">Try a different search term</p>
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

      <!-- Load more button -->
      <div v-if="!loading && !error && users.length > 0 && page + 1 < totalPages" class="flex justify-center pt-4">
        <BaseButton :disabled="loadingMore" variant="outline" @click="loadMore">
          <span v-if="loadingMore">Loading...</span>
          <span v-else>Load more</span>
        </BaseButton>
      </div>
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
