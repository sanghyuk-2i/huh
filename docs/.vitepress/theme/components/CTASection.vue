<template>
  <div class="cta-section">
    <h2>Ready to Ship Faster? 🚀</h2>
    <p>
      하드코딩된 에러 메시지는 이제 그만. 팀이 가장 잘 사용하는 도구에서 콘텐츠를 관리하세요.
    </p>
    <div class="cta-buttons">
      <a href="/ko/getting-started" class="cta-button primary">시작하기 →</a>
      <a href="/en/getting-started" class="cta-button primary">Get Started →</a>
      <a href="https://github.com/sanghyuk-2i/huh" class="cta-button secondary" target="_blank">⭐ Star on GitHub</a>
    </div>
  </div>
</template>

<style scoped>
.cta-section {
  text-align: center;
  padding: 100px 24px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
  border-radius: 24px;
  margin: 120px auto 80px;
  max-width: 1200px;
}

.cta-section h2 {
  font-size: 3rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border: none !important;
  padding-top: 0 !important;
  padding-bottom: 0.2em;
  line-height: 1.2;
}

.cta-section h2::before,
.cta-section h2::after {
  display: none !important;
}

.cta-section p {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  display: inline-block;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cta-button.primary {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
}

.cta-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(139, 92, 246, 0.4);
}

.cta-button.secondary {
  background: white;
  color: #8B5CF6;
  border: 2px solid #8B5CF6;
}

.cta-button.secondary:hover {
  background: rgba(139, 92, 246, 0.05);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .cta-section h2 {
    font-size: 2rem;
  }
}

.dark .cta-section p {
  color: #aaa;
}

.dark .cta-button.secondary {
  background: rgba(139, 92, 246, 0.1);
  border-color: #8B5CF6;
}
</style>
