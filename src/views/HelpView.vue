<template>
  <div class="min-h-screen flex items-start justify-center px-8">
    <div class="w-full max-w-4xl py-8 content-glass-container">
      <!-- Page Title -->
      <h1 class="text-2xl font-semibold text-slate-900 mb-3">Help & Support</h1>
      <p class="text-sm text-slate-600 mb-8">
        Need assistance with Motivise? Below you'll find useful information and answers to common
        questions.
      </p>

      <!-- FAQ Items -->
      <div class="space-y-6">
        <BaseCard>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">🧩 How do I create a post?</h3>
          <p class="text-sm text-slate-600">
            Go to your feed and use the composer card at the top. You can add a subject, content,
            and an optional image before publishing.
          </p>
        </BaseCard>

        <BaseCard>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">💬 Can I comment or like other posts?</h3>
          <p class="text-sm text-slate-600">
            Yes! Simply click the heart icon below any post to like it and engage with other users.
          </p>
        </BaseCard>

        <BaseCard>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">🔒 I forgot my password. What can I do?</h3>
          <p class="text-sm text-slate-600">
            On the login page, click <strong>"Forgot password?"</strong> and follow the instructions
            to reset it via email.
          </p>
        </BaseCard>

        <BaseCard>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">🎨 How do I change the background?</h3>
          <p class="text-sm text-slate-600">
            Go to your profile and scroll to the <strong>"Appearance"</strong> section. There you can
            toggle backgrounds on/off and select from curated ambient backgrounds.
          </p>
        </BaseCard>

        <BaseCard>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">📨 Still need help?</h3>
          <p class="text-sm text-slate-600">
            You can reach our support team at
            <a href="mailto:support@motivise.com" class="text-primary-500 hover:text-primary-600 underline">
              support@motivise.com
            </a>.
          </p>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '@/components/atoms/BaseCard.vue'
</script>

<style scoped>
/**
 * Glass effect for main content container
 * Subtle backdrop for the help area
 */
.content-glass-container {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  margin-top: 16px;
  margin-bottom: 16px;
  padding-left: 24px;
  padding-right: 24px;
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(8px)) {
  .content-glass-container {
    background: rgba(255, 255, 255, 0.85);
  }
}
</style>
