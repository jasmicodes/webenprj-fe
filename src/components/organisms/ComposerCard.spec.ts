import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ComposerCard from './ComposerCard.vue'

// Mock child components
vi.mock('@/components/atoms/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    props: ['variant', 'size', 'disabled', 'title'],
    template: '<button class="base-button" :disabled="disabled" @click="$emit(\'click\')"><slot/></button>',
  },
}))

vi.mock('@/components/atoms/BaseIcon.vue', () => ({
  default: {
    name: 'BaseIcon',
    props: ['name'],
    template: '<span class="base-icon">{{ name }}</span>',
  },
}))

vi.mock('@/components/atoms/BaseAvatar.vue', () => ({
  default: {
    name: 'BaseAvatar',
    template: '<div class="base-avatar"></div>',
  },
}))

vi.mock('@/components/molecules/TagInput.vue', () => ({
  default: {
    name: 'TagInput',
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue'],
    template: '<input class="tag-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :placeholder="placeholder"/>',
  },
}))

// Import store after mocking
import { useUserStore } from '@/stores/userStore'

describe('ComposerCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Mock matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('collapsed state', () => {
    it('should render collapsed by default', () => {
      const wrapper = mount(ComposerCard)

      expect(wrapper.text()).toContain('Share a learning moment...')
      // Textarea exists in DOM but body container has height: 0px when collapsed
      expect(wrapper.find('.cursor-text').exists()).toBe(true)
    })

    it('should show user avatar in collapsed state', () => {
      const wrapper = mount(ComposerCard)

      expect(wrapper.find('.base-avatar').exists()).toBe(true)
    })
  })

  describe('expansion', () => {
    it('should expand on header click', async () => {
      const wrapper = mount(ComposerCard)

      // Click on the header area
      await wrapper.find('.cursor-text').trigger('click')

      // Wait for expansion animation
      await wrapper.vm.$nextTick()

      expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('should show textarea when expanded', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      expect(textarea.attributes('placeholder')).toBe("What's on your mind?")
    })

    it('should show Share button when expanded', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Share')
    })

    it('should show Cancel button when expanded', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Cancel')
    })
  })

  describe('text input', () => {
    it('should update content when typing', async () => {
      const wrapper = mount(ComposerCard)

      // Expand first
      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('Hello world test message')

      expect(textarea.element.value).toBe('Hello world test message')
    })

    it('should show character count when typing', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('Hello world')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('11/500')
    })

    it('should have maxlength of 500', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('maxlength')).toBe('500')
    })
  })

  describe('validation', () => {
    it('should disable Share button when content is too short', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('Short')
      await wrapper.vm.$nextTick()

      const shareButton = wrapper.find('.base-button')
      expect(shareButton.attributes('disabled')).toBeDefined()
    })

    it('should enable Share button when content is valid (10+ chars)', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('This is a valid post with more than 10 characters')
      await wrapper.vm.$nextTick()

      const shareButton = wrapper.find('.base-button')
      expect(shareButton.attributes('disabled')).toBeUndefined()
    })

    it('should show validation hint when content too short', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('Hi')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('more characters needed')
    })
  })

  describe('post submission', () => {
    it('should emit post event with content when Share clicked', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('This is a valid post content for testing')
      await wrapper.vm.$nextTick()

      const shareButton = wrapper.find('.base-button')
      await shareButton.trigger('click')

      expect(wrapper.emitted('post')).toBeTruthy()
      expect(wrapper.emitted('post')![0]).toEqual([
        {
          subject: 'general',
          content: 'This is a valid post content for testing',
          file: null,
        },
      ])
    })

    it('should clear content after posting', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('This is a valid post content for testing')
      await wrapper.vm.$nextTick()

      const shareButton = wrapper.find('.base-button')
      await shareButton.trigger('click')
      await wrapper.vm.$nextTick()

      // The textarea is still in DOM (just hidden), check its value is cleared
      expect(textarea.element.value).toBe('')
    })
  })

  describe('cancel', () => {
    it('should clear content when Cancel clicked', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('Some content that will be cancelled')
      await wrapper.vm.$nextTick()

      const cancelButton = wrapper.find('.cancel-btn')
      await cancelButton.trigger('click')
      await wrapper.vm.$nextTick()

      // The textarea is still in DOM (just hidden), check its value is cleared
      expect(textarea.element.value).toBe('')
    })
  })

  describe('file upload', () => {
    it('should have file input hidden', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.exists()).toBe(true)
      expect(fileInput.classes()).toContain('hidden')
    })

    it('should accept image and pdf files', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.attributes('accept')).toBe('image/*,.pdf')
    })
  })

  describe('subject/tag', () => {
    it('should have tag button for adding subject', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      // Look for tag icon button
      const tagButton = wrapper.findAll('.tool-btn').find((btn) => btn.text().includes('TagIcon'))
      expect(tagButton).toBeDefined()
    })

    it('should show tag input after clicking tag button', async () => {
      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      // Find and click tag button
      const tagButton = wrapper.findAll('.tool-btn').find((btn) => btn.text().includes('TagIcon'))
      await tagButton?.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.tag-input').exists()).toBe(true)
    })
  })

  describe('username display', () => {
    it('should show username when expanded', async () => {
      const userStore = useUserStore()
      userStore.$patch({
        user: { id: '123', username: 'testuser', email: 'test@example.com', role: 'USER' },
      })

      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('testuser')
    })

    it('should show "You" when no username', async () => {
      const userStore = useUserStore()
      userStore.$patch({
        user: null,
      })

      const wrapper = mount(ComposerCard)

      await wrapper.find('.cursor-text').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('You')
    })
  })
})
