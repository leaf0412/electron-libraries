import { contextBridge, ipcRenderer } from 'electron';
import { WindowOptions, WindowInfoParams, WindowOperations } from './types';
import { WindowEvents as Events } from './event';

/**
 * 窗口管理器API实现
 */
const api: WindowOperations = {
  createWindow: (options: WindowOptions) =>
    ipcRenderer.invoke(Events.WINDOW_NEW, options),
  closeWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_CLOSED, winId),
  hideWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_HIDE, winId),
  showWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_SHOW, winId),
  focusWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_FOCUS, winId),
  getWindowInfo: (params?: WindowInfoParams) =>
    ipcRenderer.invoke(Events.GET_WINDOW_INFO, params),
  minimizeWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_MINI, winId),
  maximizeWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_MAX, winId),
  toggleMaximizeWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_MAX_MIN_SIZE, winId),
  restoreWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_RESTORE, winId),
  reloadWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_RELOAD, winId),
  getDisplayInfo: () => ipcRenderer.invoke(Events.SCREEN_GET_DISPLAY_INFO),
};

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('windowManager', api);
