<!-- src/components/organisms/Navbar.vue -->
<script setup lang="ts">
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const userStore = useUserStore()
const router = useRouter()
const moreOpen = ref(false)

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

        <RouterLink :to="{ name: 'resources' }" class="navbar-link">
          <BaseIcon name="FolderIcon" />
          <span><h2>Resources</h2></span>
        </RouterLink>

        <RouterLink :to="{ name: 'imprint' }" class="navbar-link">
          <BaseIcon name="DocumentTextIcon" />
          <span><h2>Imprint</h2></span>
        </RouterLink>

        <RouterLink :to="{ name: 'help' }" class="navbar-link">
          <BaseIcon name="QuestionMarkCircleIcon" />
          <span><h2>Help</h2></span>
        </RouterLink>

        <RouterLink :to="{ name: 'profile' }" class="navbar-link">
          <div class="avatar avatar-sm">
            <img src="@/assets/user4.avif" alt="User avatar" class="avatar-img" />
          </div>
          <span><h2>Profile</h2></span>
        </RouterLink>
      </div>
    </div>

    <!-- Logout unten -->

    <button @click="handleLogout" class="navbar-link">
      <BaseIcon name="ArrowLeftEndOnRectangleIcon" />
      <span><h2>Logout</h2></span>
    </button>
  </nav>

  <!-- Bottom Navigation (Mobile) -->
  <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 shadow-sm">
    <ul class="grid grid-cols-5 text-sm text-neutral-700">
      <li>
        <RouterLink :to="{ name: 'home' }" class="tab-link">
          <BaseIcon name="HomeIcon" class="w-6 h-6" />
          <small>Home</small>
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'resources' }" class="tab-link">
          <BaseIcon name="FolderIcon" class="w-6 h-6" />
          <small>Res.</small>
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'imprint' }" class="tab-link">
          <BaseIcon name="DocumentTextIcon" class="w-6 h-6" />
          <small>Imp.</small>
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'help' }" class="tab-link">
          <BaseIcon name="QuestionMarkCircleIcon" class="w-6 h-6" />
          <small>Help</small>
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
