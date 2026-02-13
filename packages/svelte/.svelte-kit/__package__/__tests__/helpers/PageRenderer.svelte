<script lang="ts">
  import type { ResolvedError } from '@sanghyuk-2i/huh-core';

  interface Props {
    error: ResolvedError;
    onAction: () => void;
    onDismiss: () => void;
  }

  let { error, onAction, onDismiss }: Props = $props();
</script>

<div data-testid="page">
  <h1>{error.title}</h1>
  <span>{error.message}</span>
  <button onclick={onAction}>{error.action?.label}</button>
</div>
