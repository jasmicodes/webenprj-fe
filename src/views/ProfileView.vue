<!-- src/views/ProfileView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import { useUserStore } from '@/stores/userStore'
import { getErrorMessage } from '@/services/api/client'
import { followApi } from '@/services/api'
import { mediaApi } from '@/services/api'
import { COUNTRIES_DACH_FIRST } from '@/utils/countries'

import { useChangePassword } from '@/composables/useChangePassword'
import { useProfileForm } from '@/composables/useProfileForm'

import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import BaseStat from '@/components/atoms/BaseStat.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'
import UploadDropZone from '@/components/molecules/UploadDropZone.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'

// -------------------- Stores & State --------------------
const userStore = useUserStore()

const loading = ref(true)
const error = ref<string | null>(null)

// Follow state
const followers = ref<number | null>(null)
const following = ref<number | null>(null)
const followersList = ref<string[]>([])
const followingList = ref<string[]>([])
const loadingFollowLists = ref(false)

// User
const user = computed(() => userStore.user)
const uploadingAvatar = ref(false)

// Country name display
const countryName = computed(() => {
  if (!user.value?.countryCode) return 'Unknown'
  const country = COUNTRIES_DACH_FIRST.find((c) => c.code === user.value?.countryCode)
  return country?.label ?? user.value.countryCode
})

// -------------------- Profile Form (EDIT) --------------------
const { showEditProfile, savingProfile, editForm, editErrors, initEditForm, saveProfile } =
  useProfileForm()

// -------------------- Change Password --------------------
const { showChangePassword, passwordForm, passwordErrors, savingPassword, savePassword } =
  useChangePassword()

// -------------------- Lifecycle --------------------
onMounted(async () => {
  try {
    if (!userStore.user) {
      await userStore.fetchCurrentUser()
    }

    if (userStore.user) {
      initEditForm(userStore.user)
      await loadFollowData()
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
})

// -------------------- Follow Logic --------------------
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
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    loadingFollowLists.value = false
  }
}

// -------------------- Avatar Upload --------------------
async function onAvatarSelected(file: File) {
  uploadingAvatar.value = true
  try {
    const media = await mediaApi.upload(file)
    const url = `/medias/${media.id}`
    editForm.value.profileImageUrl = url
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    uploadingAvatar.value = false
  }
}

// -------------------- Save Profile Handler --------------------
async function handleSaveProfile() {
  await saveProfile((updatedUser) => {
    // Update userStore with fresh data
    userStore.user = updatedUser
    // Re-initialize form with updated data
    initEditForm(updatedUser)
  })
}
</script>

