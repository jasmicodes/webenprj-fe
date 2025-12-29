<!--Benutzerbild mit Größenoption (greift auf .avatar, .avatar-md etc. zu)-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import avatarPlaceholder from '@/assets/avatar-placeholder.svg'

defineOptions({ name: 'BaseAvatar' })

interface Props {
  src?: string
  size?: 'sm' | 'md' | 'lg'
  username?: string
}

const props = withDefaults(defineProps<Props>(), { size: 'md' })

const sizeClass = {
  sm: 'avatar-sm',
  md: 'avatar-md',
  lg: 'avatar-lg',
}[props.size]

const imageUrl = ref(props.src || avatarPlaceholder)

watch(() => props.src, (newSrc) => {
  imageUrl.value = newSrc || avatarPlaceholder
})

function handleImageError() {
  imageUrl.value = avatarPlaceholder
}
</script>

<template>
  <div :class="['avatar', sizeClass]">
    <img
      :src="imageUrl"
      :alt="username ? `Profile picture of ${username}` : 'User profile picture'"
      class="avatar-img"
      @error="handleImageError"
    />
  </div>
</template>
