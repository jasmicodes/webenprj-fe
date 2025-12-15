<!--Container für Posts, Profile, etc. - follows design tokens: bg-white, rounded-2xl, border, shadow-sm, p-6-->
<template>
  <article class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
    <header v-if="$slots.header" class="px-6 pt-6 pb-4">
      <slot name="header" />
    </header>

    <div class="px-6" :class="$slots.header ? 'pb-4' : 'pt-6 pb-4'">
      <slot />
    </div>

    <footer v-if="$slots.actions" class="px-6 pb-6 overflow-visible">
      <slot name="actions" />
    </footer>
  </article>
</template>

<script setup lang="ts">
// Card following design rules:
// - bg-white
// - rounded-2xl
// - border border-slate-200
// - shadow-sm
// - p-6 padding on sections
// - supports header, body (default), and actions slots
</script>
