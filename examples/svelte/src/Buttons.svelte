<script lang="ts">
  import { useHuh } from '@huh/svelte';

  const { handleError } = useHuh();
</script>

<div class="buttons">
  <button onclick={() => handleError('ERR_NETWORK')}>Toast (ERR_NETWORK)</button>
  <button onclick={() => handleError('ERR_AUTH', { userName: '홍길동' })}>Modal (ERR_AUTH)</button>
  <button onclick={() => handleError('ERR_NOT_FOUND')}>Page (ERR_NOT_FOUND)</button>
</div>
