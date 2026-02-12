<script lang="ts">
  import type { ResolvedError } from '@huh/core';

  interface Props {
    error: ResolvedError;
    onAction: () => void;
    onDismiss: () => void;
  }

  let { error, onAction, onDismiss }: Props = $props();
</script>

<div data-testid="banner">
  <span>{error.message}</span>
  <button onclick={onAction}>{error.action?.label}</button>
  <button onclick={onDismiss}>close</button>
</div>
