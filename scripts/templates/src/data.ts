export const HEADERS = [
  'trackId',
  'type',
  'message',
  'title',
  'image',
  'severity',
  'actionLabel',
  'actionType',
  'actionTarget',
] as const;

export type Header = (typeof HEADERS)[number];

export interface SampleRow {
  trackId: string;
  type: 'TOAST' | 'MODAL' | 'PAGE';
  message: string;
  title: string;
  image: string;
  severity: string;
  actionLabel: string;
  actionType: string;
  actionTarget: string;
}

export const SAMPLE_KO: SampleRow[] = [
  {
    trackId: 'ERR_NETWORK',
    type: 'TOAST',
    message: '네트워크 연결을 확인해주세요',
    title: '',
    image: '',
    severity: 'WARNING',
    actionLabel: '다시 시도',
    actionType: 'RETRY',
    actionTarget: '',
  },
  {
    trackId: 'ERR_AUTH',
    type: 'MODAL',
    message: '인증이 만료되었습니다',
    title: '인증 만료',
    image: '',
    severity: 'ERROR',
    actionLabel: '로그인',
    actionType: 'REDIRECT',
    actionTarget: '/login',
  },
  {
    trackId: 'ERR_NOT_FOUND',
    type: 'PAGE',
    message: '페이지를 찾을 수 없습니다',
    title: '404',
    image: '',
    severity: 'INFO',
    actionLabel: '돌아가기',
    actionType: 'BACK',
    actionTarget: '',
  },
  {
    trackId: 'ERR_TIMEOUT',
    type: 'MODAL',
    message: '요청 시간이 초과되었습니다',
    title: '시간 초과',
    image: '',
    severity: 'ERROR',
    actionLabel: '다시 시도',
    actionType: 'RETRY',
    actionTarget: '',
  },
  {
    trackId: 'ERR_FORBIDDEN',
    type: 'PAGE',
    message: '{{userName}}님은 접근 권한이 없습니다',
    title: '접근 거부',
    image: '',
    severity: 'CRITICAL',
    actionLabel: '돌아가기',
    actionType: 'BACK',
    actionTarget: '',
  },
];

export const SAMPLE_EN: SampleRow[] = [
  {
    trackId: 'ERR_NETWORK',
    type: 'TOAST',
    message: 'Please check your network connection',
    title: '',
    image: '',
    severity: 'WARNING',
    actionLabel: 'Retry',
    actionType: 'RETRY',
    actionTarget: '',
  },
  {
    trackId: 'ERR_AUTH',
    type: 'MODAL',
    message: 'Your session has expired',
    title: 'Session Expired',
    image: '',
    severity: 'ERROR',
    actionLabel: 'Login',
    actionType: 'REDIRECT',
    actionTarget: '/login',
  },
  {
    trackId: 'ERR_NOT_FOUND',
    type: 'PAGE',
    message: 'The page you requested was not found',
    title: '404',
    image: '',
    severity: 'INFO',
    actionLabel: 'Go Back',
    actionType: 'BACK',
    actionTarget: '',
  },
  {
    trackId: 'ERR_TIMEOUT',
    type: 'MODAL',
    message: 'The request timed out',
    title: 'Timeout',
    image: '',
    severity: 'ERROR',
    actionLabel: 'Retry',
    actionType: 'RETRY',
    actionTarget: '',
  },
  {
    trackId: 'ERR_FORBIDDEN',
    type: 'PAGE',
    message: "{{userName}}, you don't have permission",
    title: 'Access Denied',
    image: '',
    severity: 'CRITICAL',
    actionLabel: 'Go Back',
    actionType: 'BACK',
    actionTarget: '',
  },
];

export function rowToArray(row: SampleRow): string[] {
  return HEADERS.map((h) => row[h]);
}

export function toRows(samples: SampleRow[]): string[][] {
  return [[...HEADERS], ...samples.map(rowToArray)];
}

export const TYPE_OPTIONS = ['TOAST', 'MODAL', 'PAGE'] as const;
export const ACTION_TYPE_OPTIONS = ['REDIRECT', 'RETRY', 'BACK', 'DISMISS'] as const;
export const SEVERITY_OPTIONS = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const;
