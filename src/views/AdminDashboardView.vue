<!-- src/views/AdminDashboardView.vue -->
<script setup lang="ts">
defineOptions({ name: 'AdminDashboardView' })
</script>

<template>
  <section class="max-w-4xl">
    <h1 class="text-2xl font-heading mb-4">Admin Dashboard</h1>

    <p class="text-neutral-600 mb-6">
      Welcome, Admin. This area is only accessible to users with admin privileges.
    </p>

    <div class="rounded-xl border p-6 bg-neutral-50">
      <p class="font-semibold mb-2">Available admin actions:</p>
      <ul class="list-disc list-inside text-sm text-neutral-700 space-y-1">
        <li>View all registered users</li>
        <li>Activate / deactivate user accounts</li>
        <li>Manage platform content</li>
      </ul>
    </div>
  </section>
</template>
