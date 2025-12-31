<!-- src/components/organisms/Navbar.vue -->
<script setup lang="ts">
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import BaseAvatar from '@/components/atoms/BaseAvatar.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { useNavbarStore, useAppearanceStore } from '@/stores/uiStore'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { computed } from 'vue'

defineOptions({ name: 'AppNavbar' })

const userStore = useUserStore()
const router = useRouter()
const navbarStore = useNavbarStore()
const { isCollapsed, toggleCollapse } = navbarStore

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
      'hidden md:flex fixed left-0 top-0 h-screen flex-col py-4 px-3 shadow-sm transition-all duration-300 navbar-glass navbar-separator',
      isCollapsed ? 'w-16' : 'w-52',
      { 'ambient-mode': isAmbientMode }
    ]"
  >
    <!-- ========== ZONE 1: Primary Activity Navigation (top) ========== -->
    <div class="flex-1 min-h-0 flex flex-col">
      <!-- Logo + Title -->
      <div
        :class="[
          'flex items-center mb-3 transition-all duration-300',
          isCollapsed ? 'justify-center gap-0 px-0' : 'gap-1.5 px-1',
        ]"
      >
        <img
          src="@/assets/Weben - Logo Motivise.svg"
          alt="Motivise Logo"
          class="w-8 h-8 rounded-md flex-shrink-0"
        />
        <h1
          :class="[
            'font-heading text-base tracking-wide transition-opacity duration-200',
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
          ]"
        >
          MOTIVISE
        </h1>
      </div>

      <!-- Primary nav links -->
      <div class="flex flex-col gap-0.5">
        <RouterLink
          :to="{ name: 'home' }"
          :title="isCollapsed ? 'Home' : ''"
          class="nav-item group relative flex items-center rounded-lg font-heading text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
          :class="isCollapsed ? 'justify-center py-1' : 'gap-2 px-2 py-1'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-7 w-7 shrink-0 grid place-items-center rounded-md transition-colors group-hover:text-slate-700">
            <BaseIcon name="HomeIcon" class="w-4 h-4" />
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
          :to="{ name: 'explore' }"
          :title="isCollapsed ? 'Explore' : ''"
          class="nav-item group relative flex items-center rounded-lg font-heading text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
          :class="isCollapsed ? 'justify-center py-1' : 'gap-2 px-2 py-1'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-7 w-7 shrink-0 grid place-items-center rounded-md transition-colors group-hover:text-slate-700">
            <BaseIcon name="MagnifyingGlassIcon" class="w-4 h-4" />
          </div>
          <span
            :class="[
              'font-heading text-sm transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            Explore
          </span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'bookmarks' }"
          :title="isCollapsed ? 'Bookmarks' : ''"
          class="nav-item group relative flex items-center rounded-lg font-heading text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
          :class="isCollapsed ? 'justify-center py-1' : 'gap-2 px-2 py-1'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-7 w-7 shrink-0 grid place-items-center rounded-md transition-colors group-hover:text-slate-700">
            <BaseIcon name="BookmarkIcon" class="w-4 h-4" />
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
          :class="isCollapsed ? 'justify-center py-1' : 'gap-2 px-2 py-1'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-7 w-7 shrink-0 grid place-items-center rounded-md transition-colors group-hover:text-slate-700">
            <BaseAvatar size="xs" use-current-user />
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

      <!-- ========== ZONE 2: Admin / Power Navigation (middle, conditional) ========== -->
      <div v-if="isAdmin" class="mt-2 pt-2">
        <!-- Section divider -->
        <div class="nav-divider mb-2" />
        <RouterLink
          :to="{ name: 'admin' }"
          :title="isCollapsed ? 'Admin' : ''"
          class="nav-item group relative flex items-center rounded-lg font-heading text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
          :class="isCollapsed ? 'justify-center py-1' : 'gap-2 px-2 py-1'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-7 w-7 shrink-0 grid place-items-center rounded-md transition-colors group-hover:text-slate-700">
            <BaseIcon name="ShieldCheckIcon" class="w-4 h-4" />
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
          :to="{ name: 'admin-demo' }"
          :title="isCollapsed ? 'Demo' : ''"
          class="nav-item group relative flex items-center rounded-lg font-heading text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-slate-900"
          :class="isCollapsed ? 'justify-center py-1' : 'gap-2 px-2 py-1'"
          active-class="nav-item-active bg-slate-100/60 text-slate-900"
        >
          <div class="h-7 w-7 shrink-0 grid place-items-center rounded-md transition-colors group-hover:text-slate-700">
            <BaseIcon name="FolderIcon" class="w-4 h-4" />
          </div>
          <span
            :class="[
              'font-heading text-sm transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            Demo
          </span>
        </RouterLink>
      </div>
    </div>

    <!-- ========== ZONE 3: Account & System Actions (bottom, anchored) ========== -->
    <div class="mt-auto pt-2 flex flex-col gap-0.5 flex-shrink-0">
      <!-- Section divider -->
      <div class="nav-divider mb-1" />
      <!-- Settings -->
      <RouterLink
        :to="{ name: 'settings' }"
        :title="isCollapsed ? 'Settings' : ''"
        class="nav-item group flex items-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 transition-all"
        :class="isCollapsed ? 'justify-center py-1' : 'gap-2 px-2 py-1'"
        active-class="nav-item-active bg-slate-100/60 text-slate-700"
      >
        <div class="h-7 w-7 shrink-0 grid place-items-center rounded-md transition-colors group-hover:text-slate-600">
          <BaseIcon name="Cog6ToothIcon" class="w-4 h-4" />
        </div>
        <span
          :class="[
            'text-sm font-medium transition-opacity duration-200',
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
          ]"
        >
          Settings
        </span>
      </RouterLink>

      <!-- Help -->
      <RouterLink
        :to="{ name: 'help' }"
        :title="isCollapsed ? 'Help' : ''"
        class="nav-item group flex items-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 transition-all"
        :class="isCollapsed ? 'justify-center py-1' : 'gap-2 px-2 py-1'"
        active-class="nav-item-active bg-slate-100/60 text-slate-700"
      >
        <div class="h-7 w-7 shrink-0 grid place-items-center rounded-md transition-colors group-hover:text-slate-600">
          <BaseIcon name="QuestionMarkCircleIcon" class="w-4 h-4" />
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
        aria-label="Logout"
        class="group flex items-center rounded-lg text-sm text-slate-500 transition-all duration-200 hover:bg-red-50/80 hover:text-red-600"
        :class="isCollapsed ? 'justify-center py-1' : 'gap-2 px-2 py-1'"
      >
        <div class="h-7 w-7 shrink-0 grid place-items-center rounded-md transition-colors group-hover:text-red-500">
          <BaseIcon name="ArrowLeftEndOnRectangleIcon" class="w-4 h-4" />
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
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!isCollapsed"
        class="group flex items-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all mt-1"
        :class="isCollapsed ? 'justify-center py-1' : 'gap-2 px-2 py-1'"
      >
        <div class="h-7 w-7 shrink-0 grid place-items-center rounded-md transition-colors group-hover:text-slate-500">
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
        <RouterLink :to="{ name: 'explore' }" class="tab-link">
          <BaseIcon name="MagnifyingGlassIcon" class="w-6 h-6" />
          <small>Explore</small>
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
          <BaseAvatar size="xs" use-current-user />
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

/* Subtle section divider - inset with low opacity */
.nav-divider {
  height: 1px;
  margin-left: 12px;
  margin-right: 12px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(148, 163, 184, 0.25) 20%,
    rgba(148, 163, 184, 0.25) 80%,
    transparent
  );
}
</style>
