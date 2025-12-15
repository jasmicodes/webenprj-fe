<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BaseAvatar from '@/components/atoms/BaseAvatar.vue'
import { useUserStore } from '@/stores/userStore'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const userStore = useUserStore()
const sizeClass = computed(() => `avatar-${props.size}`)
const imageUrl = ref<string | null>(null)

onMounted(async () => {
  if (!userStore.user?.profileImageUrl) return

  try {
    const objectUrl = await userStore.downloadProfileImage()
    if (objectUrl) {
      imageUrl.value = objectUrl
      console.log('✅ Bild-URL erhalten:', objectUrl)
    } else {
      console.warn('⚠️ Keine Bild-URL zurückgegeben.')
    }
  } catch (err) {
    console.error('❌ Fehler beim Laden des Profilbilds:', err)
  }
})
</script>

<template>
  <div class="avatar" :class="sizeClass">
    <img
      v-if="imageUrl"
      :src="imageUrl"
      alt="User avatar"
      class="avatar-img object-cover rounded-full"
    />
    <BaseAvatar v-else :name="userStore.user?.username ?? '?'" class="w-full h-full" />
  </div>
</template>
