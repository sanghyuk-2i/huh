import { describe, it, expect } from 'vitest';
import { resolveError } from '../resolver';
import type { ErrorConfig } from '../schema';

const testConfig: ErrorConfig = {
  ERR_001: {
    type: 'TOAST',
    message: 'Hello, {{userName}}!',
  },
  ERR_002: {
    type: 'MODAL',
    message: '{{userName}}님의 세션이 만료되었습니다',
    title: '{{userName}}님',
    action: {
      label: '{{actionText}}',
      type: 'REDIRECT',
      target: '/user/{{userId}}',
    },
  },
  ERR_003: {
    type: 'PAGE',
    message: 'Plain message',
  },
  ERR_CUSTOM: {
    type: 'BANNER',
    message: 'Custom type: {{detail}}',
  },
  ERR_SEVERITY: {
    type: 'TOAST',
    message: 'Critical error',
    severity: 'CRITICAL',
  },
  ERR_NO_SEVERITY: {
    type: 'TOAST',
    message: 'No severity',
  },
};

describe('resolveError', () => {
  it('resolves a simple error with variable substitution', () => {
    const resolved = resolveError(testConfig, 'ERR_001', { userName: '이재민' });
    expect(resolved.trackId).toBe('ERR_001');
    expect(resolved.type).toBe('TOAST');
    expect(resolved.message).toBe('Hello, 이재민!');
  });

  it('resolves all template fields including action', () => {
    const resolved = resolveError(testConfig, 'ERR_002', {
      userName: '김철수',
      actionText: '다시 로그인',
      userId: '123',
    });
    expect(resolved.message).toBe('김철수님의 세션이 만료되었습니다');
    expect(resolved.title).toBe('김철수님');
    expect(resolved.action?.label).toBe('다시 로그인');
    expect(resolved.action?.target).toBe('/user/123');
  });

  it('works without variables', () => {
    const resolved = resolveError(testConfig, 'ERR_003');
    expect(resolved.message).toBe('Plain message');
    expect(resolved.trackId).toBe('ERR_003');
  });

  it('throws for unknown trackId', () => {
    expect(() => resolveError(testConfig, 'UNKNOWN')).toThrow('Unknown trackId');
  });

  it('leaves unmatched placeholders intact', () => {
    const resolved = resolveError(testConfig, 'ERR_001', {});
    expect(resolved.message).toBe('Hello, {{userName}}!');
  });

  it('resolves custom type entries', () => {
    const resolved = resolveError(testConfig, 'ERR_CUSTOM', { detail: 'server down' });
    expect(resolved.type).toBe('BANNER');
    expect(resolved.message).toBe('Custom type: server down');
  });

  it('preserves severity through resolve', () => {
    const resolved = resolveError(testConfig, 'ERR_SEVERITY');
    expect(resolved.severity).toBe('CRITICAL');
  });

  it('leaves severity undefined when not set', () => {
    const resolved = resolveError(testConfig, 'ERR_NO_SEVERITY');
    expect(resolved.severity).toBeUndefined();
  });
});
