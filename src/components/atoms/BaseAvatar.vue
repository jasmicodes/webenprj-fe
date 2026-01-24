<!--
  BaseAvatar - User avatar with auto-fetch capability.
  Set useCurrentUser=true to load the logged-in user's avatar from store.
  Falls back to placeholder on error or missing image.
-->
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { logger } from '@/services/logger'
import avatarPlaceholder from '@/assets/avatar-placeholder.svg'

defineOptions({
  name: 'BaseAvatar',
  inheritAttrs: false,
})

interface Props {
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  alt?: string
  /** When true and no src provided, auto-fetches current user's avatar from store */
  useCurrentUser?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  useCurrentUser: false,
})

const userStore = useUserStore()
const imageUrl = ref<string>(avatarPlaceholder)

// Track blob URL for cleanup to prevent memory leaks
let currentBlobUrl: string | null = null

function revokeCurrentBlobUrl() {
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }
}

// Clean up blob URL on unmount
onUnmounted(() => {
  revokeCurrentBlobUrl()
})

const sizeClass = {
  xs: 'avatar-xs',
  sm: 'avatar-sm',
  md: 'avatar-md',
  lg: 'avatar-lg',
}

async function loadImage() {
  // If explicit src provided, use it (not a blob URL, no cleanup needed)
  if (props.src) {
    revokeCurrentBlobUrl()
    imageUrl.value = props.src
    return
  }

  // If useCurrentUser, try to load from store
  if (props.useCurrentUser) {
    if (!userStore.user?.profileImageUrl) {
      revokeCurrentBlobUrl()
      imageUrl.value = avatarPlaceholder
      return
    }

    try {
      const objectUrl = await userStore.downloadProfileImage()
      // Revoke old blob URL before assigning new one
      revokeCurrentBlobUrl()
      if (objectUrl) {
        currentBlobUrl = objectUrl
        imageUrl.value = objectUrl
      } else {
        imageUrl.value = avatarPlaceholder
      }
    } catch (err) {
      logger.warn('Failed to load user avatar from store:', err)
      revokeCurrentBlobUrl()
      imageUrl.value = avatarPlaceholder
    }
    return
  }

  // Default: placeholder
  revokeCurrentBlobUrl()
  imageUrl.value = avatarPlaceholder
}

function handleImageError() {
  logger.warn('Avatar image failed to load, using placeholder')
  imageUrl.value = avatarPlaceholder
}

onMounted(() => {
  loadImage()
})

watch(() => props.src, () => {
  loadImage()
})

watch(() => userStore.user?.profileImageUrl, () => {
  if (props.useCurrentUser) {
    loadImage()
  }
})
</script>

<template>
  <div class="avatar" :class="sizeClass[size]">
    <img
      :src="imageUrl"
      :alt="alt ?? (useCurrentUser && userStore.user?.username ? `${userStore.user.username}'s avatar` : 'User avatar')"
      class="avatar-img object-cover rounded-full"
      @error="handleImageError"
    />
  </div>
</template>
