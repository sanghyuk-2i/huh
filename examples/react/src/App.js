import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { HuhProvider, useHuh } from '@huh/react';
import errorConfig from './huh.json';
import { renderers } from './renderers';
const config = errorConfig;
function Buttons() {
  const { huh } = useHuh();
  return _jsxs('div', {
    className: 'buttons',
    children: [
      _jsx('button', { onClick: () => huh('ERR_NETWORK'), children: 'Toast (ERR_NETWORK)' }),
      _jsx('button', {
        onClick: () => huh('ERR_AUTH', { userName: '홍길동' }),
        children: 'Modal (ERR_AUTH)',
      }),
      _jsx('button', { onClick: () => huh('ERR_NOT_FOUND'), children: 'Page (ERR_NOT_FOUND)' }),
    ],
  });
}
export default function App() {
  return _jsx(HuhProvider, {
    source: config,
    renderers: renderers,
    children: _jsxs('div', {
      id: 'app',
      children: [
        _jsx('h1', { children: 'huh \u2014 React Example' }),
        _jsx('p', {
          children:
            '\uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC5EC \uC5D0\uB7EC UI\uB97C \uD655\uC778\uD558\uC138\uC694.',
        }),
        _jsx(Buttons, {}),
      ],
    }),
  });
}
