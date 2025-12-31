<!-- Avatar component with optional auto-fetch from user store -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
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

const sizeClass = {
  xs: 'avatar-xs',
  sm: 'avatar-sm',
  md: 'avatar-md',
  lg: 'avatar-lg',
}

async function loadImage() {
  // If explicit src provided, use it
  if (props.src) {
    imageUrl.value = props.src
    return
  }

  // If useCurrentUser, try to load from store
  if (props.useCurrentUser) {
    if (!userStore.user?.profileImageUrl) {
      imageUrl.value = avatarPlaceholder
      return
    }

    try {
      const objectUrl = await userStore.downloadProfileImage()
      imageUrl.value = objectUrl || avatarPlaceholder
    } catch {
      imageUrl.value = avatarPlaceholder
    }
    return
  }

  // Default: placeholder
  imageUrl.value = avatarPlaceholder
}

function handleImageError() {
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
