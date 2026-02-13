<script setup lang="ts">
import { useHuh } from '@huh/vue';

const { huh } = useHuh();
</script>

<template>
  <div class="buttons">
    <button @click="huh('ERR_NETWORK')">Toast (ERR_NETWORK)</button>
    <button @click="huh('ERR_AUTH', { userName: '홍길동' })">Modal (ERR_AUTH)</button>
    <button @click="huh('ERR_NOT_FOUND')">Page (ERR_NOT_FOUND)</button>
  </div>
</template>
