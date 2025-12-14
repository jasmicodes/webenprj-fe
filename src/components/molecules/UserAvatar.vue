<script setup lang="ts">
import { computed } from 'vue'
import BaseAvatar from '@/components/atoms/BaseAvatar.vue'
import { useUserStore } from '@/stores/userStore'

const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
  },
)

const userStore = useUserStore()

const hasImage = computed(() => {
  const url = userStore.user?.profileImageUrl
  return !!url && !url.includes('example.com')
})

const imageUrl = computed(() => userStore.user?.profileImageUrl ?? '')

const sizeClass = computed(() => `avatar-${props.size}`)
</script>

<template>
  <div class="avatar" :class="sizeClass">
    <img v-if="hasImage" :src="imageUrl" alt="User avatar" class="avatar-img" />
    <BaseAvatar v-else :name="userStore.user?.username ?? '?'" class="w-full h-full" />
  </div>
</template>
