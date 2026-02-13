<template>
  <div class="workflow-section">
    <h2>🔄 How It Works</h2>
    <div class="workflow-steps">
      <div class="workflow-step">
        <div class="step-number">1</div>
        <div class="step-icon">📊</div>
        <h3>Create Spreadsheet</h3>
        <p>PM이 Google Sheets나 Notion에서 에러 메시지를 정의합니다. 개발자 없이도 언제든 수정 가능합니다.</p>
      </div>

      <div class="workflow-step">
        <div class="step-number">2</div>
        <div class="step-icon">⚙️</div>
        <h3>Run CLI</h3>
        <p><code>huh pull</code> 명령으로 타입 안전한 JSON을 자동 생성. 빌드 타임에 유효성을 검증합니다.</p>
      </div>

      <div class="workflow-step">
        <div class="step-number">3</div>
        <div class="step-icon">🚀</div>
        <h3>Use in App</h3>
        <p>React/Vue/Svelte에서 한 줄로 에러 UI를 렌더링. 완전한 타입 지원과 자동완성을 제공합니다.</p>
      </div>
    </div>

    <div class="code-example">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.workflow-section {
  margin: 120px auto;
  max-width: 1200px;
  padding: 0 24px;
}

.workflow-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 4rem;
  border: none !important;
  padding-top: 0 !important;
}

.workflow-section h2::before,
.workflow-section h2::after {
  display: none !important;
}

.workflow-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 48px;
  margin-bottom: 64px;
}

.workflow-step {
  background: white;
  border: 2px solid rgba(139, 92, 246, 0.1);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
}

.workflow-step:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 48px rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.3);
}

.workflow-step .step-number {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.workflow-step .step-icon {
  font-size: 4rem;
  margin: 24px 0;
}

.workflow-step h3 {
  font-size: 1.5rem;
  margin: 16px 0;
  color: #8B5CF6;
}

.workflow-step p {
  color: #666;
  line-height: 1.6;
}

.code-example {
  margin-top: 64px;
}

@media (max-width: 768px) {
  .workflow-steps {
    grid-template-columns: 1fr;
  }
}

.dark .workflow-step {
  background: rgba(30, 30, 30, 0.5);
  border-color: rgba(139, 92, 246, 0.2);
}

.dark .workflow-step:hover {
  background: rgba(40, 40, 40, 0.8);
  border-color: rgba(139, 92, 246, 0.4);
}

.dark .workflow-step p {
  color: #aaa;
}
</style>
