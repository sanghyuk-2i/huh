<script setup lang="ts">
import { HuhProvider } from '@huh/vue';
import type { ErrorConfig } from '@huh/core';
import errorConfig from './huh.json';
import { renderers } from './renderers';
import Buttons from './Buttons.vue';

const config = errorConfig as ErrorConfig;
</script>

<template>
  <HuhProvider :source="config" :renderers="renderers">
    <div id="app">
      <h1>huh — Vue Example</h1>
      <p>버튼을 클릭하여 에러 UI를 확인하세요.</p>
      <Buttons />
    </div>
  </HuhProvider>
</template>
