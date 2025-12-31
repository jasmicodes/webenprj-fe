import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useMediaImage } from './useMediaImage'

// Mock the media API
vi.mock('@/services/api/media', () => ({
  mediaApi: {
    retrieve: vi.fn(),
  },
}))

import { mediaApi } from '@/services/api/media'

describe('useMediaImage', () => {
  const mockBlobUrl = 'blob:http://localhost:3000/mock-blob-url'
  let originalCreateObjectURL: typeof URL.createObjectURL
  let originalRevokeObjectURL: typeof URL.revokeObjectURL

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock URL.createObjectURL and revokeObjectURL
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL

    URL.createObjectURL = vi.fn().mockReturnValue(mockBlobUrl)
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  describe('initial state', () => {
    it('should return fallback for empty URL', async () => {
      const fallback = '/default-avatar.png'
      const { imageUrl, loading, error } = useMediaImage('', fallback)

      await nextTick()

      expect(imageUrl.value).toBe(fallback)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should return fallback for null URL', async () => {
      const fallback = '/default-avatar.png'
      const { imageUrl } = useMediaImage(null, fallback)

      await nextTick()

      expect(imageUrl.value).toBe(fallback)
    })

    it('should return fallback for undefined URL', async () => {
      const fallback = '/default-avatar.png'
      const { imageUrl } = useMediaImage(undefined, fallback)

      await nextTick()

      expect(imageUrl.value).toBe(fallback)
    })

    it('should return empty string when no URL and no fallback', async () => {
      const { imageUrl } = useMediaImage('')

      await nextTick()

      expect(imageUrl.value).toBe('')
    })
  })

  describe('non-media URLs', () => {
    it('should use URL directly for external URLs', async () => {
      const externalUrl = 'https://example.com/image.jpg'
      const { imageUrl, loading } = useMediaImage(externalUrl)

      await nextTick()

      expect(imageUrl.value).toBe(externalUrl)
      expect(loading.value).toBe(false)
      expect(mediaApi.retrieve).not.toHaveBeenCalled()
    })

    it('should use URL directly for static assets', async () => {
      const staticUrl = '/assets/logo.png'
      const { imageUrl } = useMediaImage(staticUrl)

      await nextTick()

      expect(imageUrl.value).toBe(staticUrl)
      expect(mediaApi.retrieve).not.toHaveBeenCalled()
    })

    it('should use URL directly for data URLs', async () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgo='
      const { imageUrl } = useMediaImage(dataUrl)

      await nextTick()

      expect(imageUrl.value).toBe(dataUrl)
      expect(mediaApi.retrieve).not.toHaveBeenCalled()
    })
  })

  describe('media URLs', () => {
    it('should fetch blob from API for media URLs', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      vi.mocked(mediaApi.retrieve).mockResolvedValue(mockBlob)

      const { imageUrl, loading, error } = useMediaImage('/medias/123-456-789')

      // Initially loading
      expect(loading.value).toBe(true)

      await nextTick()
      // Wait for async operation
      await vi.waitFor(() => expect(loading.value).toBe(false))

      expect(mediaApi.retrieve).toHaveBeenCalledWith('123-456-789')
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
      expect(imageUrl.value).toBe(mockBlobUrl)
      expect(error.value).toBeNull()
    })

    it('should extract correct ID from media URL', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      vi.mocked(mediaApi.retrieve).mockResolvedValue(mockBlob)

      useMediaImage('/medias/abc-def-ghi')

      await nextTick()
      await vi.waitFor(() => expect(mediaApi.retrieve).toHaveBeenCalled())

      expect(mediaApi.retrieve).toHaveBeenCalledWith('abc-def-ghi')
    })
  })

  describe('error handling', () => {
    it('should return fallback on API error', async () => {
      const apiError = new Error('Network error')
      vi.mocked(mediaApi.retrieve).mockRejectedValue(apiError)

      const fallback = '/fallback.png'
      const { imageUrl, error, loading } = useMediaImage('/medias/123', fallback)

      await nextTick()
      await vi.waitFor(() => expect(loading.value).toBe(false))

      expect(imageUrl.value).toBe(fallback)
      expect(error.value).toBe(apiError)
    })

    it('should return empty string on error when no fallback', async () => {
      vi.mocked(mediaApi.retrieve).mockRejectedValue(new Error('API error'))

      const { imageUrl, loading } = useMediaImage('/medias/123')

      await nextTick()
      await vi.waitFor(() => expect(loading.value).toBe(false))

      expect(imageUrl.value).toBe('')
    })

    it('should return fallback for media URL without ID', async () => {
      const fallback = '/fallback.png'
      const { imageUrl } = useMediaImage('/medias/', fallback)

      await nextTick()

      expect(imageUrl.value).toBe(fallback)
      expect(mediaApi.retrieve).not.toHaveBeenCalled()
    })
  })

  describe('reactive URL changes', () => {
    it('should reload when mediaUrl ref changes', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      vi.mocked(mediaApi.retrieve).mockResolvedValue(mockBlob)

      const mediaUrlRef = ref('/medias/first-id')
      useMediaImage(mediaUrlRef)

      await nextTick()
      await vi.waitFor(() => expect(mediaApi.retrieve).toHaveBeenCalledWith('first-id'))

      // Change the URL
      mediaUrlRef.value = '/medias/second-id'
      await nextTick()
      await vi.waitFor(() => expect(mediaApi.retrieve).toHaveBeenCalledWith('second-id'))

      expect(mediaApi.retrieve).toHaveBeenCalledTimes(2)
    })

    it('should handle getter as URL source', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      vi.mocked(mediaApi.retrieve).mockResolvedValue(mockBlob)

      const url = ref('/medias/getter-id')
      useMediaImage(() => url.value)

      await nextTick()
      await vi.waitFor(() => expect(mediaApi.retrieve).toHaveBeenCalledWith('getter-id'))

      expect(mediaApi.retrieve).toHaveBeenCalled()
    })
  })

  describe('blob URL cleanup', () => {
    it('should revoke old blob URL when loading new image', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      vi.mocked(mediaApi.retrieve).mockResolvedValue(mockBlob)

      const mediaUrlRef = ref('/medias/first-id')
      useMediaImage(mediaUrlRef)

      await nextTick()
      await vi.waitFor(() => expect(URL.createObjectURL).toHaveBeenCalledTimes(1))

      // Change URL to trigger new load
      mediaUrlRef.value = '/medias/second-id'
      await nextTick()
      await vi.waitFor(() => expect(URL.createObjectURL).toHaveBeenCalledTimes(2))

      // Old blob URL should be revoked
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockBlobUrl)
    })
  })

  describe('loading state', () => {
    it('should set loading to true while fetching', async () => {
      let resolvePromise: (value: Blob) => void
      const pendingPromise = new Promise<Blob>((resolve) => {
        resolvePromise = resolve
      })
      vi.mocked(mediaApi.retrieve).mockReturnValue(pendingPromise)

      const { loading } = useMediaImage('/medias/123')

      await nextTick()
      expect(loading.value).toBe(true)

      // Resolve the promise
      resolvePromise!(new Blob(['test']))
      await nextTick()
      await vi.waitFor(() => expect(loading.value).toBe(false))
    })

    it('should set loading to false on error', async () => {
      vi.mocked(mediaApi.retrieve).mockRejectedValue(new Error('Error'))

      const { loading } = useMediaImage('/medias/123')

      await nextTick()
      await vi.waitFor(() => expect(loading.value).toBe(false))
    })
  })
})
