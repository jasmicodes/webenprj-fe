<!-- Post header: Author info + tag -->
<template>
  <div class="flex items-center gap-3">
    <!-- Avatar (clickable to profile) -->
    <RouterLink
      v-if="userId"
      :to="{ name: 'user-profile', params: { id: userId } }"
      class="flex-shrink-0"
      @click.stop
    >
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        :alt="username"
        class="w-9 h-9 rounded-full object-cover hover:ring-2 hover:ring-blue-200 transition-shadow"
      />
      <div
        v-else
        class="w-9 h-9 rounded-full bg-slate-200 hover:ring-2 hover:ring-blue-200 transition-shadow"
      />
    </RouterLink>
    <template v-else>
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        :alt="username"
        class="w-9 h-9 rounded-full object-cover flex-shrink-0"
      />
      <div
        v-else
        class="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0"
      />
    </template>

    <!-- Author info: name + time stacked tightly -->
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2">
        <RouterLink
          v-if="userId"
          :to="{ name: 'user-profile', params: { id: userId } }"
          class="font-medium text-sm text-slate-900 truncate hover:text-blue-600 hover:underline transition-colors"
          @click.stop
        >
          {{ username }}
        </RouterLink>
        <span v-else class="font-medium text-sm text-slate-900 truncate">{{ username }}</span>
        <span class="text-xs text-slate-400 flex-shrink-0">{{ formattedTime }}</span>
      </div>
      <!-- Tag on second line for cleaner alignment -->
      <div v-if="tag" class="mt-0.5">
        <span
          class="inline-block text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full"
          :title="`Subject: ${formatTagDisplay(tag)}`"
        >
          {{ formatTagDisplay(tag) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PostHeader' })

import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { formatTagDisplay } from '@/utils/tagUtils'
import { formatTimeAgo } from '@/utils/timeUtils'

const props = defineProps<{
  username: string
  userId?: string
  avatarSrc?: string
  tag?: string
  time?: string
}>()

const formattedTime = computed(() => formatTimeAgo(props.time))
</script>
