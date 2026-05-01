export type IconName =
  | 'heart'
  | 'heart-filled'
  | 'check'
  | 'plus'
  | 'close'
  | 'search'
  | 'chevron-left'
  | 'trash'
  | 'play'
  | 'pause'
  | 'music-note'
  | 'google';

export const ICON_REGISTRY: Record<IconName, string> = {
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 22 22" fill="none"><path d="M11 19S3 13.5 3 8a5 5 0 018-4A5 5 0 0119 8c0 5.5-8 11-8 11z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  'heart-filled': `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 22 22" fill="currentColor"><path d="M11 19S3 13.5 3 8a5 5 0 018-4A5 5 0 0119 8c0 5.5-8 11-8 11z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 22 22" fill="none"><circle cx="9.5" cy="9.5" r="6.25" stroke="currentColor" stroke-width="1.5"/><path d="M14 14L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  'chevron-left': `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none"><path d="M5 3h6M3 5h10M5 5v7a1 1 0 001 1h4a1 1 0 001-1V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M5 3l14 9-14 9V3z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>`,
  pause: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="5" height="18" rx="1.5"/><rect x="14" y="3" width="5" height="18" rx="1.5"/></svg>`,
  'music-note': `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor"><polygon points="13,23 11,23 11,13.7 3,18.4 2,16.6 10,12 2,7.4 3,5.6 11,10.3 11,1 13,1 13,10.3 21,5.6 22,7.4 14,12 22,16.6 21,18.4 13,13.7"/></svg>`,
  google: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 18" fill="var(--color-ink-100)"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"/></svg>`,
};
