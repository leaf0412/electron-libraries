import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import WindowManager from '@electron-libraries/window-manager';
import { registerProtocol, unregisterProtocol } from '@electron-libraries/window-manager/protocol';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let windowManager: WindowManager;
let mainWindow: BrowserWindow;

const initApp = () => {
  // 创建窗口管理器实例
  windowManager = new WindowManager({
    rendererDirectoryName: 'dist',
    // devServerUrl: VITE_DEV_SERVER_URL,
    enableDevTools: true,
    autoCenter: true,
    defaultWindowOptions: {
      width: 800,
      height: 600,
      icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
      },
    },
  });

  // 创建主窗口
  mainWindow = windowManager.createWindow({
    isMainWin: true,
    route: '/',
    width: 800,
    height: 600,
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  // 启动 IPC 监听
  windowManager.listen();
};

const gotTheLock = app.requestSingleInstanceLock();

if (gotTheLock) {
  // 启动应用
  registerProtocol();
  app.whenReady().then(() => {
    initApp();
  });

  // 清理
  app.on('window-all-closed', () => {
    windowManager.unListen();
    unregisterProtocol();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windowManager.getAllWindows().length === 0) {
      initApp();
      // registerProtocol();
    }
  });
} else {
  app.quit();
}
