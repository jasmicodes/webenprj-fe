<script setup lang="ts">
defineOptions({ name: 'ImprintView' })
</script>

<!-- views/ImprintView.vue -->
<template>
  <section class="section text-center">
    <div>
      <h1 class="mb-12">Imprint</h1>

      <div class="mb-6">
        <p>
          <strong>Motivise</strong><br />
          Demo Project for the course <em>Frontend Web Engineering</em><br />
          University of Applied Sciences Technikum Wien<br />
          Vienna, Austria
        </p>
      </div>

      <hr class="my-6 border-neutral-200" />

      <div class="mb-6 mt-6">
        <p>
          <strong>Project purpose:</strong><br />
          Motivise is a non-commercial student project created for educational purposes. The
          platform demonstrates a prototype of a social web app designed to motivate users through
          sharing and interaction.
        </p>
      </div>

      <hr class="my-6 border-neutral-200" />

      <div class="mb-6 mt-6">
        <p>
          <strong>Contact:</strong><br />
          <a href="mailto:contact@motivise.com" class="text-primary-400 underline"
            >contact@motivise.com</a
          >
        </p>
      </div>

      <p class="text-xs text-neutral-500 italic">
        This website is for demonstration and educational use only. No personal data is collected or
        shared.
      </p>
    </div>
  </section>
</template>
