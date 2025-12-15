<!-- src/views/ProfileView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useAppearanceStore, AVAILABLE_BACKGROUNDS } from '@/stores/appearanceStore'
import { getErrorMessage } from '@/services/api/client'
import { followApi, mediaApi } from '@/services/api'
import { COUNTRIES_DACH_FIRST } from '@/utils/countries'
import { useChangePassword } from '@/composables/useChangePassword'
import { useProfileForm } from '@/composables/useProfileForm'

import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import BaseStat from '@/components/atoms/BaseStat.vue'
import BaseToggle from '@/components/atoms/BaseToggle.vue'
import UploadDropZone from '@/components/molecules/UploadDropZone.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'

// -------------------- STORES & STATES --------------------
const userStore = useUserStore()
const appearanceStore = useAppearanceStore()
const loading = ref(true)
const error = ref<string | null>(null)
const followers = ref<number | null>(null)
const following = ref<number | null>(null)
const followersList = ref<string[]>([])
const followingList = ref<string[]>([])
const loadingFollowLists = ref(false)
const uploadingAvatar = ref(false)

const user = computed(() => userStore.user)
const countryName = computed(() => {
  if (!user.value?.countryCode) return 'Unknown'
  const c = COUNTRIES_DACH_FIRST.find((x) => x.code === user.value.countryCode)
  return c?.label ?? user.value.countryCode
})
const profileImageSrc = ref<string | null>(null)

// -------------------- FORMS --------------------
const { showEditProfile, savingProfile, editForm, editErrors, initEditForm, saveProfile } = useProfileForm()
const { showChangePassword, passwordForm, passwordErrors, savingPassword, savePassword } = useChangePassword()

