import { contextBridge, ipcRenderer } from 'electron';
import { WindowOptions, WindowState } from './types';

/**
 * 窗口管理器事件常量
 */
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

/**
 * 窗口管理器API接口
 */
export interface WindowManagerAPI {
  /**
   * 创建新窗口
   * @param options 窗口配置选项
   * @returns 返回窗口ID
   */
  createWindow: (options?: WindowOptions) => Promise<number>;

  /**
   * 关闭指定窗口
   * @param winId 窗口ID，如果不指定则关闭当前窗口
   */
  closeWindow: (winId?: number) => Promise<void>;

  /**
   * 隐藏指定窗口
   * @param winId 窗口ID，如果不指定则隐藏当前窗口
   */
  hideWindow: (winId?: number) => Promise<void>;

  /**
   * 显示指定窗口
   * @param winId 窗口ID，如果不指定则显示当前窗口
   */
  showWindow: (winId?: number) => Promise<void>;

  /**
   * 最小化指定窗口
   * @param winId 窗口ID，如果不指定则最小化当前窗口
   */
  minimizeWindow: (winId?: number) => Promise<void>;

  /**
   * 最大化指定窗口
   * @param winId 窗口ID，如果不指定则最大化当前窗口
   */
  maximizeWindow: (winId?: number) => Promise<void>;

  /**
   * 切换窗口的最大化/最小化状态
   * @param winId 窗口ID，如果不指定则切换当前窗口
   */
  toggleMaximizeWindow: (winId?: number) => Promise<void>;

  /**
   * 还原窗口大小
   * @param winId 窗口ID，如果不指定则还原当前窗口
   */
  restoreWindow: (winId?: number) => Promise<void>;

  /**
   * 重新加载窗口
   * @param winId 窗口ID，如果不指定则重新加载当前窗口
   */
  reloadWindow: (winId?: number) => Promise<void>;

  /**
   * 聚焦指定窗口
   * @param winId 窗口ID
   */
  focusWindow: (winId: number) => Promise<void>;

  /**
   * 获取当前窗口ID
   * @returns 返回当前窗口ID
   */
  getWindowId: () => Promise<number>;

  /**
   * 获取窗口位置和大小信息
   * @returns 返回窗口的位置和大小信息
   */
  getWindowBounds: () => Promise<WindowState['bounds']>;

  /**
   * 获取显示器信息
   * @returns 返回当前显示器信息
   */
  getDisplayInfo: () => Promise<Electron.Display>;
}

/**
 * 窗口管理器API实现
 */
const api: WindowManagerAPI = {
  createWindow: (options) => ipcRenderer.invoke(Events.WINDOW_NEW, options),
  closeWindow: (winId) => ipcRenderer.invoke(Events.WINDOW_CLOSED, winId),
  hideWindow: (winId) => ipcRenderer.invoke(Events.WINDOW_HIDE, winId),
  showWindow: (winId) => ipcRenderer.invoke(Events.WINDOW_SHOW, winId),
  minimizeWindow: (winId) => ipcRenderer.invoke(Events.WINDOW_MINI, winId),
  maximizeWindow: (winId) => ipcRenderer.invoke(Events.WINDOW_MAX, winId),
  toggleMaximizeWindow: (winId) => ipcRenderer.invoke(Events.WINDOW_MAX_MIN_SIZE, winId),
  restoreWindow: (winId) => ipcRenderer.invoke(Events.WINDOW_RESTORE, winId),
  reloadWindow: (winId) => ipcRenderer.invoke(Events.WINDOW_RELOAD, winId),
  focusWindow: (winId) => ipcRenderer.invoke(Events.WINDOW_FOCUS, winId),
  getWindowId: () => ipcRenderer.invoke(Events.WINDOW_ID),
  getWindowBounds: () => ipcRenderer.invoke(Events.WINDOW_GET_BOUNDS),
  getDisplayInfo: () => ipcRenderer.invoke(Events.SCREEN_GET_DISPLAY_INFO),
};

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('windowManager', api);

// 为TypeScript提供类型声明
declare global {
  interface Window {
    windowManager: WindowManagerAPI;
  }
} 