<!-- src/views/ProfileView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getErrorMessage } from '@/services/api/client'
import { followApi } from '@/services/api'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseDivider from '@/components/atoms/BaseDivider.vue'

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

onMounted(async () => {
  try {
    if (!userStore.user) {
      await userStore.fetchCurrentUser()
    }
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

      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Country:</strong> {{ user.countryCode }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>

      <div class="mt-4 flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="font-semibold">{{ followers ?? '–' }}</span>
          <span class="text-sm text-gray-600">Followers</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold">{{ following ?? '–' }}</span>
          <span class="text-sm text-gray-600">Following</span>
        </div>
      </div>

      <div class="mt-4 flex gap-3">
        <BaseButton variant="primary" :disabled="loadingFollowToggle" @click="toggleFollow">
          <span v-if="loadingFollowToggle">Working...</span>
          <span v-else>{{ isFollowing ? 'Unfollow' : 'Follow' }}</span>
        </BaseButton>
        <BaseButton variant="secondary" @click="userStore.logout()">Logout</BaseButton>
      </div>

      <BaseDivider class="my-4" />

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
            <li v-if="!followingList.length" class="text-sm text-gray-600">Not following anyone yet</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- No user state -->
    <div v-else class="text-center py-8">
      <p class="text-gray-600">No user data available</p>
    </div>
  </section>
</template>
