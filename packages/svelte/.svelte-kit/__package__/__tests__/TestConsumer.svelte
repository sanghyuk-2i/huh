<script lang="ts">
  import { useHuh } from '../useErrorContent';

  const { huh, clearError } = useHuh();
</script>

<div>
  <button onclick={() => huh('ERR_001')}>trigger toast</button>
  <button onclick={() => huh('ERR_002', { userName: '이재민' })}>trigger modal</button>
  <button onclick={() => huh('ERR_003')}>trigger page</button>
  <button onclick={() => huh('ERR_CUSTOM')}>trigger custom</button>
  <button onclick={() => huh('ERR_REDIRECT')}>trigger redirect</button>
  <button onclick={() => huh('API_500')}>by-code</button>
  <button onclick={() => huh('ERR_001')}>direct-trackid</button>
  <button onclick={() => huh('UNKNOWN_CODE')}>unknown-code</button>
  <button onclick={() => clearError()}>clear</button>
</div>
