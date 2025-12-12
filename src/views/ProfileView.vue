<!-- src/views/ProfileView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as yup from 'yup'

import { useUserStore } from '@/stores/userStore'
import { getErrorMessage } from '@/services/api/client'
import { followApi } from '@/services/api'
import { usersApi } from '@/services/api/users'
import { useToastStore } from '@/stores/toastStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { COUNTRIES_DACH_FIRST } from '@/utils/countries'

import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseDivider from '@/components/atoms/BaseDivider.vue'
import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'

const userStore = useUserStore()
const loading = ref(true)
const error = ref<string | null>(null)
const followers = ref<number | null>(null)
const following = ref<number | null>(null)
const isFollowing = ref(false)
const followersList = ref<string[]>([])
const followingList = ref<string[]>([])
const loadingFollowLists = ref(false)
const loadingFollowToggle = ref(false)

const user = computed(() => userStore.user)
const isOwnProfile = computed(() => !!userStore.user) // single user app
const showEditProfile = ref(false)
const toast = useToastStore()

const editForm = ref({
  email: '',
  username: '',
  countryCode: '',
  profileImageUrl: '',
})

const profileSchema = yup.object({
  email: yup
    .string()
    .transform((v) => v?.trim())
    .email('Email must be a valid email address')
    .required('Email is required'),

  username: yup
    .string()
    .transform((v) => v?.trim())
    .min(5, 'Username must be between 5 and 50 characters')
    .max(50, 'Username must be between 5 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),

  countryCode: yup.string().required('Country code is required'),

  // Backend erlaubt null/leer => optional
  profileImageUrl: yup
    .string()
    .transform((v) => v?.trim())
    .notRequired(),
})

const {
  errors: editErrors,
  validate: validateEdit,
  clearErrors: clearEditErrors,
} = useFormValidation(profileSchema)

const savingProfile = ref(false)

onMounted(async () => {
  try {
    if (!userStore.user) {
      await userStore.fetchCurrentUser()
    }
    initEditForm()
    await loadFollowData()
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
})

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
    // In a single-profile view, assume not following self
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
      if (followers.value !== null) followers.value = Math.max(0, followers.value - 1)
    } else {
      await followApi.follow(userStore.user.id)
      isFollowing.value = true
      if (followers.value !== null) followers.value += 1
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    loadingFollowToggle.value = false
  }
}

function initEditForm() {
  if (!userStore.user) return
  editForm.value = {
    email: userStore.user.email ?? '',
    username: userStore.user.username ?? '',
    countryCode: userStore.user.countryCode ?? '',
    profileImageUrl: userStore.user.profileImageUrl ?? '',
  }
}

async function saveProfile() {
  clearEditErrors()
  toast.clear()

  const ok = await validateEdit(editForm.value)
  if (!ok) {
    toast.showError('Please fix the highlighted fields')
    return
  }

  savingProfile.value = true
  try {
    const updated = await usersApi.updateMyProfile({
      email: editForm.value.email,
      username: editForm.value.username,
      countryCode: editForm.value.countryCode,
      profileImageUrl: editForm.value.profileImageUrl || undefined,
    })

    userStore.user = updated
    initEditForm()
    toast.showSuccess('Profile updated successfully')
  } catch (err) {
    toast.showError(getErrorMessage(err))
  } finally {
    savingProfile.value = false
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
      <h1 class="text-2xl font-heading mb-4">Profile</h1>

      <!-- READ -->
      <div class="space-y-1">
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Username:</strong> {{ user.username }}</p>
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
      <div class="mt-4 flex gap-3">
        <BaseButton
          v-if="!isOwnProfile"
          variant="primary"
          :disabled="loadingFollowToggle"
          @click="toggleFollow"
        >
          <span v-if="loadingFollowToggle">Working...</span>
          <span v-else>{{ isFollowing ? 'Unfollow' : 'Follow' }}</span>
        </BaseButton>

        <BaseButton v-else variant="ghost" disabled> Follow </BaseButton>

        <BaseButton variant="outline" @click="showEditProfile = !showEditProfile">
          {{ showEditProfile ? 'Cancel editing' : 'Edit profile' }}
        </BaseButton>

        <BaseButton variant="primary" @click="userStore.logout()"> Logout </BaseButton>
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

        <!-- TEMP: URL input (wird im nächsten Block durch Avatar Upload ersetzt) -->
        <BaseFormfield label="Profile image URL (optional)" :error="editErrors.profileImageUrl">
          <BaseInput
            v-model="editForm.profileImageUrl"
            :invalid="!!editErrors.profileImageUrl"
            placeholder="https://example.com/avatar.png"
          />
        </BaseFormfield>

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
