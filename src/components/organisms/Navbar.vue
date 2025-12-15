<!-- src/components/organisms/Navbar.vue -->
<script setup lang="ts">
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

defineOptions({ name: 'AppNavbar' })

const userStore = useUserStore()
const router = useRouter()

const isAdmin = computed(() => userStore.user?.role === 'ADMIN')

function handleLogout() {
  userStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <!-- Sidebar (Desktop) -->
  <nav
    class="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-neutral-200 flex-col justify-between p-6 shadow-sm"
  >
    <!-- Logo + Titel -->
    <div>
      <div class="flex items-center gap-1 mb-10">
        <img
          src="@/assets/Weben - Logo Motivise.svg"
          alt="Motivise Logo"
          class="w-20 h-20 rounded-lg"
        />
        <h1 class="font-heading text-xl tracking-wide">MOTIVISE</h1>
      </div>

      <!-- Hauptmenülinks -->
      <div class="flex flex-col gap-6 w-full mt-2">
        <RouterLink :to="{ name: 'home' }" class="navbar-link w-full">
          <BaseIcon name="HomeIcon" />
          <span><h2>Home</h2></span>
        </RouterLink>

        <RouterLink v-if="isAdmin" :to="{ name: 'admin' }" class="navbar-link">
          <BaseIcon name="ShieldCheckIcon" />
          <span><h2>Admin</h2></span>
        </RouterLink>

        <RouterLink :to="{ name: 'resources' }" class="navbar-link">
          <BaseIcon name="FolderIcon" />
          <span><h2>Resources</h2></span>
        </RouterLink>

        <RouterLink :to="{ name: 'profile' }" class="navbar-link">
          <UserAvatar class="w-5 h-5 rounded-full object-cover" />
          <span><h2>Profile</h2></span>
        </RouterLink>
      </div>
    </div>

    <!-- Bottom actions -->
    <div class="flex flex-col gap-3">
      <!-- Help button (secondary) -->
      <RouterLink :to="{ name: 'help' }" class="flex items-center gap-3 text-slate-500 hover:text-slate-700 transition-colors px-2 py-1.5">
        <BaseIcon name="QuestionMarkCircleIcon" class="w-4 h-4" />
        <span class="text-sm">Help</span>
      </RouterLink>

      <!-- Logout -->
      <button @click="handleLogout" class="navbar-link">
        <BaseIcon name="ArrowLeftEndOnRectangleIcon" />
        <span><h2>Logout</h2></span>
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
          <BaseIcon name="UserIcon" class="w-6 h-6" />
          <small>Profile</small>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
