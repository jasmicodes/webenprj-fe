<script setup lang="ts">
defineOptions({ name: 'StyleGuideView' })
</script>

<template>
  <main class="container-app space-y-10 py-10">
    <!-- Buttons -->
    <section>
      <h3>Buttons</h3>
      <div class="flex flex-wrap gap-3">
        <button class="btn btn-primary">Primary</button>
        <button class="btn btn-outline">Outline</button>
        <button class="btn btn-ghost">Ghost</button>
        <button class="btn btn-danger">Danger</button>
        <button class="btn btn-primary btn-sm">Small</button>
      </div>
      <button class="btn btn-primary btn-lg">Large</button>
    </section>

    <!-- Inputs -->
    <section>
      <h2>Form Controls</h2>
      <label class="label">Email</label>
      <input class="input" type="email" placeholder="you@example.com" />

      <label class="label mt-4">Textarea</label>
      <textarea class="textarea" placeholder="Write something..."></textarea>

      <label class="label mt-4">Select</label>
      <select class="select">
        <option>Option A</option>
        <option>Option B</option>
      </select>
    </section>

    <!-- Cards -->
    <section>
      <h2>Cards</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="card card-pad">
          <h3 class="font-heading text-lg">Card Example</h3>
          <p>This is a sample card with padding.</p>
          <div class="card-actions">
            <button class="btn btn-outline">Cancel</button>
            <button class="btn btn-primary">Save</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Chips / Tags -->
    <section>
      <h2>Chips & Tags</h2>
      <div class="flex flex-wrap gap-2">
        <span class="chip">Default</span>
        <span class="chip chip-muted">Muted</span>
        <span class="chip tag">#Mathe</span>
      </div>
    </section>

    <!-- Avatars -->
    <section>
      <h2>Avatars</h2>
      <div class="flex items-center gap-4">
        <div class="avatar avatar-sm">
          <img src="@/assets/user1.avif" alt="User" class="avatar-img" />
        </div>
        <div class="avatar avatar-md">
          <img src="@/assets/user4.avif" alt="User" class="avatar-img" />
        </div>
        <div class="avatar avatar-lg">
          <img src="@/assets/user5.avif" alt="User" class="avatar-img" />
        </div>
        <div class="avatar avatar-lg">
          <img src="@/assets/user6.avif" alt="User" class="avatar-img" />
        </div>
      </div>
    </section>

    <!-- Navbar Links -->
    <section>
      <p>Navbar Link Example</p>
      <div class="flex gap-2 bg-neutral-100 p-3 rounded-xl">
        <RouterLink to="/" class="navbar-link">Home</RouterLink>
        <RouterLink to="/" class="navbar-link router-link-active">Active</RouterLink>
      </div>
    </section>
  </main>
</template>
