<!-- Global footer with meta/legal links -->
<template>
  <footer class="footer-glass py-4 px-6 mt-auto">
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

<style scoped>
/**
 * Glass effect for footer chrome
 */
.footer-glass {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(20px)) {
  .footer-glass {
    background: rgba(255, 255, 255, 0.95);
  }
}
</style>
