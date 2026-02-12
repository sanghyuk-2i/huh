<script setup lang="ts">
import { useHuh } from '@huh/vue';

const { handleError } = useHuh();
</script>

<template>
  <div class="buttons">
    <button @click="handleError('ERR_NETWORK')">Toast (ERR_NETWORK)</button>
    <button @click="handleError('ERR_AUTH', { userName: '홍길동' })">Modal (ERR_AUTH)</button>
    <button @click="handleError('ERR_NOT_FOUND')">Page (ERR_NOT_FOUND)</button>
  </div>
</template>
