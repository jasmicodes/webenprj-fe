// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const routes: RouteRecordRaw[] = [
  // Auth-Sites (visible without login)
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { authPage: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { authPage: true },
  },

  // Main Sites (only after login)
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  {
    path: '/resources',
    name: 'resources',
    component: () => import('@/views/ResourceListView.vue'),
  },
  { path: '/imprint', name: 'imprint', component: () => import('@/views/ImprintView.vue') },
  { path: '/help', name: 'help', component: () => import('@/views/HelpView.vue') },
  { path: '/profile', name: 'profile', component: () => import('@/views/ProfileView.vue') },
  { path: '/playground', name: 'playground', component: () => import('@/views/Playground.vue') },
  {
    path: '/styleguide',
    name: 'styleguide',
    component: () => import('@/views/StyleGuideView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Guard: Auth-Pages always allowed, all others only with Tokens
router.beforeEach((to) => {
  const store = useUserStore()

  // Logged in an want to Login/Register? -> Home
  if (store.isAuthenticated && to.meta.authPage) {
    return { name: 'home' }
  }

  // Auth-Sites free (for anonymous)
  if (to.meta.authPage) return true

  if (!store.isAuthenticated) {
    return { name: 'login' }
  }

  return true
})

export default router
