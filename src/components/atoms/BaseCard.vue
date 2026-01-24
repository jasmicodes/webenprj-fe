<!--
  BaseCard - Container with header/body/actions slots.
  Used for posts, profile cards, and content sections.
-->
<template>
  <article class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
    <header v-if="$slots.header" class="px-5 pt-4 pb-3">
      <slot name="header" />
    </header>

    <div class="px-5" :class="$slots.header ? 'pb-4' : 'py-4'">
      <slot />
    </div>

    <footer v-if="$slots.actions" class="px-5 pb-4 overflow-visible">
      <slot name="actions" />
    </footer>
  </article>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseCard' })

// Card design tokens:
// - bg-white, rounded-2xl, border-slate-200, shadow-sm
// - Tighter padding (px-5, pt-4/pb-3) for modern density
// - Supports header, body (default), and actions slots
</script>
