<!-- src/components/organisms/Navbar.vue -->
<script setup lang="ts">
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { useNavbar } from '@/composables/useNavbar'
import { useAppearanceStore } from '@/stores/appearanceStore'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { computed } from 'vue'

defineOptions({ name: 'AppNavbar' })

const userStore = useUserStore()
const router = useRouter()
const { isCollapsed, toggleCollapse } = useNavbar()

const isAdmin = computed(() => userStore.user?.role === 'ADMIN')

// Ambient mode detection for enhanced styling
const appearanceStore = useAppearanceStore()
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

function handleLogout() {
  userStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <!-- Sidebar (Desktop) - Glass effect for chrome surfaces -->
  <nav
    :class="[
      'hidden md:flex fixed left-0 top-0 h-screen flex-col justify-between p-6 shadow-sm transition-all duration-300 navbar-glass navbar-separator',
      isCollapsed ? 'w-20' : 'w-64',
      { 'ambient-mode': isAmbientMode }
    ]"
  >
    <!-- Logo + Titel -->
    <div>
      <div
        :class="[
          'flex items-center mb-10 transition-all duration-300',
          isCollapsed ? 'justify-center gap-0' : 'gap-1',
        ]"
      >
        <img
          src="@/assets/Weben - Logo Motivise.svg"
          alt="Motivise Logo"
          class="w-20 h-20 rounded-lg flex-shrink-0"
        />
        <h1
          :class="[
            'font-heading text-xl tracking-wide transition-opacity duration-200',
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
          ]"
        >
          MOTIVISE
        </h1>
      </div>

      <!-- Hauptmenülinks -->
      <div class="flex flex-col gap-1 w-full mt-2">
        <RouterLink
          :to="{ name: 'home' }"
          :title="isCollapsed ? 'Home' : ''"
          class="nav-item group relative flex items-center rounded-lg font-heading text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
          :class="isCollapsed ? 'justify-center py-1.5' : 'gap-3 px-3 py-1.5'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-9 w-9 shrink-0 grid place-items-center rounded-lg transition-colors group-hover:text-slate-700">
            <BaseIcon name="HomeIcon" class="w-5 h-5" />
          </div>
          <span
            :class="[
              'font-heading text-sm transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            Home
          </span>
        </RouterLink>

        <RouterLink
          v-if="isAdmin"
          :to="{ name: 'admin' }"
          :title="isCollapsed ? 'Admin' : ''"
          class="nav-item group relative flex items-center rounded-lg font-heading text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
          :class="isCollapsed ? 'justify-center py-1.5' : 'gap-3 px-3 py-1.5'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-9 w-9 shrink-0 grid place-items-center rounded-lg transition-colors group-hover:text-slate-700">
            <BaseIcon name="ShieldCheckIcon" class="w-5 h-5" />
          </div>
          <span
            :class="[
              'font-heading text-sm transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            Admin
          </span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'resources' }"
          :title="isCollapsed ? 'Resources' : ''"
          class="nav-item group relative flex items-center rounded-lg font-heading text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
          :class="isCollapsed ? 'justify-center py-1.5' : 'gap-3 px-3 py-1.5'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-9 w-9 shrink-0 grid place-items-center rounded-lg transition-colors group-hover:text-slate-700">
            <BaseIcon name="FolderIcon" class="w-5 h-5" />
          </div>
          <span
            :class="[
              'font-heading text-sm transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            Resources
          </span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'bookmarks' }"
          :title="isCollapsed ? 'Bookmarks' : ''"
          class="nav-item group relative flex items-center rounded-lg font-heading text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
          :class="isCollapsed ? 'justify-center py-1.5' : 'gap-3 px-3 py-1.5'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-9 w-9 shrink-0 grid place-items-center rounded-lg transition-colors group-hover:text-slate-700">
            <BaseIcon name="BookmarkIcon" class="w-5 h-5" />
          </div>
          <span
            :class="[
              'font-heading text-sm transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            Bookmarks
          </span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'profile' }"
          :title="isCollapsed ? 'Profile' : ''"
          class="nav-item group relative flex items-center rounded-lg font-heading text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
          :class="isCollapsed ? 'justify-center py-1.5' : 'gap-3 px-3 py-1.5'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-9 w-9 shrink-0 grid place-items-center rounded-lg transition-colors group-hover:text-slate-700">
            <UserAvatar size="xs" />
          </div>
          <span
            :class="[
              'font-heading text-sm transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            Profile
          </span>
        </RouterLink>
      </div>
    </div>

    <!-- Bottom actions -->
    <div class="flex flex-col gap-1">
      <!-- Help button (secondary) -->
      <RouterLink
        :to="{ name: 'help' }"
        :title="isCollapsed ? 'Help' : ''"
        class="nav-item group flex items-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 transition-all"
        :class="isCollapsed ? 'justify-center py-1.5' : 'gap-3 px-3 py-1.5'"
        active-class="nav-item-active bg-slate-100/60 text-slate-700"
      >
        <div class="h-9 w-9 shrink-0 grid place-items-center rounded-lg transition-colors group-hover:text-slate-600">
          <BaseIcon name="QuestionMarkCircleIcon" class="w-5 h-5" />
        </div>
        <span
          :class="[
            'text-sm font-medium transition-opacity duration-200',
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
          ]"
        >
          Help
        </span>
      </RouterLink>

      <!-- Logout -->
      <button
        @click="handleLogout"
        :title="isCollapsed ? 'Logout' : ''"
        class="group flex items-center rounded-lg text-sm text-slate-600 transition-all duration-200 hover:bg-red-50/80 hover:text-red-600"
        :class="isCollapsed ? 'justify-center py-1.5' : 'gap-3 px-3 py-1.5'"
      >
        <div class="h-9 w-9 shrink-0 grid place-items-center rounded-lg transition-colors group-hover:text-red-500">
          <BaseIcon name="ArrowLeftEndOnRectangleIcon" class="w-5 h-5" />
        </div>
        <span
          :class="[
            'font-medium text-sm transition-opacity duration-200',
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
          ]"
        >
          Logout
        </span>
      </button>

      <!-- Toggle collapse button -->
      <button
        @click="toggleCollapse"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        class="group flex items-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all mt-2 border-t border-slate-200/60 pt-3"
        :class="isCollapsed ? 'justify-center py-1.5' : 'gap-3 px-3 py-1.5'"
      >
        <div class="h-9 w-9 shrink-0 grid place-items-center rounded-lg transition-colors group-hover:text-slate-500">
          <BaseIcon
            :name="isCollapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'"
            class="w-4 h-4"
          />
        </div>
        <span
          :class="[
            'text-sm font-medium transition-opacity duration-200',
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
          ]"
        >
          Collapse
        </span>
      </button>
    </div>
  </nav>

  <!-- Bottom Navigation (Mobile) -->
  <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 shadow-sm">
    <ul class="grid grid-cols-4 text-sm text-neutral-700">
      <li>
        <RouterLink :to="{ name: 'home' }" class="tab-link">
          <BaseIcon name="HomeIcon" class="w-6 h-6" />
          <small>Home</small>
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'resources' }" class="tab-link">
          <BaseIcon name="FolderIcon" class="w-6 h-6" />
          <small>Resources</small>
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'bookmarks' }" class="tab-link">
          <BaseIcon name="BookmarkIcon" class="w-6 h-6" />
          <small>Bookmarks</small>
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'profile' }" class="tab-link">
          <UserAvatar size="xs" />
          <small>Profile</small>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/**
 * Glass effect for navigation chrome (desktop only)
 *
 * Visual hierarchy:
 * - Chrome (navigation) = glass with backdrop blur
 * - Content (posts) = solid white
 * - Background = ambient only
 */
.navbar-glass {
  /* Clean mode: solid background */
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* Ambient mode: enhanced glass effect */
.navbar-glass.ambient-mode {
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
}

/* Subtle separation from content */
.navbar-separator {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

/* Enhanced separation in ambient mode */
.navbar-separator.ambient-mode {
  border-right: 1px solid rgba(0, 0, 0, 0.10);
  box-shadow: 3px 0 12px rgba(0, 0, 0, 0.04);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(24px)) {
  .navbar-glass.ambient-mode {
    background: rgba(255, 255, 255, 0.95);
  }
}

/* Nav item active state with left accent indicator */
.nav-item-active {
  position: relative;
}

.nav-item-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: #64748b; /* slate-500 - subtle accent */
  border-radius: 0 2px 2px 0;
}

/* Hover state enhancement for inactive nav items */
.nav-item:not(.nav-item-active):hover {
  background: rgba(241, 245, 249, 0.8); /* slate-100 with transparency */
}
</style>
