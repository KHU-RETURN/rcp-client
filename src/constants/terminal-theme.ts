import type { ITheme } from '@xterm/xterm';

export const TERMINAL_THEME: ITheme = {
  background: '#0d1628',
  foreground: '#d6e2ff',
  cursor: '#d6e2ff',
  black: '#101828',
  blue: '#2554ff',
  green: '#0db07d',
  red: '#ff6b5c',
  yellow: '#e6b450',
  white: '#eef3ff',
  brightBlack: '#667085',
  brightBlue: '#7da2ff',
  brightGreen: '#5ed6af',
  brightWhite: '#ffffff',
};

export const TERMINAL_OPTIONS = {
  cursorBlink: true,
  convertEol: true,
  fontSize: 13,
  letterSpacing: 0.2,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  theme: TERMINAL_THEME,
} as const;
