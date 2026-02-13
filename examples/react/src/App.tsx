import { HuhProvider, useHuh } from '@huh/react';
import type { ErrorConfig } from '@huh/core';
import errorConfig from './huh.json';
import { renderers } from './renderers';

const config = errorConfig as ErrorConfig;

function Buttons() {
  const { huh } = useHuh();

  return (
    <div className="buttons">
      <button onClick={() => huh('ERR_NETWORK')}>Toast (ERR_NETWORK)</button>
      <button onClick={() => huh('ERR_AUTH', { userName: '홍길동' })}>Modal (ERR_AUTH)</button>
      <button onClick={() => huh('ERR_NOT_FOUND')}>Page (ERR_NOT_FOUND)</button>
    </div>
  );
}

export default function App() {
  return (
    <HuhProvider source={config} renderers={renderers}>
      <div id="app">
        <h1>huh — React Example</h1>
        <p>버튼을 클릭하여 에러 UI를 확인하세요.</p>
        <Buttons />
      </div>
    </HuhProvider>
  );
}
