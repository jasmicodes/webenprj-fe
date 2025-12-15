import { ref, watch, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue'
import { mediaApi } from '@/services/api/media'

/**
 * Composable for loading media images via authenticated API and converting to blob URLs.
 * Handles cleanup of blob URLs to prevent memory leaks.
 *
 * @param mediaUrl - The media URL (e.g., "/medias/123-456") - can be a ref, getter, or plain value
 * @param fallback - Fallback image URL if media loading fails
 * @returns Object with imageUrl ref (blob URL or fallback) and loading/error states
 */
export function useMediaImage(
  mediaUrl: MaybeRefOrGetter<string | undefined | null>,
  fallback?: string,
) {
  const imageUrl = ref<string>(fallback || '')
  const loading = ref(false)
  const error = ref<Error | null>(null)
  let currentBlobUrl: string | null = null

  async function loadImage() {
    const url = toValue(mediaUrl)

    if (!url) {
      imageUrl.value = fallback || ''
      return
    }

    // If it's not a media URL, use it directly (for static assets, external URLs, etc.)
    if (!url.startsWith('/medias/')) {
      imageUrl.value = url
      return
    }

    // Extract ID from URL (e.g., "/medias/123" -> "123")
    const id = url.split('/').pop()
    if (!id) {
      imageUrl.value = fallback || ''
      return
    }

    loading.value = true
    error.value = null

    try {
      const blob = await mediaApi.retrieve(id)

      // Revoke old blob URL if exists
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl)
      }

      currentBlobUrl = URL.createObjectURL(blob)
      imageUrl.value = currentBlobUrl
    } catch (err) {
      error.value = err as Error
      imageUrl.value = fallback || ''
      console.error(`Failed to load media image: ${url}`, err)
    } finally {
      loading.value = false
    }
  }

  // Load image when mediaUrl changes (toValue handles refs, getters, and plain values)
  watch(() => toValue(mediaUrl), loadImage, { immediate: true })

  // Cleanup blob URL on unmount
  onUnmounted(() => {
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl)
    }
  })

  return {
    imageUrl,
    loading,
    error,
  }
}
