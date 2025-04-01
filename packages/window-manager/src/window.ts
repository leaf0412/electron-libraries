import { BrowserWindow, ipcMain, screen } from 'electron';
import { EventEmitter } from 'events';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import createProtocol, { defaultScheme } from './protocol';
import {
  WindowOptions,
  WindowState,
  WindowGroup,
  WindowManagerOptions,
} from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));

const Events = {
  WINDOW_NEW: 'WINDOW_NEW',
  WINDOW_CLOSED: 'WINDOW_CLOSED',
  WINDOW_HIDE: 'WINDOW_HIDE',
  WINDOW_SHOW: 'WINDOW_SHOW',
  WINDOW_FOCUS: 'WINDOW_FOCUS',
  WINDOW_ID: 'WINDOW_ID',
  WINDOW_MINI: 'WINDOW_MINI',
  WINDOW_MAX: 'WINDOW_MAX',
  WINDOW_MAX_MIN_SIZE: 'WINDOW_MAX_MIN_SIZE',
  WINDOW_RESTORE: 'WINDOW_RESTORE',
  WINDOW_RELOAD: 'WINDOW_RELOAD',
  WINDOW_GET_BOUNDS: 'WINDOW_GET_BOUNDS',
  SCREEN_GET_DISPLAY_INFO: 'SCREEN_GET_DISPLAY_INFO',
} as const;

class WindowManager extends EventEmitter {
  private rendererDirectoryName: string;
  private windowOptionsConfig: WindowOptions;
  private main: BrowserWindow | undefined;
  private group: Map<number, WindowGroup> = new Map();
  private windowStates: Map<number, WindowState> = new Map();
  private options: WindowManagerOptions;

  constructor(options: WindowManagerOptions = {}) {
    super();
    this.options = {
      rendererDirectoryName: 'dist',
      enableDevTools: false,
      autoCenter: true,
      ...options,
    };
    this.rendererDirectoryName = this.options.rendererDirectoryName!;
    this.windowOptionsConfig = this.windowOptions();
    createProtocol({
      directory: {
        isSameDirectory: true,
        name: this.rendererDirectoryName,
      },
    });
  }

