<!-- User card for search results and user lists -->
<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/services/api/types'
import { useUserStore } from '@/stores/userStore'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseAvatar from '@/components/atoms/BaseAvatar.vue'

defineOptions({ name: 'UserCard' })

const props = defineProps<{
  user: User
  isFollowing?: boolean
  avatarSrc?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  follow: [userId: string]
  unfollow: [userId: string]
  click: [user: User]
}>()

const userStore = useUserStore()

const isOwnProfile = computed(() => userStore.user?.id === props.user.id)

function handleFollowClick(event: Event) {
  event.stopPropagation()
  if (props.isFollowing) {
    emit('unfollow', props.user.id)
  } else {
    emit('follow', props.user.id)
  }
}

function handleCardClick() {
  emit('click', props.user)
}
</script>

<template>
  <BaseCard
    class="cursor-pointer transition-colors hover:bg-slate-50/50"
    @click="handleCardClick"
  >
    <div class="flex items-center gap-3">
      <!-- Avatar -->
      <BaseAvatar
        :src="avatarSrc"
        :alt="`${user.username}'s avatar`"
        class="w-12 h-12 flex-shrink-0"
      />

      <!-- User info -->
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-slate-900 truncate">{{ user.username }}</h3>
        <p v-if="user.salutation" class="text-sm text-slate-500 truncate">
          {{ user.salutation }}
        </p>
        <p v-else-if="user.countryCode" class="text-sm text-slate-400">
          {{ user.countryCode }}
        </p>
      </div>

      <!-- Follow button (not shown for own profile) -->
      <BaseButton
        v-if="!isOwnProfile"
        :variant="isFollowing ? 'outline' : 'primary'"
        size="sm"
        :disabled="loading"
        @click="handleFollowClick"
      >
        {{ isFollowing ? 'Following' : 'Follow' }}
      </BaseButton>

      <!-- "You" badge for own profile -->
      <span
        v-else
        class="text-xs font-medium px-2 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100"
      >
        You
      </span>
    </div>
  </BaseCard>
</template>
