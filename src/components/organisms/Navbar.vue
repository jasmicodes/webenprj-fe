<!-- src/components/organisms/Navbar.vue -->
<script setup lang="ts">
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { useNavbar } from '@/composables/useNavbar'
import { computed } from 'vue'

defineOptions({ name: 'AppNavbar' })

const userStore = useUserStore()
const router = useRouter()
const { isCollapsed, toggleCollapse } = useNavbar()

const isAdmin = computed(() => userStore.user?.role === 'ADMIN')

function handleLogout() {
  userStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <!-- Sidebar (Desktop) - Glass effect for chrome surfaces -->
  <nav
    :class="[
      'hidden md:flex fixed left-0 top-0 h-screen flex-col justify-between p-6 shadow-sm transition-all duration-300 navbar-glass',
      isCollapsed ? 'w-20' : 'w-64',
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
      <div class="flex flex-col gap-2 w-full mt-2">
        <RouterLink
          :to="{ name: 'home' }"
          :title="isCollapsed ? 'Home' : ''"
          class="flex items-center rounded-xl font-heading text-base text-slate-700 transition-all duration-200 hover:bg-primary-300 hover:text-primary-900"
          :class="isCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'"
          active-class="bg-primary-300 text-neutral-50"
        >
          <div class="h-11 w-11 shrink-0 grid place-items-center rounded-xl">
            <BaseIcon name="HomeIcon" class="w-6 h-6" />
          </div>
          <span
            :class="[
              'font-heading text-base transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            <h2>Home</h2>
          </span>
        </RouterLink>

        <RouterLink
          v-if="isAdmin"
          :to="{ name: 'admin' }"
          :title="isCollapsed ? 'Admin' : ''"
          class="flex items-center rounded-xl font-heading text-base text-slate-700 transition-all duration-200 hover:bg-primary-300 hover:text-primary-900"
          :class="isCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'"
          active-class="bg-primary-300 text-neutral-50"
        >
          <div class="h-11 w-11 shrink-0 grid place-items-center rounded-xl">
            <BaseIcon name="ShieldCheckIcon" class="w-6 h-6" />
          </div>
          <span
            :class="[
              'font-heading text-base transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            <h2>Admin</h2>
          </span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'resources' }"
          :title="isCollapsed ? 'Resources' : ''"
          class="flex items-center rounded-xl font-heading text-base text-slate-700 transition-all duration-200 hover:bg-primary-300 hover:text-primary-900"
          :class="isCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'"
          active-class="bg-primary-300 text-neutral-50"
        >
          <div class="h-11 w-11 shrink-0 grid place-items-center rounded-xl">
            <BaseIcon name="FolderIcon" class="w-6 h-6" />
          </div>
          <span
            :class="[
              'font-heading text-base transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            <h2>Resources</h2>
          </span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'profile' }"
          :title="isCollapsed ? 'Profile' : ''"
          class="flex items-center rounded-xl font-heading text-base text-slate-700 transition-all duration-200 hover:bg-primary-300 hover:text-primary-900"
          :class="isCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'"
          active-class="bg-primary-300 text-neutral-50"
        >
          <div class="h-11 w-11 shrink-0 grid place-items-center rounded-xl">
            <UserAvatar size="xs" />
          </div>
          <span
            :class="[
              'font-heading text-base transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
            ]"
          >
            <h2>Profile</h2>
          </span>
        </RouterLink>
      </div>
    </div>

    <!-- Bottom actions -->
    <div class="flex flex-col gap-2">
      <!-- Help button (secondary) -->
      <RouterLink
        :to="{ name: 'help' }"
        :title="isCollapsed ? 'Help' : ''"
        class="flex items-center rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
        :class="isCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'"
      >
        <div class="h-10 w-10 shrink-0 grid place-items-center rounded-xl">
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
        class="flex items-center rounded-xl font-heading text-base text-slate-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
        :class="isCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'"
      >
        <div class="h-11 w-11 shrink-0 grid place-items-center rounded-xl">
          <BaseIcon name="ArrowLeftEndOnRectangleIcon" class="w-6 h-6" />
        </div>
        <span
          :class="[
            'font-heading text-base transition-opacity duration-200',
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-150',
          ]"
        >
          <h2>Logout</h2>
        </span>
      </button>

      <!-- Toggle collapse button -->
      <button
        @click="toggleCollapse"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        class="flex items-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all mt-2 border-t border-slate-200 pt-4"
        :class="isCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'"
      >
        <div class="h-10 w-10 shrink-0 grid place-items-center rounded-xl">
          <BaseIcon
            :name="isCollapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'"
            class="w-5 h-5"
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
      <li v-if="isAdmin">
        <RouterLink :to="{ name: 'admin' }" class="tab-link">
          <BaseIcon name="ShieldCheckIcon" class="w-6 h-6" />
          <small>Admin</small>
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
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%); /* Safari support */
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(20px)) {
  .navbar-glass {
    background: rgba(255, 255, 255, 0.95);
  }
}
</style>
