// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// Extend Vue Router types for custom meta fields
declare module 'vue-router' {
  interface RouteMeta {
    authPage?: boolean
    devOnly?: boolean
  }
}

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
  {
    path: '/styleguide',
    name: 'styleguide',
    component: () => import('@/views/StyleGuideView.vue'),
  },

  // 404 Catch-All Route (must be last)
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

if (import.meta.env.DEV) {
  routes.push({
    path: '/dev/playground',
    name: 'dev-playground',
    component: () => import('@/views/Playground.vue'),
    meta: { devOnly: true },
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Guard: Auth-Pages always allowed, all others only with Tokens
router.beforeEach((to) => {
  const store = useUserStore()

  // Logged in and want to Login/Register? -> Home
  if (store.isAuthenticated && to.meta.authPage) {
    return { name: 'home' }
  }

  // Auth-Sites free (for anonymous)
  if (to.meta.authPage) return true

  // Block dev-only routes in production just in case
  if (to.meta.devOnly && !import.meta.env.DEV) {
    return { name: 'not-found' }
  }

  if (!store.isAuthenticated) {
    return { name: 'login' }
  }

  return true
})

export default router
