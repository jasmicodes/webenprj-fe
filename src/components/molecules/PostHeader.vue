<!--UserBadge + Tag (learning anchor)-->
<template>
  <div class="card-header flex items-center gap-3">
    <!-- Avatar + Name + Time -->
    <UserBadge :src="avatarSrc" :name="username" :subtitle="time" size="sm" class="min-w-0 flex-1" />
    <!-- Study subject tag (calm, supportive) -->
    <BaseChip
      v-if="tag"
      variant="tag"
      class="flex-shrink-0 max-w-[140px] truncate"
      :title="`Subject: ${formatTagDisplay(tag)}`"
    >
      {{ formatTagDisplay(tag) }}
    </BaseChip>
  </div>
</template>

<script setup lang="ts">
import UserBadge from '@/components/molecules/UserBadge.vue'
import BaseChip from '@/components/atoms/BaseChip.vue'
import { formatTagDisplay } from '@/utils/tagUtils'

defineProps<{ username: string; avatarSrc?: string; tag?: string; time?: string }>()
</script>
