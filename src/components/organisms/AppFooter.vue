<!-- Global footer with meta/legal links -->
<template>
  <footer class="bg-white border-t border-slate-200 py-4 px-6 mt-auto">
    <div class="max-w-5xl mx-auto flex justify-center items-center">
      <RouterLink
        :to="{ name: 'imprint' }"
        class="text-xs text-slate-500 hover:text-slate-700 transition-colors"
      >
        Imprint
      </RouterLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppFooter' })
</script>
