<script lang="ts">
  import type { ResolvedError } from '@huh/core';

  interface Props {
    error: ResolvedError;
    onAction: () => void;
    onDismiss: () => void;
  }

  let { error, onAction, onDismiss }: Props = $props();
</script>

<div class="modal-overlay" onclick={onDismiss} role="dialog">
  <div class="modal" onclick={(e) => e.stopPropagation()} role="document">
    <h2>{error.title}</h2>
    <p>{error.message}</p>
    <div class="modal-actions">
      <button class="btn-secondary" onclick={onDismiss}>닫기</button>
      {#if error.action}
        <button onclick={onAction}>{error.action.label}</button>
      {/if}
    </div>
  </div>
</div>
