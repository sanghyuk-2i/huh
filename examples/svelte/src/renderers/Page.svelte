<script lang="ts">
  import type { ResolvedError } from '@huh/core';

  interface Props {
    error: ResolvedError;
    onAction: () => void;
    onDismiss: () => void;
  }

  let { error, onAction }: Props = $props();
</script>

<div class="error-page">
  {#if error.image}
    <img src={error.image} alt="" />
  {/if}
  <h1>{error.title}</h1>
  <p>{error.message}</p>
  {#if error.action}
    <button onclick={onAction}>{error.action.label}</button>
  {/if}
</div>
