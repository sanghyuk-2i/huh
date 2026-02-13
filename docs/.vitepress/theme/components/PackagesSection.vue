<template>
  <div class="packages-section">
    <h2>📦 Packages</h2>
    <div class="packages-grid">
      <div class="package-card">
        <div class="package-emoji">📦</div>
        <div class="package-name">@sanghyuk-2i/huh-core</div>
        <div class="package-desc">
          Zero dependencies. 타입 정의, 파싱, 템플릿 엔진, 유효성 검증을 담당하는 핵심 패키지
        </div>
      </div>

      <div class="package-card">
        <div class="package-emoji">⚛️</div>
        <div class="package-name">@sanghyuk-2i/huh-react</div>
        <div class="package-desc">
          React 18+ 지원. HuhProvider와 useHuh 훅으로 간편한 통합
        </div>
      </div>

      <div class="package-card">
        <div class="package-emoji">💚</div>
        <div class="package-name">@sanghyuk-2i/huh-vue</div>
        <div class="package-desc">
          Vue 3 지원. Composition API 스타일의 useHuh composable 제공
        </div>
      </div>

      <div class="package-card">
        <div class="package-emoji">🔥</div>
        <div class="package-name">@sanghyuk-2i/huh-svelte</div>
        <div class="package-desc">
          Svelte 5 지원. Reactive한 에러 핸들링 바인딩
        </div>
      </div>

      <div class="package-card">
        <div class="package-emoji">⚡</div>
        <div class="package-name">@sanghyuk-2i/huh-cli</div>
        <div class="package-desc">
          커맨드라인 도구. init, pull, validate 명령으로 워크플로우 자동화
        </div>
      </div>

      <div class="package-card">
        <div class="package-emoji">🧪</div>
        <div class="package-name">@sanghyuk-2i/huh-test</div>
        <div class="package-desc">
          테스팅 유틸리티. Vitest, Jest와 함께 사용 가능
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.packages-section {
  margin: 120px auto;
  max-width: 1200px;
  padding: 0 24px;
}

.packages-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 4rem;
  border: none !important;
  padding-top: 0 !important;
}

.packages-section h2::before,
.packages-section h2::after {
  display: none !important;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-top: 48px;
}

.package-card {
  background: white;
  border: 2px solid rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.package-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
}

.package-card .package-name {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: bold;
  color: #8B5CF6;
  margin-bottom: 8px;
}

.package-card .package-emoji {
  font-size: 2rem;
  margin-bottom: 12px;
}

.package-card .package-desc {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .packages-grid {
    grid-template-columns: 1fr;
  }
}

.dark .package-card {
  background: rgba(30, 30, 30, 0.5);
  border-color: rgba(139, 92, 246, 0.2);
}

.dark .package-card:hover {
  background: rgba(40, 40, 40, 0.8);
  border-color: rgba(139, 92, 246, 0.4);
}

.dark .package-card .package-desc {
  color: #aaa;
}
</style>