  private windowOptions(width = 500, height = 800): WindowOptions {
    return {
      width,
      height,
      resizable: true,
      minimizable: true,
      maximizable: true,
      show: false,
      icon: join(__dirname, 'icon.png'),
      webPreferences: {
        preload: join(__dirname, 'preload.mjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
      ...this.options.defaultWindowOptions,
    };
  }

  public getWindow(id: number): BrowserWindow | undefined {
    const window = BrowserWindow.fromId(id);
    return window || undefined;
  }

  public getAllWindows(): BrowserWindow[] {
    return BrowserWindow.getAllWindows();
  }

  public getWindowState(id: number): WindowState | undefined {
    return this.windowStates.get(id);
  }

  public createWindow(options?: WindowOptions): BrowserWindow {
    try {
      const opt = this.windowOptionsConfig;
      const args = Object.assign({}, opt, options);

      // 检查是否已存在相同路由的窗口
      const existingWindow = this.findExistingWindow(args.route, args.isMultiWindow);
      if (existingWindow) {
        existingWindow.focus();
        return existingWindow;
      }

      if (args.parentId) {
        const parentWindow = this.getWindow(args.parentId);
        if (!parentWindow) {
          throw new Error(`Parent window with id ${args.parentId} not found`);
        }
        args.parent = parentWindow;
      }

      const win = new BrowserWindow(args);

      // 初始化窗口状态
      const initialState: WindowState = {
        id: win.id,
        isMaximized: false,
        isMinimized: false,
        isVisible: false,
        isFocused: false,
        bounds: win.getBounds(),
      };
      this.windowStates.set(win.id, initialState);

      // 设置窗口组信息
      this.group.set(win.id, {
        route: args.route ?? '',
        isMultiWindow: args.isMultiWindow ?? false,
        window: win,
      });

      if (args.maximize && args.resizable) {
        win.maximize();
      }

      if (args.isMainWin) {
        if (this.main) {
          this.group.delete(this.main.id);
          this.main.close();
        }
        this.main = win;
      }

      // 加载窗口内容
      this.loadWindowContent(win, args.route);

      // 设置窗口事件监听
      this.setupWindowEvents(win);

      this.emit('window-created', win);
      return win;
    } catch (error) {
      console.error('Failed to create window:', error);
      throw error;
    }
  }

  private loadWindowContent(win: BrowserWindow, route?: string): void {
    try {
      const winURL = this.buildWindowUrl(route);
      win.loadURL(winURL);
      
      if (this.options.enableDevTools && this.options.devServerUrl) {
        win.webContents.openDevTools();
      }
    } catch (error) {
      console.error(`Failed to load window ${win.id} content:`, error);
      this.emit('window-load-error', win.id, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private buildWindowUrl(route?: string): string {
    if (this.options.devServerUrl) {
      return this.buildDevServerUrl(route);
    }
    return this.buildProtocolUrl(route);
  }

  private buildDevServerUrl(route?: string): string {
    const baseUrl = this.options.devServerUrl?.replace(/\/$/, '');
    if (!baseUrl) {
      throw new Error('Dev server URL is not configured');
    }
    const routePath = route?.replace(/^\//, '') || '';
    return `${baseUrl}/${routePath}`;
  }

  private buildProtocolUrl(route?: string): string {
    const basePath = `./${this.rendererDirectoryName}`.replace(/\/$/, '');
    const routePath = route?.replace(/^\//, '') || '';
    return `${defaultScheme}://${basePath}${routePath ? `/${routePath}` : ''}`;
  }

  private setupWindowEvents(win: BrowserWindow): void {
    const updateWindowState = (event: string, stateUpdate: Partial<WindowState>) => {
      const state = this.windowStates.get(win.id);
      if (state) {
        Object.assign(state, stateUpdate);
        this.emit(`window-${event}`, win.id);
      }
    };

    win.on('close', () => {
      win.setOpacity(0);
      this.emit('window-closed', win.id);
      this.windowStates.delete(win.id);
      this.group.delete(win.id);
    });

    win.on('maximize', () => {
      win.show();
      updateWindowState('maximized', { isMaximized: true });
    });

    win.on('unmaximize', () => {
      updateWindowState('restored', { isMaximized: false });
    });

    win.on('minimize', () => {
      updateWindowState('minimized', { isMinimized: true });
    });

    win.on('restore', () => {
      updateWindowState('restored', { isMinimized: false });
    });

    win.on('show', () => {
      updateWindowState('shown', { isVisible: true });
    });

    win.on('hide', () => {
      updateWindowState('hidden', { isVisible: false });
    });

    win.on('focus', () => {
      updateWindowState('focused', { isFocused: true });
    });

    win.on('blur', () => {
      updateWindowState('blurred', { isFocused: false });
    });

    win.on('resize', () => {
      const state = this.windowStates.get(win.id);
      if (state) {
        state.bounds = win.getBounds();
      }
    });

    win.on('move', () => {
      const state = this.windowStates.get(win.id);
      if (state) {
        state.bounds = win.getBounds();
      }
    });
  }

  private findExistingWindow(route?: string, isMultiWindow?: boolean): BrowserWindow | undefined {
    for (const [key, value] of this.group) {
      const currentWindow = this.getWindow(Number(key));
      if (currentWindow && value.route === route && !value.isMultiWindow && !isMultiWindow) {
        return currentWindow;
      }
    }
    return undefined;
  }

  public closeAllWindows(): void {
    for (const [id] of this.group) {
      const window = this.getWindow(id);
      if (window) {
        window.close();
      }
    }
    this.group.clear();
    this.windowStates.clear();
  }

  public listen(): void {
    ipcMain.handle(Events.WINDOW_CLOSED, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.close();
        this.group.delete(winId);
      } else {
        this.closeAllWindows();
      }
    });

    ipcMain.handle(Events.WINDOW_HIDE, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.hide();
      } else {
        for (const [id] of this.group) {
          this.getWindow(id)?.hide();
        }
      }
    });

    ipcMain.handle(Events.WINDOW_SHOW, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.show();
      } else {
        for (const [id] of this.group) {
          this.getWindow(id)?.show();
        }
      }
    });

    ipcMain.handle(Events.WINDOW_MINI, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.minimize();
      } else {
        for (const [id] of this.group) {
          this.getWindow(id)?.minimize();
        }
      }
    });

    ipcMain.handle(Events.WINDOW_MAX, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.maximize();
      } else {
        for (const [id] of this.group) {
          this.getWindow(id)?.maximize();
        }
      }
    });

    ipcMain.handle(Events.WINDOW_MAX_MIN_SIZE, (_event, winId) => {
      if (winId) {
        const window = this.getWindow(Number(winId));
        if (window?.isMaximized()) {
          window.unmaximize();
        } else {
          window?.maximize();
        }
      }
    });

    ipcMain.handle(Events.WINDOW_RESTORE, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.restore();
      } else {
        for (const [id] of this.group) {
          this.getWindow(id)?.restore();
        }
      }
    });

    ipcMain.handle(Events.WINDOW_RELOAD, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.reload();
      } else {
        for (const [id] of this.group) {
          this.getWindow(id)?.reload();
        }
      }
    });

    ipcMain.handle(Events.WINDOW_FOCUS, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.focus();
      }
    });

    ipcMain.handle(Events.WINDOW_ID, _event => {
      return BrowserWindow.fromWebContents(_event.sender)?.id;
    });

    ipcMain.handle(Events.WINDOW_NEW, (_event, args) => {
      const win = this.createWindow(args);
      return win.id;
    });

    ipcMain.handle(Events.WINDOW_GET_BOUNDS, _event => {
      return BrowserWindow.fromWebContents(_event.sender)?.getBounds();
    });

    ipcMain.handle(Events.SCREEN_GET_DISPLAY_INFO, () => {
      return screen.getPrimaryDisplay();
    });
  }

  public unListen(): void {
    for (const event of Object.values(Events)) {
      ipcMain.removeHandler(event);
    }
  }
}

export default WindowManager;
