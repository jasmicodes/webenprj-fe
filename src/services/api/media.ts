import { api } from './client'
import type { Media } from './types'

export const mediaApi = {
  /**
   * Upload a file (image or PDF)
   * @param file File to upload (jpg, jpeg, png, gif, pdf - max 10MB)
   * @returns Media object with id and metadata
   */
  async upload(file: File): Promise<Media> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await api.post<Media>('/medias', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  },

  /**
   * Get a file download URL
   * @param id Media UUID
   * @returns Full download URL
   */
  getDownloadUrl(id: string): string {
    return `${api.defaults.baseURL}/medias/${id}`
  },

  /**
   * Download/retrieve a file
   * @param id Media UUID
   * @returns Blob data for the file
   */
  async retrieve(id: string): Promise<Blob> {
    const res = await api.get(`/medias/${id}`, {
      responseType: 'blob',
    })
    return res.data
  },
}
