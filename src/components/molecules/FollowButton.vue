<!--
  FollowButton - Icon-based follow/unfollow toggle (Instagram-style).
  Shows UserPlus when not following, Check when following, UserMinus on hover.
  Emits 'toggle' - parent handles the API call and state.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

defineOptions({ name: 'FollowButton' })

const props = withDefaults(
  defineProps<{
    isFollowing: boolean
    loading?: boolean
    size?: 'sm' | 'md'
    showLabel?: boolean
  }>(),
  {
    loading: false,
    size: 'sm',
    showLabel: false,
  },
)

const emit = defineEmits<{
  toggle: []
}>()

// Hover state for showing unfollow hint
const isHovered = ref(false)

// Computed styles based on state
const buttonClasses = computed(() => {
  const base = [
    'inline-flex items-center justify-center',
    'rounded-full transition-all duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ]

  // Size classes
  const sizeClasses = props.size === 'md'
    ? props.showLabel ? 'h-9 px-3 gap-1.5' : 'w-10 h-10'
    : props.showLabel ? 'h-8 px-2.5 gap-1' : 'w-8 h-8'

  // State-based styling
  if (props.loading) {
    return [...base, sizeClasses, 'bg-slate-100 border border-slate-200 text-slate-400']
  }

  if (props.isFollowing) {
    if (isHovered.value) {
      // Hover on "Following" → hint unfollow (red tint)
      return [...base, sizeClasses, 'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 focus:ring-red-300']
    }
    // Following state (soft emerald)
    return [...base, sizeClasses, 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 focus:ring-emerald-300']
  }

  // Not following (ghost/outline style)
  return [...base, sizeClasses, 'bg-white border border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-700 focus:ring-slate-300']
})

const iconSize = computed(() => props.size === 'md' ? 'w-5 h-5' : 'w-4 h-4')

const iconName = computed(() => {
  if (props.loading) return null
  if (props.isFollowing) {
    return isHovered.value ? 'UserMinusIcon' : 'CheckIcon'
  }
  return 'UserPlusIcon'
})

const labelText = computed(() => {
  if (props.loading) return 'Loading...'
  if (props.isFollowing) {
    return isHovered.value ? 'Unfollow' : 'Following'
  }
  return 'Follow'
})

const ariaLabel = computed(() => {
  if (props.loading) return 'Loading...'
  return props.isFollowing ? 'Unfollow user' : 'Follow user'
})

function handleClick(event: Event) {
  event.stopPropagation()
  if (!props.loading) {
    emit('toggle')
  }
}
</script>

<template>
  <button
    type="button"
    :class="buttonClasses"
    :disabled="loading"
    :aria-label="ariaLabel"
    @click="handleClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      :class="iconSize"
      class="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Icon -->
    <BaseIcon
      v-else-if="iconName"
      :name="iconName"
      :size="iconSize"
    />

    <!-- Optional label -->
    <span v-if="showLabel" class="text-sm font-medium">
      {{ labelText }}
    </span>
  </button>
</template>