<template>
  <!-- Page wrapper with background -->
  <div class="bg-slate-50 min-h-screen">
    <!-- Main container -->
    <div class="max-w-5xl mx-auto p-6">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
        <p class="text-sm text-slate-500">Loading profile...</p>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center"
      >
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else-if="user" class="space-y-6">
        <!-- Page Title -->
        <h1 class="text-2xl font-semibold text-slate-900">Profile</h1>

        <!-- Card 1: Profile Header -->
        <BaseCard>
          <div class="flex flex-col md:flex-row md:items-center gap-6">
            <!-- Avatar (96px circular) -->
            <UserAvatar class="w-24 h-24 rounded-full object-cover flex-shrink-0" />

            <!-- Right side: Info + Stats + Actions -->
            <div class="flex-1 space-y-4">
              <!-- Name + Email -->
              <div>
                <h2 class="text-lg font-semibold text-slate-900">{{ user.username }}</h2>
                <p class="text-sm text-slate-500">{{ user.email }}</p>
              </div>

              <!-- Meta row: Country + Role -->
              <div class="flex flex-wrap gap-4 text-sm">
                <div>
                  <span class="text-xs font-medium text-slate-500 uppercase tracking-wide"
                    >Country</span
                  >
                  <p class="text-slate-900">{{ countryName }}</p>
                </div>
                <div>
                  <span class="text-xs font-medium text-slate-500 uppercase tracking-wide"
                    >Role</span
                  >
                  <p class="text-slate-900">{{ user.role }}</p>
                </div>
              </div>

              <!-- Stats row: Followers + Following -->
              <div class="flex gap-6">
                <BaseStat :value="followers" label="Followers" />
                <BaseStat :value="following" label="Following" />
              </div>

              <!-- Actions row -->
              <div class="flex flex-wrap gap-3">
                <BaseButton variant="primary" @click="showEditProfile = !showEditProfile">
                  {{ showEditProfile ? 'Cancel editing' : 'Edit profile' }}
                </BaseButton>

                <BaseButton variant="outline" @click="showChangePassword = !showChangePassword">
                  {{ showChangePassword ? 'Cancel' : 'Change password' }}
                </BaseButton>

                <BaseButton variant="ghost" @click="userStore.logout()"> Logout </BaseButton>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Edit Profile Form -->
        <BaseCard v-if="showEditProfile">
          <div class="space-y-6">
            <h2 class="text-lg font-semibold text-slate-900">Edit profile</h2>

            <BaseFormfield label="Email" :error="editErrors.email">
              <BaseInput
                v-model="editForm.email"
                :invalid="!!editErrors.email"
                placeholder="Email"
              />
            </BaseFormfield>

            <BaseFormfield label="Username" :error="editErrors.username">
              <BaseInput
                v-model="editForm.username"
                :invalid="!!editErrors.username"
                placeholder="Username"
              />
            </BaseFormfield>

            <BaseFormfield label="Country" :error="editErrors.countryCode">
              <BaseSelect v-model="editForm.countryCode" :invalid="!!editErrors.countryCode">
                <option value="" disabled>Select country…</option>
                <option v-for="c in COUNTRIES_DACH_FIRST" :key="c.code" :value="c.code">
                  {{ c.label }}
                </option>
              </BaseSelect>
            </BaseFormfield>

            <!-- Avatar Upload -->
            <div class="border-t border-slate-200 pt-6">
              <label class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 block"
                >Profile Photo</label
              >
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

        <!-- Change Password Form -->
        <BaseCard v-if="showChangePassword">
          <div class="space-y-6 max-w-md">
            <h2 class="text-lg font-semibold text-slate-900">Change password</h2>

            <BaseFormfield label="Current password" :error="passwordErrors.currentPassword">
              <BaseInput
                v-model="passwordForm.currentPassword"
                type="password"
                :invalid="!!passwordErrors.currentPassword"
                placeholder="Current password"
              />
            </BaseFormfield>

            <BaseFormfield label="New password" :error="passwordErrors.newPassword">
              <BaseInput
                v-model="passwordForm.newPassword"
                type="password"
                :invalid="!!passwordErrors.newPassword"
                placeholder="New password"
              />
            </BaseFormfield>

            <BaseFormfield label="Repeat new password" :error="passwordErrors.repeatPassword">
              <BaseInput
                v-model="passwordForm.repeatPassword"
                type="password"
                :invalid="!!passwordErrors.repeatPassword"
                placeholder="Repeat new password"
              />
            </BaseFormfield>

            <BaseButton variant="primary" :disabled="savingPassword" @click="savePassword">
              {{ savingPassword ? 'Saving…' : 'Update password' }}
            </BaseButton>
          </div>
        </BaseCard>

        <!-- Card 2: Social (Followers & Following) -->
        <BaseCard>
          <h2 class="text-lg font-semibold text-slate-900 mb-6">Social</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Recent Followers -->
            <div>
              <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                Recent Followers
              </h3>

              <div v-if="loadingFollowLists" class="text-sm text-slate-500">Loading...</div>

              <EmptyState
                v-else-if="!followersList.length"
                icon="UsersIcon"
                title="No followers yet"
                hint="Share your profile to get followers"
              />

              <ul v-else class="space-y-2">
                <li
                  v-for="username in followersList"
                  :key="username"
                  class="text-sm text-slate-900"
                >
                  • {{ username }}
                </li>
              </ul>
            </div>

            <!-- Following -->
            <div>
              <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                Following
              </h3>

              <div v-if="loadingFollowLists" class="text-sm text-slate-500">Loading...</div>

              <EmptyState
                v-else-if="!followingList.length"
                icon="UserPlusIcon"
                title="Not following anyone yet"
                hint="Discover and follow other students"
              />

              <ul v-else class="space-y-2">
                <li
                  v-for="username in followingList"
                  :key="username"
                  class="text-sm text-slate-900"
                >
                  • {{ username }}
                </li>
              </ul>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- No user -->
      <div v-else class="text-center py-8">
        <p class="text-sm text-slate-500">No user data available</p>
      </div>
    </div>
  </div>
</template>
