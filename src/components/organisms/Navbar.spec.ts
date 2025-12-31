import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Navbar from './Navbar.vue'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
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
    template: '<a :href="to.name" class="router-link"><slot/></a>',
  },
}))

// Mock composables
vi.mock('@/composables/useMediaQuery', () => ({
  useMediaQuery: () => ({ value: false }),
}))

// Mock child components
vi.mock('@/components/atoms/BaseIcon.vue', () => ({
  default: {
    name: 'BaseIcon',
    props: ['name'],
    template: '<span class="base-icon">{{ name }}</span>',
  },
}))

vi.mock('@/components/molecules/UserAvatar.vue', () => ({
  default: {
    name: 'UserAvatar',
    template: '<div class="user-avatar"></div>',
  },
}))

// Import stores after mocking
import { useUserStore } from '@/stores/userStore'
import { useNavbarStore } from '@/stores/navbarStore'

describe('Navbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render navigation links', () => {
      const wrapper = mount(Navbar)

      expect(wrapper.text()).toContain('Home')
      expect(wrapper.text()).toContain('Bookmarks')
      expect(wrapper.text()).toContain('Profile')
      expect(wrapper.text()).toContain('Settings')
      expect(wrapper.text()).toContain('Help')
    })

    it('should render logo', () => {
      const wrapper = mount(Navbar)

      const logo = wrapper.find('img[alt="Motivise Logo"]')
      expect(logo.exists()).toBe(true)
    })

    it('should render MOTIVISE title', () => {
      const wrapper = mount(Navbar)

      expect(wrapper.text()).toContain('MOTIVISE')
    })

    it('should render logout button', () => {
      const wrapper = mount(Navbar)

      expect(wrapper.text()).toContain('Logout')
    })

    it('should have aria-label on logout button', () => {
      const wrapper = mount(Navbar)

      const logoutButton = wrapper.find('button[aria-label="Logout"]')
      expect(logoutButton.exists()).toBe(true)
    })
  })

  describe('admin navigation', () => {
    it('should not show Admin link for regular users', () => {
      const userStore = useUserStore()
      userStore.$patch({
        user: { id: '123', role: 'USER', email: 'user@example.com', username: 'user' },
      })

      const wrapper = mount(Navbar)

      // Check that Admin link is not present
      const adminLink = wrapper.findAll('.router-link').find((link) => link.text().includes('Admin'))
      expect(adminLink).toBeUndefined()
    })

    it('should show Admin link for admin users', () => {
      const userStore = useUserStore()
      userStore.$patch({
        user: { id: '123', role: 'ADMIN', email: 'admin@example.com', username: 'admin' },
      })

      const wrapper = mount(Navbar)

      expect(wrapper.text()).toContain('Admin')
    })

    it('should show Demo link for admin users', () => {
      const userStore = useUserStore()
      userStore.$patch({
        user: { id: '123', role: 'ADMIN', email: 'admin@example.com', username: 'admin' },
      })

      const wrapper = mount(Navbar)

      expect(wrapper.text()).toContain('Demo')
    })
  })

  describe('logout', () => {
    it('should call logout and navigate to login on logout click', async () => {
      const userStore = useUserStore()
      const logoutSpy = vi.spyOn(userStore, 'logout')

      const wrapper = mount(Navbar)
      const logoutButton = wrapper.find('button[aria-label="Logout"]')

      await logoutButton.trigger('click')

      expect(logoutSpy).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
    })
  })

  describe('collapse toggle', () => {
    it('should have collapse button', () => {
      const wrapper = mount(Navbar)

      // Look for button with Collapse text or aria-label
      const collapseButton = wrapper.find('button[aria-expanded]')
      expect(collapseButton.exists()).toBe(true)
    })

    it('should toggle collapse state on button click', async () => {
      const navbarStore = useNavbarStore()
      // Set explicit initial state
      navbarStore.setCollapsed(false)

      const wrapper = mount(Navbar)
      const collapseButton = wrapper.find('button[aria-expanded]')

      await collapseButton.trigger('click')

      expect(navbarStore.isCollapsed).toBe(true)
    })

    it('should have correct aria-expanded when initially expanded', async () => {
      const navbarStore = useNavbarStore()
      navbarStore.setCollapsed(false)

      const wrapper = mount(Navbar)
      await flushPromises()

      const collapseButton = wrapper.find('button[aria-expanded]')
      // aria-expanded=true when not collapsed (expanded)
      expect(collapseButton.attributes('aria-expanded')).toBe('true')
    })

    it('should have correct aria-expanded when initially collapsed', async () => {
      const navbarStore = useNavbarStore()
      navbarStore.setCollapsed(true)

      const wrapper = mount(Navbar)
      await flushPromises()

      const collapseButton = wrapper.find('button[aria-expanded]')
      // aria-expanded=false when collapsed
      expect(collapseButton.attributes('aria-expanded')).toBe('false')
    })

    it('should have w-52 class when expanded', async () => {
      const navbarStore = useNavbarStore()
      navbarStore.setCollapsed(false)

      const wrapper = mount(Navbar)
      await flushPromises()

      const nav = wrapper.find('nav.md\\:flex')
      expect(nav.classes()).toContain('w-52')
      expect(nav.classes()).not.toContain('w-16')
    })

    it('should have w-16 class when collapsed', async () => {
      const navbarStore = useNavbarStore()
      navbarStore.setCollapsed(true)

      const wrapper = mount(Navbar)
      await flushPromises()

      const nav = wrapper.find('nav.md\\:flex')
      expect(nav.classes()).toContain('w-16')
      expect(nav.classes()).not.toContain('w-52')
    })
  })

  describe('mobile navigation', () => {
    it('should render mobile bottom navigation', () => {
      const wrapper = mount(Navbar)

      const mobileNav = wrapper.find('nav.md\\:hidden')
      expect(mobileNav.exists()).toBe(true)
    })

    it('should have Home, Bookmarks, Profile in mobile nav', () => {
      const wrapper = mount(Navbar)

      const mobileNav = wrapper.find('nav.md\\:hidden')
      expect(mobileNav.text()).toContain('Home')
      expect(mobileNav.text()).toContain('Bookmarks')
      expect(mobileNav.text()).toContain('Profile')
    })
  })

  describe('icons', () => {
    it('should render icons for navigation items', () => {
      const wrapper = mount(Navbar)

      const icons = wrapper.findAll('.base-icon')
      expect(icons.length).toBeGreaterThan(0)

      // Check for specific icons
      const iconNames = icons.map((icon) => icon.text())
      expect(iconNames).toContain('HomeIcon')
      expect(iconNames).toContain('BookmarkIcon')
    })
  })
})
