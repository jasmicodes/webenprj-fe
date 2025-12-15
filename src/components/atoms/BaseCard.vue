<!--Container für Posts, Profile, etc. - follows design tokens: bg-white, rounded-2xl, border, shadow-sm, p-6-->
<template>
  <article class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <slot />
  </article>
</template>

<script setup lang="ts">
// Simple card following design rules:
// - bg-white
// - rounded-2xl
// - border border-slate-200
// - shadow-sm
// - p-6 padding
</script>
