import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

export interface WindowOptions extends BrowserWindowConstructorOptions {
  id?: number;
  isMainWin?: boolean;
  route?: string;
  isMultiWindow?: boolean;
  parentId?: number;
  maximize?: boolean;
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  center?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  movable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  focusable?: boolean;
  alwaysOnTop?: boolean;
  fullscreen?: boolean;
  skipTaskbar?: boolean;
  frame?: boolean;
  transparent?: boolean;
  backgroundColor?: string;
  hasShadow?: boolean;
  thickFrame?: boolean;
  webPreferences?: {
    nodeIntegration?: boolean;
    contextIsolation?: boolean;
    preload?: string;
    sandbox?: boolean;
    webSecurity?: boolean;
    allowRunningInsecureContent?: boolean;
    webviewTag?: boolean;
    plugins?: boolean;
    experimentalFeatures?: boolean;
    experimentalCanvasFeatures?: boolean;
    scrollBounce?: boolean;
    enableBlinkFeatures?: string;
    disableBlinkFeatures?: string;
    defaultFontFamily?: {
      standard?: string;
      serif?: string;
      sansSerif?: string;
      monospace?: string;
      cursive?: string;
      fantasy?: string;
    };
    defaultFontSize?: number;
    defaultMonospaceFontSize?: number;
    minimumFontSize?: number;
    defaultEncoding?: string;
    backgroundThrottling?: boolean;
    offscreen?: boolean;
    partition?: string;
  };
}

export interface WindowState {
  id: number;
  isMaximized: boolean;
  isMinimized: boolean;
  isVisible: boolean;
  isFocused: boolean;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WindowGroup {
  route: string;
  isMultiWindow: boolean;
  window?: BrowserWindow;
}

export interface WindowManagerOptions {
  rendererDirectoryName?: string;
  defaultWindowOptions?: WindowOptions;
  devServerUrl?: string;
  enableDevTools?: boolean;
  autoCenter?: boolean;
}

export type WindowEventType =
  | 'WINDOW_NEW'
  | 'WINDOW_CLOSED'
  | 'WINDOW_HIDE'
  | 'WINDOW_SHOW'
  | 'WINDOW_FOCUS'
  | 'WINDOW_ID'
  | 'WINDOW_MINI'
  | 'WINDOW_MAX'
  | 'WINDOW_MAX_MIN_SIZE'
  | 'WINDOW_RESTORE'
  | 'WINDOW_RELOAD'
  | 'WINDOW_GET_BOUNDS'
  | 'SCREEN_GET_DISPLAY_INFO';

export interface WindowManagerEvents {
  'window-created': (window: BrowserWindow) => void;
  'window-closed': (windowId: number) => void;
  'window-hidden': (windowId: number) => void;
  'window-shown': (windowId: number) => void;
  'window-focused': (windowId: number) => void;
  'window-maximized': (windowId: number) => void;
  'window-minimized': (windowId: number) => void;
  'window-restored': (windowId: number) => void;
  'window-moved': (windowId: number, bounds: WindowState['bounds']) => void;
  'window-resized': (windowId: number, bounds: WindowState['bounds']) => void;
}
