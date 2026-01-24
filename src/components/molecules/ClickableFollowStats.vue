<!--
  ClickableFollowStats - Interactive follower/following count display.
  Emits events to open follower/following list modals.
-->
<script setup lang="ts">
defineOptions({ name: 'ClickableFollowStats' })

defineProps<{
  followers: number
  following: number
}>()

const emit = defineEmits<{
  openFollowers: []
  openFollowing: []
}>()
</script>

<template>
  <div class="flex items-center justify-center sm:justify-start gap-4 text-sm">
    <!-- Followers -->
    <button
      type="button"
      class="group flex items-baseline gap-1 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1 rounded"
      @click="emit('openFollowers')"
      aria-label="View followers"
    >
      <span
        :class="followers === 0 ? 'font-medium text-slate-400' : 'font-semibold text-slate-900'"
      >
        {{ followers }}
      </span>
      <span class="text-slate-400 group-hover:underline">Followers</span>
    </button>

    <!-- Divider -->
    <div class="w-px h-3.5 bg-slate-200" aria-hidden="true"></div>

    <!-- Following -->
    <button
      type="button"
      class="group flex items-baseline gap-1 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1 rounded"
      @click="emit('openFollowing')"
      aria-label="View following"
    >
      <span
        :class="following === 0 ? 'font-medium text-slate-400' : 'font-semibold text-slate-900'"
      >
        {{ following }}
      </span>
      <span class="text-slate-400 group-hover:underline">Following</span>
    </button>
  </div>
</template>
