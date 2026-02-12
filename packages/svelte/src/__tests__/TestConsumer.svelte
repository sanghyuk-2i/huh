<script lang="ts">
  import { useHuh } from '../useErrorContent';

  const { handleError, clearError } = useHuh();
</script>

<div>
  <button onclick={() => handleError('ERR_001')}>trigger toast</button>
  <button onclick={() => handleError('ERR_002', { userName: '이재민' })}>trigger modal</button>
  <button onclick={() => handleError('ERR_003')}>trigger page</button>
  <button onclick={() => handleError('ERR_CUSTOM')}>trigger custom</button>
  <button onclick={() => clearError()}>clear</button>
</div>
