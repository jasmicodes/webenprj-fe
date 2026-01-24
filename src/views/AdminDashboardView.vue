<!-- src/views/AdminDashboardView.vue -->
<script setup lang="ts">
defineOptions({ name: 'AdminDashboardView' })

import { ref, computed, onMounted, watch } from 'vue'
import { adminUsersApi } from '@/services/api/users'
import type { AdminUser } from '@/services/api/types'
import { getErrorMessage } from '@/services/api/client'
import { useToastStore } from '@/stores/toastStore'
import { useUserStore } from '@/stores/userStore'
import { useAppearanceStore } from '@/stores/uiStore'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useDebounce } from '@/composables/useDebounce'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import PageHeader from '@/components/atoms/PageHeader.vue'
import AdminPostsTab from '@/components/organisms/AdminPostsTab.vue'
import ConfirmModal from '@/components/molecules/ConfirmModal.vue'
import {
  TrashIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  UsersIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline'
import type { UserRole } from '@/services/api/types'

// Tab state
type TabType = 'users' | 'posts'
const activeTab = ref<TabType>('users')

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
const searchQuery = useDebounce(searchInput, 300)

// Current user check (to prevent self-modification)
const currentUserId = computed(() => userStore.user?.id)
const isCurrentUser = (userId: string) => userId === currentUserId.value

// Ambient mode detection
const appearanceStore = useAppearanceStore()
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

// User count for header badge
const userCount = computed(() => users.value.length)
const activeCount = computed(() => users.value.filter((u) => u.active).length)

// Role update state
const updatingRoleUserId = ref<string | null>(null)

// Delete modal state
const showDeleteModal = ref(false)
const userToDelete = ref<AdminUser | null>(null)
const deletingUser = ref(false)

async function updateRole(user: AdminUser, newRole: UserRole) {
  if (newRole === user.role) return

  updatingRoleUserId.value = user.id
  try {
    const updated = await adminUsersApi.updateUser(user.id, { role: newRole })
    user.role = updated.role
    toast.showSuccess(`${user.username}'s role changed to ${newRole}`, 'Role Updated')
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
      pageSize,
    )
    users.value = reset
      ? (result.content as AdminUser[])
      : [...users.value, ...(result.content as AdminUser[])]
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

// React to debounced search query changes
watch(searchQuery, () => {
  loadUsers(true)
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
      'User Status',
    )
  } catch (err) {
    const errorMsg = getErrorMessage(err)
    toast.showError(`Failed to update user status: ${errorMsg}`, 'Error')
  } finally {
    togglingUserId.value = null
  }
}

function openDeleteModal(user: AdminUser) {
  userToDelete.value = user
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  userToDelete.value = null
}

async function confirmDeleteUser() {
  const user = userToDelete.value
  if (!user) return

  deletingUser.value = true

  try {
    await adminUsersApi.deleteUser(user.id)
    users.value = users.value.filter((u) => u.id !== user.id)
    toast.showSuccess(`User ${user.username} deleted successfully`, 'User Management')
    closeDeleteModal()
  } catch (err) {
    const errorMsg = getErrorMessage(err)
    toast.showError(`Failed to delete user: ${errorMsg}`, 'Error')
  } finally {
    deletingUser.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-start justify-center px-4 md:px-8">
    <div
      class="w-full max-w-5xl py-8 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- Page Header -->
      <PageHeader title="Admin Dashboard" subtitle="Manage users, posts, and system settings" />

      <!-- Tab Navigation -->
      <div class="flex gap-1 mb-6 border-b border-slate-200">
        <button
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
          :class="
            activeTab === 'users'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = 'users'"
        >
          <UsersIcon class="w-4 h-4" />
          Users
          <span
            v-if="activeTab === 'users'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          ></span>
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
          :class="
            activeTab === 'posts'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = 'posts'"
        >
          <DocumentTextIcon class="w-4 h-4" />
          Posts
          <span
            v-if="activeTab === 'posts'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          ></span>
        </button>
      </div>

      <!-- Posts Tab -->
      <AdminPostsTab v-if="activeTab === 'posts'" />

      <!-- Users Tab -->
      <template v-else>
        <!-- Users Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-900">User Management</h2>
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
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <label for="admin-search" class="sr-only">Search users</label>
              <input
                id="admin-search"
                v-model="searchInput"
                type="text"
                inputmode="search"
                autocomplete="off"
                placeholder="Search users..."
                class="w-48 pl-8 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <button
                v-if="searchInput"
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                @click="searchInput = ''"
                aria-label="Clear search"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <!-- User count badge -->
            <div
              v-if="!loading && !error"
              class="text-xs font-medium px-2.5 py-1 rounded-md flex-shrink-0 text-slate-500 bg-slate-50/80 border border-slate-100"
            >
              <template v-if="searchQuery"> {{ userCount }} of {{ totalElements }} </template>
              <template v-else>
                {{ totalElements }} {{ totalElements === 1 ? 'user' : 'users' }} ·
                {{ activeCount }} active
              </template>
            </div>
          </div>
        </div>

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
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p class="text-sm text-red-600">{{ error }}</p>
          <BaseButton class="mt-4" variant="outline" @click="loadUsers(true)"> Retry </BaseButton>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="users.length === 0"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center"
        >
          <p class="text-sm text-slate-600 mb-1">
            {{ searchQuery ? 'No users match your search' : 'No users found' }}
          </p>
          <p v-if="!searchQuery" class="text-xs text-slate-500">
            Users will appear here once they register
          </p>
          <p v-else class="text-xs text-slate-500">Try a different search term</p>
        </div>

        <!-- Users Table -->
        <BaseCard v-else class="overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Username
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
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
                      :class="
                        u.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                      "
                    >
                      {{ u.role }}
                    </span>
                    <!-- Other users: inline role dropdown -->
                    <select
                      v-else
                      :value="u.role"
                      :disabled="updatingRoleUserId === u.id"
                      class="text-xs font-medium px-2 py-0.5 rounded border appearance-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
                      :class="
                        u.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border-purple-100 hover:border-purple-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      "
                      @change="updateRole(u, ($event.target as HTMLSelectElement).value as UserRole)"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :class="
                        u.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      "
                    >
                      {{ u.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                      <!-- Toggle Active Button -->
                      <button
                        class="p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        :class="
                          isCurrentUser(u.id)
                            ? 'text-slate-400'
                            : u.active
                              ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                              : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                        "
                        :disabled="togglingUserId === u.id || isCurrentUser(u.id)"
                        :aria-label="
                          isCurrentUser(u.id)
                            ? 'Cannot modify your own account'
                            : u.active
                              ? 'Deactivate user'
                              : 'Activate user'
                        "
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
                        :class="
                          isCurrentUser(u.id)
                            ? 'text-slate-400'
                            : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                        "
                        :disabled="isCurrentUser(u.id)"
                        :aria-label="
                          isCurrentUser(u.id) ? 'Cannot delete your own account' : 'Delete user'
                        "
                        @click="openDeleteModal(u)"
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
        <div
          v-if="!loading && !error && users.length > 0 && page + 1 < totalPages"
          class="flex justify-center pt-4"
        >
          <BaseButton :disabled="loadingMore" variant="outline" @click="loadMore">
            <span v-if="loadingMore">Loading...</span>
            <span v-else>Load more</span>
          </BaseButton>
        </div>
      </template>

      <!-- Delete User Confirmation Modal -->
      <ConfirmModal
        :show="showDeleteModal"
        title="Delete user?"
        :message="`Are you sure you want to delete &quot;${userToDelete?.username}&quot;? This action cannot be undone.`"
        confirm-text="Delete user"
        variant="danger"
        :is-loading="deletingUser"
        @close="closeDeleteModal"
        @confirm="confirmDeleteUser"
      />
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
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.02);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(10px)) {
  .content-glass-container.ambient-mode {
    background: rgba(255, 255, 255, 0.85);
  }
}
</style>
