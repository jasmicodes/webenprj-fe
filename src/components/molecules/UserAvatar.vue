<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
  },
)

const userStore = useUserStore()

const hasCustomImage = computed(() => {
  const url = userStore.user?.profileImageUrl
  return !!url && !url.includes('example.com')
})

const imageUrl = computed(() => {
  if (hasCustomImage.value) {
    return userStore.user?.profileImageUrl ?? ''
  }
  return '/avatar-placeholder.svg'
})

const defaultSizeClass = computed(() => `avatar avatar-${props.size}`)
</script>

<template>
  <img
    :src="imageUrl"
    :alt="userStore.user?.username ?? 'User'"
    :class="$attrs.class || defaultSizeClass"
  />
</template>
