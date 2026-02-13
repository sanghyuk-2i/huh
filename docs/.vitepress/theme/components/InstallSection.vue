<template>
  <div class="install-section">
    <h2>⚡ Quick Install</h2>
    <div class="code-tabs">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.install-section {
  text-align: center;
  padding: 80px 24px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%);
  border-radius: 16px;
  margin: 80px auto;
  max-width: 1200px;
}

.install-section h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border: none !important;
  padding-top: 0 !important;
}

.install-section h2::before,
.install-section h2::after {
  display: none !important;
}

.code-tabs {
  margin: 32px 0;
}
</style>
