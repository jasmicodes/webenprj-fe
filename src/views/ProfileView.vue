<!-- src/views/ProfileView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useAppearanceStore } from '@/stores/appearanceStore'
import { getErrorMessage } from '@/services/api/client'
import { followApi } from '@/services/api'
import { COUNTRIES_DACH_FIRST } from '@/utils/countries'
import { useMediaQuery } from '@/composables/useMediaQuery'
import type { User } from '@/services/api/types'

import BaseButton from '@/components/atoms/BaseButton.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'
import EditProfileModal from '@/components/molecules/EditProfileModal.vue'

// -------------------- STORES & STATES --------------------
const userStore = useUserStore()
const appearanceStore = useAppearanceStore()
const loading = ref(true)
const error = ref<string | null>(null)
const followers = ref<number | null>(null)
const following = ref<number | null>(null)

const user = computed(() => userStore.user)
const countryName = computed(() => {
  if (!user.value?.countryCode) return 'Unknown'
  const c = COUNTRIES_DACH_FIRST.find((x) => x.code === user.value.countryCode)
  return c?.label ?? user.value.countryCode
})
const profileImageSrc = ref<string | null>(null)

// Ambient mode detection
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

// -------------------- EDIT MODAL --------------------
const showEditModal = ref(false)

function openEditModal() {
  showEditModal.value = true
}

async function onProfileSaved(updatedUser: User) {
  userStore.user = updatedUser
  // Reload profile image after save
  if (updatedUser.profileImageUrl) {
    profileImageSrc.value = await userStore.downloadProfileImage()
  } else {
    profileImageSrc.value = null
  }
}

// -------------------- LIFECYCLE --------------------
onMounted(async () => {
  try {
    if (!userStore.user) await userStore.fetchCurrentUser()
    if (userStore.user) {
      await loadFollowData()
      if (userStore.user.profileImageUrl)
        profileImageSrc.value = await userStore.downloadProfileImage()
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
})

// -------------------- FOLLOW LOGIC --------------------
async function loadFollowData() {
  if (!userStore.user) return
  try {
    const [followersPage, followingPage] = await Promise.all([
      followApi.getFollowers(userStore.user.id, 0, 5),
      followApi.getFollowing(userStore.user.id, 0, 5),
    ])
    followers.value = followersPage.totalElements
    following.value = followingPage.totalElements
  } catch (err) {
    error.value = getErrorMessage(err)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-start justify-center px-8">
    <div
      class="w-full max-w-3xl py-8 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- LOADING -->
      <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
        <p class="text-sm text-slate-500">Loading profile...</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="error" class="bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- CONTENT -->
      <div v-else-if="user" class="space-y-6">
        <!-- Page Header -->
        <header class="pb-3 border-b border-slate-100">
          <h1 class="text-lg font-medium text-slate-800 tracking-tight">Profile</h1>
          <p class="text-sm text-slate-500 mt-0.5">Your public identity</p>
        </header>

        <!-- PROFILE HEADER -->
        <div class="flex flex-col items-center md:items-start text-center md:text-left pt-1 pb-4">
          <!-- Avatar - anchored left on desktop -->
          <UserAvatar
            v-if="profileImageSrc"
            :src="profileImageSrc"
            class="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-sm"
          />
          <UserAvatar v-else class="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-sm" />

          <!-- Identity -->
          <div class="mt-5 space-y-1">
            <h2 class="text-xl font-semibold text-slate-900 tracking-tight">{{ user.username }}</h2>
            <p class="text-sm text-slate-400">{{ user.email }}</p>
            <!-- Secondary meta: country + role badge -->
            <p class="text-xs text-slate-400 pt-1">
              {{ countryName }}
              <span v-if="user.role === 'ADMIN'" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                Admin
              </span>
            </p>
          </div>

          <!-- Stats row - compact inline -->
          <div class="flex items-center gap-6 mt-5 text-sm">
            <div class="flex items-baseline gap-1.5">
              <span class="font-semibold text-slate-900">{{ followers ?? '–' }}</span>
              <span class="text-slate-400">Followers</span>
            </div>
            <div class="w-px h-4 bg-slate-200"></div>
            <div class="flex items-baseline gap-1.5">
              <span class="font-semibold text-slate-900">{{ following ?? '–' }}</span>
              <span class="text-slate-400">Following</span>
            </div>
          </div>

          <!-- Edit action - opens modal -->
          <BaseButton variant="outline" size="sm" class="mt-5" @click="openEditModal">
            Edit profile
          </BaseButton>
        </div>
      </div>

      <!-- NO USER -->
      <div v-else class="text-center py-8">
        <p class="text-sm text-slate-500">No user data available</p>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <EditProfileModal
      v-model="showEditModal"
      :user="user"
      @saved="onProfileSaved"
    />
  </div>
</template>

<style scoped>
/**
 * Profile container
 * Clean mode: minimal styling
 * Ambient mode: premium glass panel
 */
.content-glass-container {
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
