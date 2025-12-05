import type { Post as ApiPost } from '@/services/api/types'

/**
 * UI-friendly post shape expected by PostCard/feed views.
 */
export type PostCardData = {
  id: string | number
  user: { name: string; avatar?: string }
  tag?: string
  time?: string
  text?: string
  image?: string
  likes: number
  comments: number
  streak: number
}

/**
 * Map a backend Post into the PostCardData shape.
 * Use overrides to inject UI-only fields (e.g., user avatars until the API provides them).
 */
export function mapApiPostToCard(
  post: ApiPost,
  overrides: Partial<Omit<PostCardData, 'id'>> = {},
): PostCardData {
  return {
    id: post.id,
    user: overrides.user || { name: post.username || 'Unknown user' },
    tag: overrides.tag || post.subject,
    time: overrides.time,
    text: post.content,
    image: post.imageUrl ?? undefined,
    likes: overrides.likes ?? 0,
    comments: overrides.comments ?? 0,
    streak: overrides.streak ?? 0,
  }
}
