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
import BaseDivider from '@/components/atoms/BaseDivider.vue'
import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import UploadDropZone from '@/components/molecules/UploadDropZone.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'

// -------------------- Stores & State --------------------
const userStore = useUserStore()

const loading = ref(true)
const error = ref<string | null>(null)

// Follow state
const followers = ref<number | null>(null)
const following = ref<number | null>(null)
const isFollowing = ref(false)
const followersList = ref<string[]>([])
const followingList = ref<string[]>([])
const loadingFollowLists = ref(false)
const loadingFollowToggle = ref(false)

// User
const user = computed(() => userStore.user)
const isOwnProfile = computed(() => !!userStore.user) // single-user app

const uploadingAvatar = ref(false)

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
    isFollowing.value = false
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    loadingFollowLists.value = false
  }
}

async function toggleFollow() {
  if (!userStore.user) return

  loadingFollowToggle.value = true
  try {
    if (isFollowing.value) {
      await followApi.unfollow(userStore.user.id)
      isFollowing.value = false
      if (followers.value !== null) followers.value--
    } else {
      await followApi.follow(userStore.user.id)
      isFollowing.value = true
      if (followers.value !== null) followers.value++
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    loadingFollowToggle.value = false
  }
}

// -------------------- Avatar Upload --------------------
async function onAvatarSelected(file: File) {
  try {
    const media = await mediaApi.upload(file)
    const url = `/medias/${media.id}`

    editForm.value.profileImageUrl = url
  } catch (err) {
    error.value = getErrorMessage(err)
  }
}
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
      <h1 class="text-2xl font-heading mb-4"><strong>Profile</strong></h1>

      <div class="flex items-center gap-4 mb-6">
        <UserAvatar class="avatar avatar-lg" />

        <div>
          <h1 class="text-2xl font-heading">{{ user.username }}</h1>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
        </div>
      </div>

      <!-- READ -->
      <div class="space-y-1">
        <p><strong>Country:</strong> {{ user.countryCode }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
      </div>

      <!-- FOLLOW STATS -->
      <div class="mt-4 flex items-center gap-6">
        <div class="flex items-center gap-2">
          <span class="font-semibold">{{ followers ?? '–' }}</span>
          <span class="text-sm text-gray-600">Followers</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold">{{ following ?? '–' }}</span>
          <span class="text-sm text-gray-600">Following</span>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="mt-4 flex flex-wrap gap-3">
        <!-- OWN PROFILE -->
        <template v-if="isOwnProfile">
          <BaseButton variant="outline" @click="showEditProfile = !showEditProfile">
            {{ showEditProfile ? 'Cancel editing' : 'Edit profile' }}
          </BaseButton>

          <BaseButton variant="outline" @click="showChangePassword = !showChangePassword">
            {{ showChangePassword ? 'Cancel password change' : 'Change password' }}
          </BaseButton>

          <BaseButton variant="primary" @click="userStore.logout()"> Logout </BaseButton>
        </template>

        <!-- OTHER PROFILE -->
        <template v-else>
          <BaseButton variant="primary" :disabled="loadingFollowToggle" @click="toggleFollow">
            <span v-if="loadingFollowToggle">Working...</span>
            <span v-else>{{ isFollowing ? 'Unfollow' : 'Follow' }}</span>
          </BaseButton>
        </template>
      </div>

      <BaseDivider class="my-6" />

      <!-- FOLLOW LISTS -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h2 class="font-semibold mb-2">Recent Followers</h2>
          <p v-if="loadingFollowLists" class="text-sm text-gray-600">Loading...</p>
          <ul v-else class="space-y-1">
            <li v-for="u in followersList" :key="u" class="text-sm text-gray-800">• {{ u }}</li>
            <li v-if="!followersList.length" class="text-sm text-gray-600">No followers yet</li>
          </ul>
        </div>

        <div>
          <h2 class="font-semibold mb-2">Following</h2>
          <p v-if="loadingFollowLists" class="text-sm text-gray-600">Loading...</p>
          <ul v-else class="space-y-1">
            <li v-for="u in followingList" :key="u" class="text-sm text-gray-800">• {{ u }}</li>
            <li v-if="!followingList.length" class="text-sm text-gray-600">
              Not following anyone yet
            </li>
          </ul>
        </div>
      </div>

      <!-- CHANGE PASSWORD -->
      <BaseDivider v-if="showChangePassword" class="my-8" />
      <div v-if="showChangePassword" class="mt-6 space-y-4 max-w-md">
        <h2 class="text-xl font-semibold">Change password</h2>

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

      <!-- EDIT PROFILE -->
      <BaseDivider v-if="showEditProfile" class="my-8" />

      <section v-if="showEditProfile">
        <h2 class="text-xl font-semibold mb-4">Edit profile</h2>

        <BaseFormfield label="Email" :error="editErrors.email">
          <BaseInput v-model="editForm.email" :invalid="!!editErrors.email" placeholder="Email" />
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

        <BaseDivider class="my-8" />

        <!-- TEMP: URL input (wird im nächsten Block durch Avatar Upload ersetzt) -->
        <div v-if="showEditProfile" class="flex items-center gap-4 p-4 border rounded-xl mb-6">
          <UserAvatar class="avatar avatar-md" />

          <UploadDropZone accept="image/*" @selected="onAvatarSelected">
            <BaseButton variant="outline" :disabled="uploadingAvatar">
              {{ uploadingAvatar ? 'Uploading…' : 'Change photo' }}
            </BaseButton>
          </UploadDropZone>
        </div>

        <BaseButton class="mt-4" variant="primary" :disabled="savingProfile" @click="saveProfile">
          {{ savingProfile ? 'Saving…' : 'Save changes' }}
        </BaseButton>
      </section>
    </div>

    <!-- No user -->
    <div v-else class="text-center py-8">
      <p class="text-gray-600">No user data available</p>
    </div>
  </section>
</template>
