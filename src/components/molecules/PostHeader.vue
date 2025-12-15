<!--UserBadge + Tag-Chip + „Subscribe"-Button-->
<template>
  <div class="card-header flex items-center justify-between gap-4">
    <!-- links: Avatar + Name + Tag - can shrink/truncate -->
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <UserBadge :src="avatarSrc" :name="username" :subtitle="time" size="sm" class="min-w-0" />
      <BaseChip v-if="tag" variant="tag" class="flex-shrink-0 max-w-[140px] truncate">
        {{ formatTagDisplay(tag) }}
      </BaseChip>
    </div>
    <!-- rechts: Subscribe - never shrinks -->
    <BaseButton
      size="sm"
      variant="ghost"
      class="flex-shrink-0 px-3 py-1 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 focus:bg-slate-100 focus:text-slate-900 transition-colors"
    >
      Subscribe
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import UserBadge from '@/components/molecules/UserBadge.vue'
import BaseChip from '@/components/atoms/BaseChip.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { formatTagDisplay } from '@/utils/tagUtils'

defineProps<{ username: string; avatarSrc?: string; tag?: string; time?: string }>()
</script>
