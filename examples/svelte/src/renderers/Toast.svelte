<script lang="ts">
  import type { ResolvedError } from '@sanghyuk-2i/huh-core';

  interface Props {
    error: ResolvedError;
    onAction: () => void;
    onDismiss: () => void;
  }

  let { error, onDismiss }: Props = $props();
</script>

<div class="toast" onclick={onDismiss} role="alert">
  {error.message}
</div>
