<script lang="ts">
  import { useHuh } from '@huh/svelte';

  const { huh } = useHuh();
</script>

<div class="buttons">
  <button onclick={() => huh('ERR_NETWORK')}>Toast (ERR_NETWORK)</button>
  <button onclick={() => huh('ERR_AUTH', { userName: '홍길동' })}>Modal (ERR_AUTH)</button>
  <button onclick={() => huh('ERR_NOT_FOUND')}>Page (ERR_NOT_FOUND)</button>
</div>
