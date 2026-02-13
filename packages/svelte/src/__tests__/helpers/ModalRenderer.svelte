<script lang="ts">
  import type { ResolvedError } from '@sanghyuk-2i/huh-core';

  interface Props {
    error: ResolvedError;
    onAction: () => void;
    onDismiss: () => void;
  }

  let { error, onAction, onDismiss }: Props = $props();
</script>

<div data-testid="modal">
  <h2>{error.title}</h2>
  <span>{error.message}</span>
  <button onclick={onAction}>{error.action?.label}</button>
  <button onclick={onDismiss}>close</button>
</div>
