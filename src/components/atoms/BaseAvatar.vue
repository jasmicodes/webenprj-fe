<!--Benutzerbild mit Größenoption (greift auf .avatar, .avatar-md etc. zu)-->
<template>
  <div :class="['avatar', sizeClass]">
    <img
      v-if="src"
      :src="src"
      :alt="username ? `Profile picture of ${username}` : 'User profile picture'"
      class="avatar-img"
    />
  </div>
</template>

<script setup lang="ts">
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
</script>
