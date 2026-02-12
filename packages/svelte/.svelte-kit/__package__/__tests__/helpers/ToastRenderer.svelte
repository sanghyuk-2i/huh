<script lang="ts">
  import type { ResolvedError } from '@huh/core';

  interface Props {
    error: ResolvedError;
    onAction: () => void;
    onDismiss: () => void;
  }

  let { error, onAction, onDismiss }: Props = $props();
</script>

<div data-testid="toast">
  <span>{error.message}</span>
  <button onclick={onDismiss}>close</button>
</div>