// -------------------- LIFECYCLE --------------------
onMounted(async () => {
  try {
    if (!userStore.user) await userStore.fetchCurrentUser()
    if (userStore.user) {
      initEditForm(userStore.user)
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
  loadingFollowLists.value = true
  try {
    const [followersPage, followingPage] = await Promise.all([
      followApi.getFollowers(userStore.user.id, 0, 5),
      followApi.getFollowing(userStore.user.id, 0, 5),
    ])
    followers.value = followersPage.totalElements
    following.value = followingPage.totalElements
    followersList.value = followersPage.content.map((u) => u.username)
    followingList.value = followingPage.content.map((u) => u.username)
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loadingFollowLists.value = false
  }
}

// -------------------- AVATAR UPLOAD --------------------
async function onAvatarSelected(file: File) {
  uploadingAvatar.value = true
  try {
    const media = await mediaApi.upload(file)
    editForm.value.profileImageUrl = `/medias/${media.id}`
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    uploadingAvatar.value = false
  }
}

// -------------------- SAVE PROFILE --------------------
async function handleSaveProfile() {
  await saveProfile((updatedUser) => {
    userStore.user = updatedUser
    initEditForm(updatedUser)
  })
}
</script>

<template>
  <div class="min-h-screen flex items-start justify-center px-8">
    <div class="w-full max-w-5xl py-8 content-glass-container">
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
        <h1 class="text-2xl font-semibold text-slate-900">Profile</h1>

        <!-- PROFILE HEADER - Glass surface for chrome -->
        <BaseCard class="glass-card">
          <div class="flex flex-col md:flex-row md:items-center gap-6">
            <UserAvatar
              v-if="profileImageSrc"
              :src="profileImageSrc"
              class="w-24 h-24 rounded-full object-cover flex-shrink-0"
            />
            <UserAvatar v-else class="w-24 h-24 rounded-full object-cover flex-shrink-0" />

            <div class="flex-1 space-y-4">
              <div>
                <h2 class="text-lg font-semibold text-slate-900">{{ user.username }}</h2>
                <p class="text-sm text-slate-500">{{ user.email }}</p>
              </div>

              <!-- Meta row: Country (+ Role for admins only) -->
              <div class="flex flex-wrap gap-4 text-sm">
                <div>
                  <span class="text-xs font-medium text-slate-500 uppercase tracking-wide">Country</span>
                  <p class="text-slate-900">{{ countryName }}</p>
                </div>
                <div v-if="user.role === 'ADMIN'">
                  <span class="text-xs font-medium text-slate-500 uppercase tracking-wide"
                    >Role</span
                  >
                  <p class="text-slate-900">{{ user.role }}</p>
                </div>
              </div>

              <div class="flex gap-6">
                <BaseStat :value="followers" label="Followers" />
                <BaseStat :value="following" label="Following" />
              </div>

              <div class="flex flex-wrap gap-3">
                <BaseButton variant="primary" @click="showEditProfile = !showEditProfile">
                  {{ showEditProfile ? 'Cancel editing' : 'Edit profile' }}
                </BaseButton>
                <BaseButton variant="outline" @click="showChangePassword = !showChangePassword">
                  {{ showChangePassword ? 'Cancel' : 'Change password' }}
                </BaseButton>
                <BaseButton variant="ghost" @click="userStore.logout()">Logout</BaseButton>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- EDIT PROFILE -->
        <BaseCard v-if="showEditProfile">
          <div class="space-y-6">
            <h2 class="text-lg font-semibold text-slate-900">Edit profile</h2>

            <BaseFormfield label="Email" :error="editErrors.email">
              <BaseInput v-model="editForm.email" :invalid="!!editErrors.email" placeholder="Email" />
            </BaseFormfield>

            <BaseFormfield label="Username" :error="editErrors.username">
              <BaseInput v-model="editForm.username" :invalid="!!editErrors.username" placeholder="Username" />
            </BaseFormfield>

            <BaseFormfield label="Country" :error="editErrors.countryCode">
              <BaseSelect v-model="editForm.countryCode" :invalid="!!editErrors.countryCode">
                <option value="" disabled>Select country…</option>
                <option v-for="c in COUNTRIES_DACH_FIRST" :key="c.code" :value="c.code">{{ c.label }}</option>
              </BaseSelect>
            </BaseFormfield>

            <!-- Avatar Upload -->
            <div class="border-t border-slate-200 pt-6">
              <label class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 block">Profile Photo</label>
              <div class="flex items-center gap-4">
                <UserAvatar class="w-16 h-16 rounded-full object-cover" />
                <UploadDropZone accept="image/*" @selected="onAvatarSelected">
                  <BaseButton variant="outline" :disabled="uploadingAvatar">
                    {{ uploadingAvatar ? 'Uploading…' : 'Change photo' }}
                  </BaseButton>
                </UploadDropZone>
              </div>
            </div>

            <BaseButton variant="primary" :disabled="savingProfile" @click="handleSaveProfile">
              {{ savingProfile ? 'Saving…' : 'Save changes' }}
            </BaseButton>
          </div>
        </BaseCard>

        <!-- CHANGE PASSWORD -->
        <BaseCard v-if="showChangePassword">
          <div class="space-y-6 max-w-md">
            <h2 class="text-lg font-semibold text-slate-900">Change password</h2>

            <BaseFormfield label="Current password" :error="passwordErrors.currentPassword">
              <BaseInput v-model="passwordForm.currentPassword" type="password" placeholder="Current password" />
            </BaseFormfield>

            <BaseFormfield label="New password" :error="passwordErrors.newPassword">
              <BaseInput v-model="passwordForm.newPassword" type="password" placeholder="New password" />
            </BaseFormfield>

            <BaseFormfield label="Repeat new password" :error="passwordErrors.repeatPassword">
              <BaseInput v-model="passwordForm.repeatPassword" type="password" placeholder="Repeat new password" />
            </BaseFormfield>

            <BaseButton variant="primary" :disabled="savingPassword" @click="savePassword">
              {{ savingPassword ? 'Saving…' : 'Update password' }}
            </BaseButton>
          </div>
        </BaseCard>

        <!-- APPEARANCE SETTINGS - Glass surface for chrome -->
        <BaseCard class="glass-card">
          <div class="space-y-6">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Appearance</h2>
              <p class="text-sm text-slate-500 mt-1">
                Customize your visual experience with curated ambient backgrounds
              </p>
            </div>

            <!-- Background Toggle -->
            <div class="flex items-center justify-between py-3">
              <div class="flex-1">
                <label for="bg-toggle" class="text-sm font-medium text-slate-900 block">
                  Background image
                </label>
                <p class="text-xs text-slate-500 mt-0.5">
                  Enable a soft blurred background (disabled on mobile)
                </p>
              </div>
              <BaseToggle
                id="bg-toggle"
                :model-value="appearanceStore.bgEnabled"
                label="Toggle background image"
                @update:model-value="appearanceStore.setBgEnabled"
              />
            </div>

            <!-- Background Selector (only shown when enabled) -->
            <div
              v-if="appearanceStore.bgEnabled"
              class="border-t border-slate-200 pt-6"
            >
              <label class="text-sm font-medium text-slate-900 block mb-3">
                Select background
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label
                  v-for="bg in AVAILABLE_BACKGROUNDS"
                  :key="bg.id"
                  class="relative cursor-pointer group"
                >
                  <input
                    type="radio"
                    :value="bg.id"
                    :checked="appearanceStore.bgId === bg.id"
                    class="sr-only"
                    @change="appearanceStore.setBgId(bg.id)"
                  />
                  <div
                    class="relative aspect-video rounded-xl overflow-hidden border-2 transition-all"
                    :class="
                      appearanceStore.bgId === bg.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-slate-200 hover:border-slate-300'
                    "
                  >
                    <!-- Preview with blur/overlay applied (matches actual background styling) -->
                    <img
                      :src="bg.path"
                      :alt="bg.name"
                      class="w-full h-full object-cover"
                      style="filter: blur(9px) saturate(1.15) brightness(1.0); transform: scale(1.06)"
                    />
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                      style="background: rgba(248, 250, 252, 0.45)"
                    >
                      <span class="text-xs font-medium text-slate-700">
                        {{ bg.name }}
                      </span>
                    </div>
                    <!-- Selected indicator -->
                    <div
                      v-if="appearanceStore.bgId === bg.id"
                      class="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                    >
                      <svg
                        class="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <p class="text-xs text-slate-600 mt-2 text-center">{{ bg.name }}</p>
                </label>
              </div>
              <p class="text-xs text-slate-500 mt-4">
                Backgrounds are automatically blurred and softened to maintain focus on content
              </p>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- NO USER -->
      <div v-else class="text-center py-8">
        <p class="text-sm text-slate-500">No user data available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * Glass effect for main content container
 * Rounded corners + glass backdrop for profile area
 */
.content-glass-container {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-top: 16px;
  margin-bottom: 16px;
  padding-left: 24px;
  padding-right: 24px;
}

/**
 * Glass effect for chrome surfaces (profile header, appearance settings)
 *
 * Visual hierarchy:
 * - Chrome (profile panels, settings) = glass with backdrop blur
 * - Content (posts, edit forms) = solid white (no glass)
 * - Background = ambient only
 */
.glass-card {
  background: rgba(255, 255, 255, 0.65) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%); /* Safari support */
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(20px)) {
  .content-glass-container,
  .glass-card {
    background: rgba(255, 255, 255, 0.95) !important;
  }
}
</style>
