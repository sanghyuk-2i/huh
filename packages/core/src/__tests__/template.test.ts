import { describe, it, expect } from 'vitest';
import { renderTemplate } from '../template';

describe('renderTemplate', () => {
  it('replaces single variable', () => {
    expect(renderTemplate('Hello, {{userName}}!', { userName: '이재민' })).toBe('Hello, 이재민!');
  });

  it('replaces multiple variables', () => {
    const result = renderTemplate('{{greeting}}, {{userName}}님', {
      greeting: '안녕하세요',
      userName: '김철수',
    });
    expect(result).toBe('안녕하세요, 김철수님');
  });

  it('leaves unmatched placeholders intact', () => {
    expect(renderTemplate('Hello, {{unknown}}!', {})).toBe('Hello, {{unknown}}!');
  });

  it('handles empty variables object', () => {
    expect(renderTemplate('No vars here', {})).toBe('No vars here');
  });

  it('handles template with no placeholders', () => {
    expect(renderTemplate('Plain text', { a: 'b' })).toBe('Plain text');
  });
});
