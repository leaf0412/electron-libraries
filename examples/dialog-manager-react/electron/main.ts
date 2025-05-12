import { app, BrowserWindow } from 'electron';
import {
  WindowManager,
  WindowIpcHandler,
  registerProtocol,
  unregisterProtocol,
} from '@sky-hi/window-manager';
import { DialogIpcHandler } from '@sky-hi/dialog-manager';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

let windowManager: WindowManager | null = null;
let windowIpcHandler: WindowIpcHandler | null = null;
let dialogIpcHandler: DialogIpcHandler | null = null;
let mainWindow: BrowserWindow;

export const __dirname = dirname(fileURLToPath(import.meta.url));

const initApp = async () => {
  await app.whenReady();
  // 创建窗口管理器实例
  windowManager = new WindowManager({
    rendererDirectoryName: 'dist',
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
    },
  });

  windowIpcHandler = new WindowIpcHandler(windowManager);
  windowIpcHandler.initIpcHandlers();
  dialogIpcHandler = new DialogIpcHandler();
  dialogIpcHandler.initIpcHandlers();

  // 创建主窗口
  mainWindow = windowManager.createWindow({
    isMainWin: true,
    width: 1024,
    height: 768,
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });
};

const destroyIpcHandlers = () => {
  windowIpcHandler?.destroyIpcHandlers();
  windowIpcHandler = null;
  dialogIpcHandler?.destroyIpcHandlers();
  dialogIpcHandler = null;
};

const destroyApp = () => {
  unregisterProtocol();
  destroyIpcHandlers();
  windowManager?.closeAllWindow();
  windowManager = null;
};

const gotTheLock = app.requestSingleInstanceLock();

if (gotTheLock) {
  // 启动应用
  registerProtocol();
  initApp().catch(console.error);

  // 清理
  app.on('window-all-closed', () => {
    destroyApp();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      initApp().catch(console.error);
    }
  });
} else {
  app.quit();
}
