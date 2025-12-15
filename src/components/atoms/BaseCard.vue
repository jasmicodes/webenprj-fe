<!--Container für Posts, Profile, etc. - follows design tokens: bg-white, rounded-2xl, border, shadow-sm, p-6-->
<template>
  <article class="bg-white rounded-2xl border border-slate-200 shadow-sm">
    <header v-if="$slots.header" class="p-6 pb-0">
      <slot name="header" />
    </header>

    <div class="p-6" :class="{ 'pt-4': $slots.header }">
      <slot />
    </div>

    <footer v-if="$slots.actions" class="p-6 pt-0">
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
