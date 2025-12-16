import type { Post as ApiPost } from '@/services/api/types'
import { processTagFromBackend } from './tagUtils'

/**
 * UI-friendly post shape expected by PostCard/feed views.
 */
export type PostCardData = {
  id: string | number
  userId: string // Author's user ID for ownership detection
  user: { name: string; avatar?: string }
  tag?: string
  time?: string
  text?: string
  image?: string
  likes: number
  liked: boolean
  comments: number
  streak: number
  bookmarkCount: number
  bookmarked: boolean
}

/**
 * Map a backend Post into the PostCardData shape.
 * Use overrides to inject UI-only fields (e.g., comment count, streak).
 */
export function mapApiPostToCard(
  post: ApiPost,
  overrides: Partial<Omit<PostCardData, 'id' | 'userId'>> = {},
): PostCardData {
  return {
    id: post.id,
    userId: post.userId,
    user: overrides.user || {
      name: post.username || 'Unknown user',
      avatar: post.userProfileImageUrl ?? undefined,
    },
    tag: overrides.tag || (post.subject ? processTagFromBackend(post.subject) : 'untagged'),
    time: overrides.time || post.createdAt,
    text: post.content ?? '',
    image: post.imageUrl ?? undefined,
    likes: overrides.likes ?? post.likeCount ?? 0,
    liked: overrides.liked ?? post.likedByCurrentUser ?? false,
    comments: overrides.comments ?? 0,
    streak: overrides.streak ?? 0,
    bookmarkCount: overrides.bookmarkCount ?? post.bookmarkCount ?? 0,
    bookmarked: overrides.bookmarked ?? post.bookmarkedByCurrentUser ?? false,
  }
}
