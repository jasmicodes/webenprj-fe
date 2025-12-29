<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import avatarPlaceholder from '@/assets/avatar-placeholder.svg'

defineOptions({
  name: 'UserAvatar',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg'
    src?: string
    alt?: string
  }>(),
  { size: 'md' },
)

const userStore = useUserStore()
const sizeClass = computed(() => `avatar-${props.size}`)
const imageUrl = ref<string>(avatarPlaceholder)

async function loadProfileImage() {
  if (props.src) {
    imageUrl.value = props.src
    return
  }

  if (!userStore.user?.profileImageUrl) {
    imageUrl.value = avatarPlaceholder
    return
  }

  try {
    const objectUrl = await userStore.downloadProfileImage()
    if (objectUrl) {
      imageUrl.value = objectUrl
    } else {
      imageUrl.value = avatarPlaceholder
    }
  } catch {
    imageUrl.value = avatarPlaceholder
  }
}

onMounted(() => {
  loadProfileImage()
})

watch(() => userStore.user?.profileImageUrl, () => {
  loadProfileImage()
})

watch(() => props.src, () => {
  loadProfileImage()
})
</script>

<template>
  <div class="avatar" :class="sizeClass">
    <img
      :src="imageUrl"
      :alt="props.alt ?? (userStore.user?.username ? `${userStore.user.username}'s avatar` : 'User avatar')"
      class="avatar-img object-cover rounded-full"
    />
  </div>
</template>
