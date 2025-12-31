import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PostCard from './PostCard.vue'
import type { PostCardData } from '@/utils/postMapper'

// Mock the APIs and composables
vi.mock('@/services/api/posts', () => ({
  postsApi: {
    getComments: vi.fn().mockResolvedValue({ content: [], totalPages: 0, totalElements: 0 }),
    createComment: vi.fn(),
    likePost: vi.fn(),
    unlikePost: vi.fn(),
  },
}))

vi.mock('@/composables/useMediaImage', () => ({
  useMediaImage: vi.fn(() => ({
    imageUrl: { value: '/test-avatar.jpg' },
    loading: { value: false },
    error: { value: null },
  })),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
    query: {},
  }),
  createRouter: vi.fn(() => ({
    push: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    install: vi.fn(),
  })),
  createWebHistory: vi.fn(),
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a class="router-link"><slot/></a>',
  },
}))

// Mock child components
vi.mock('@/components/atoms/BaseCard.vue', () => ({
  default: {
    name: 'BaseCard',
    template: '<div class="base-card"><slot name="header"/><slot/><slot name="actions"/></div>',
  },
}))

vi.mock('@/components/atoms/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    template: '<button class="base-button"><slot/></button>',
  },
}))

vi.mock('@/components/atoms/BaseProgressRing.vue', () => ({
  default: {
    name: 'BaseProgressRing',
    template: '<div class="progress-ring"></div>',
  },
}))

vi.mock('@/components/molecules/PostHeader.vue', () => ({
  default: {
    name: 'PostHeader',
    props: ['username', 'avatarSrc', 'tag', 'time'],
    template: '<div class="post-header">{{ username }} - {{ tag }}</div>',
  },
}))

vi.mock('@/components/molecules/PostFooter.vue', () => ({
  default: {
    name: 'PostFooter',
    props: ['likes', 'liked', 'comments', 'streak', 'bookmarkCount', 'bookmarked', 'isOwnPost', 'isAdmin'],
    emits: ['like', 'comment', 'save', 'share', 'edit', 'delete'],
    template: `
      <div class="post-footer">
        <span class="likes">{{ likes }}</span>
        <span class="liked" v-if="liked">liked</span>
        <span class="comments">{{ comments }}</span>
        <button class="like-btn" @click="$emit('like')">Like</button>
        <button class="comment-btn" @click="$emit('comment')">Comment</button>
        <button class="save-btn" @click="$emit('save')">Save</button>
        <button class="share-btn" @click="$emit('share')">Share</button>
        <button v-if="isOwnPost" class="edit-btn" @click="$emit('edit')">Edit</button>
        <button v-if="isOwnPost || isAdmin" class="delete-btn" @click="$emit('delete')">Delete</button>
      </div>
    `,
  },
}))

vi.mock('@/components/molecules/CommentBox.vue', () => ({
  default: {
    name: 'CommentBox',
    template: '<div class="comment-box"></div>',
  },
}))

vi.mock('@/components/molecules/CommentItem.vue', () => ({
  default: {
    name: 'CommentItem',
    template: '<div class="comment-item"></div>',
  },
}))

