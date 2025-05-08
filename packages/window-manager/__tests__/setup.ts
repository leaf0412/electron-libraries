import { vi, beforeEach } from 'vitest';
import { BrowserWindow } from 'electron';

// 设置环境变量
process.env.NODE_ENV = 'development';

// 创建一个窗口存储
const windowStore = new Map<number, BrowserWindow>();

// 模拟 BrowserWindow 类
const mockBrowserWindow = vi.fn().mockImplementation(() => {
  const window = {
    id: Math.floor(Math.random() * 1000),
    loadURL: vi.fn(),
    on: vi.fn(),
    close: vi.fn(),
    destroy: vi.fn(),
    isDestroyed: vi.fn().mockReturnValue(false),
    focus: vi.fn(),
    setOpacity: vi.fn(),
    hide: vi.fn(),
    webContents: {
      on: vi.fn(),
      openDevTools: vi.fn(),
    },
  };
  windowStore.set(window.id, window as unknown as BrowserWindow);
  return window;
}) as unknown as typeof BrowserWindow;

// 添加静态方法
mockBrowserWindow.fromId = (id: number) => windowStore.get(id) || null;
mockBrowserWindow.getAllWindows = () => Array.from(windowStore.values());

// 模拟 Electron 的模块
const mockElectron = {
  BrowserWindow: mockBrowserWindow,
  ipcMain: {
    on: vi.fn(),
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  ipcRenderer: {
    on: vi.fn(),
    send: vi.fn(),
    invoke: vi.fn(),
    removeListener: vi.fn(),
  },
  app: {
    quit: vi.fn(),
    getName: vi.fn().mockReturnValue('electron-libraries'),
    getPath: vi.fn().mockReturnValue('/mock/app/path'),
    on: vi.fn(),
  },
  protocol: {
    handle: vi.fn(),
    registerSchemesAsPrivileged: vi.fn(),
  },
};

// Mock window object
(global as any).window = {
  electron: mockElectron,
};

// Mock process object
(global as any).process = {
  type: 'renderer',
  platform: 'darwin',
  env: {
    NODE_ENV: 'test'
  }
};

// 在每个测试之前清空窗口存储
beforeEach(() => {
  windowStore.clear();
});

// Mock electron module
vi.mock('electron', () => mockElectron); 