describe('PostCard', () => {
  const createMockPost = (overrides: Partial<PostCardData> = {}): PostCardData => ({
    id: '123',
    userId: 'user-456',
    parentId: null,
    parentDeleted: false,
    user: { name: 'Test User', avatar: '/avatar.jpg' },
    tag: 'study',
    time: '2024-01-01T12:00:00',
    text: 'This is a test post content',
    image: undefined,
    likes: 10,
    liked: false,
    comments: 5,
    streak: 3,
    bookmarkCount: 2,
    bookmarked: false,
    ...overrides,
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render post content', () => {
      const post = createMockPost({ text: 'Hello world!' })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      expect(wrapper.text()).toContain('Hello world!')
    })

    it('should render post header with username and tag', () => {
      const post = createMockPost({ user: { name: 'John Doe' }, tag: 'math' })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      expect(wrapper.find('.post-header').text()).toContain('John Doe')
      expect(wrapper.find('.post-header').text()).toContain('math')
    })

    it('should render post image when provided', () => {
      const post = createMockPost({ image: '/test-image.jpg' })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/test-image.jpg')
    })

    it('should not render image when not provided', () => {
      const post = createMockPost({ image: undefined })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      expect(wrapper.find('img').exists()).toBe(false)
    })

    it('should render like count in footer', () => {
      const post = createMockPost({ likes: 42 })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      expect(wrapper.find('.likes').text()).toBe('42')
    })

    it('should render comment count in footer', () => {
      const post = createMockPost({ comments: 15 })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      expect(wrapper.find('.comments').text()).toBe('15')
    })

    it('should show liked state when post is liked', () => {
      const post = createMockPost({ liked: true })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      expect(wrapper.find('.liked').exists()).toBe(true)
    })
  })

  describe('parent deleted banner', () => {
    it('should show banner when parent is deleted', () => {
      const post = createMockPost({ parentDeleted: true })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      expect(wrapper.text()).toContain('The original post was deleted')
    })

    it('should not show banner when parent is not deleted', () => {
      const post = createMockPost({ parentDeleted: false })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      expect(wrapper.text()).not.toContain('The original post was deleted')
    })
  })

  describe('events', () => {
    it('should emit like event with post id', async () => {
      const post = createMockPost({ id: 'post-abc' })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      await wrapper.find('.like-btn').trigger('click')

      expect(wrapper.emitted('like')).toBeTruthy()
      expect(wrapper.emitted('like')![0]).toEqual(['post-abc'])
    })

    it('should emit save event with post id', async () => {
      const post = createMockPost({ id: 'post-xyz' })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      await wrapper.find('.save-btn').trigger('click')

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')![0]).toEqual(['post-xyz'])
    })

    it('should emit share event with post id', async () => {
      const post = createMockPost({ id: 'post-123' })
      const wrapper = mount(PostCard, {
        props: { post },
      })

      await wrapper.find('.share-btn').trigger('click')

      expect(wrapper.emitted('share')).toBeTruthy()
      expect(wrapper.emitted('share')![0]).toEqual(['post-123'])
    })
  })

  describe('ownership', () => {
    it('should show edit button for own posts', () => {
      const post = createMockPost({ userId: 'user-123' })
      const wrapper = mount(PostCard, {
        props: { post, currentUserId: 'user-123' },
      })

      expect(wrapper.find('.edit-btn').exists()).toBe(true)
    })

    it('should not show edit button for other users posts', () => {
      const post = createMockPost({ userId: 'user-123' })
      const wrapper = mount(PostCard, {
        props: { post, currentUserId: 'different-user' },
      })

      expect(wrapper.find('.edit-btn').exists()).toBe(false)
    })

    it('should show delete button for own posts', () => {
      const post = createMockPost({ userId: 'user-123' })
      const wrapper = mount(PostCard, {
        props: { post, currentUserId: 'user-123' },
      })

      expect(wrapper.find('.delete-btn').exists()).toBe(true)
    })

    it('should emit edit event with post id when clicked', async () => {
      const post = createMockPost({ id: 'edit-post', userId: 'user-123' })
      const wrapper = mount(PostCard, {
        props: { post, currentUserId: 'user-123' },
      })

      await wrapper.find('.edit-btn').trigger('click')

      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')![0]).toEqual(['edit-post'])
    })

    it('should emit delete event with post id when clicked', async () => {
      const post = createMockPost({ id: 'delete-post', userId: 'user-123' })
      const wrapper = mount(PostCard, {
        props: { post, currentUserId: 'user-123' },
      })

      await wrapper.find('.delete-btn').trigger('click')

      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')![0]).toEqual(['delete-post'])
    })
  })

  describe('comments section', () => {
    it('should toggle comments visibility on comment button click', async () => {
      const post = createMockPost()
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Initially comments are hidden
      expect(wrapper.find('.comment-box').exists()).toBe(false)

      // Click to show comments
      await wrapper.find('.comment-btn').trigger('click')

      // Comments section should now be visible
      expect(wrapper.find('.comment-box').exists()).toBe(true)

      // Click again to hide
      await wrapper.find('.comment-btn').trigger('click')
      expect(wrapper.find('.comment-box').exists()).toBe(false)
    })
  })

  describe('post click navigation', () => {
    it('should have clickable post body', () => {
      const post = createMockPost()
      const wrapper = mount(PostCard, {
        props: { post },
      })

      const clickableArea = wrapper.find('.cursor-pointer')
      expect(clickableArea.exists()).toBe(true)
    })
  })
})
