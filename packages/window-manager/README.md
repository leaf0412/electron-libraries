# @electron-libraries/window-manager

一个用于 Electron 应用的窗口管理库，提供了简单而强大的窗口管理功能。

## 特性

- 窗口创建和管理
- 窗口状态管理（最大化、最小化、还原等）
- 窗口事件监听
- 窗口组管理
- 安全的渲染进程 API
- TypeScript 支持
- 完整的类型定义

## 安装

```bash
npm install @electron-libraries/window-manager
# 或者
yarn add @electron-libraries/window-manager
```

## 使用方法

### 主进程

```typescript
import { app } from 'electron';
import WindowManager from '@electron-libraries/window-manager';

let windowManager: WindowManager;

// 启动应用
app.whenReady().then(() => {
  // 创建窗口管理器实例
  windowManager = new WindowManager({
    rendererDirectoryName: 'dist', // 渲染进程目录名
    enableDevTools: false, // 是否启用开发者工具
    autoCenter: true, // 是否自动居中窗口
    defaultWindowOptions: { // 默认窗口选项
      width: 800,
      height: 600,
      // ... 其他 Electron BrowserWindow 选项
    }
  });
  // 创建主窗口
  windowManager.createWindow({
    isMainWin: true,
    route: '/',
    width: 800,
    height: 600
  });

  // 监听窗口事件
  windowManager.on('window-created', (window) => {
    console.log('Window created:', window.id);
  });

  windowManager.on('window-closed', (windowId) => {
    console.log('Window closed:', windowId);
  });

  // 启动 IPC 监听
  windowManager.listen();
});

// 清理
app.on('window-all-closed', () => {
  windowManager.unListen();
  app.quit();
});
```

### 渲染进程

```typescript
// 类型定义
declare global {
  interface Window {
    windowManager: {
      createWindow: (options?: any) => Promise<number>;
      closeWindow: (winId?: number) => Promise<void>;
      hideWindow: (winId?: number) => Promise<void>;
      showWindow: (winId?: number) => Promise<void>;
      minimizeWindow: (winId?: number) => Promise<void>;
      maximizeWindow: (winId?: number) => Promise<void>;
      toggleMaximizeWindow: (winId?: number) => Promise<void>;
      restoreWindow: (winId?: number) => Promise<void>;
      reloadWindow: (winId?: number) => Promise<void>;
      focusWindow: (winId: number) => Promise<void>;
      getWindowId: () => Promise<number>;
      getWindowBounds: () => Promise<{ x: number; y: number; width: number; height: number }>;
      getDisplayInfo: () => Promise<Electron.Display>;
    };
  }
}

// 使用示例
async function example() {
  // 创建新窗口
  const winId = await window.windowManager.createWindow({
    route: '/new-window',
    width: 400,
    height: 300
  });

  // 获取当前窗口 ID
  const currentWinId = await window.windowManager.getWindowId();

  // 获取窗口位置和大小
  const bounds = await window.windowManager.getWindowBounds();

  // 最大化窗口
  await window.windowManager.maximizeWindow(currentWinId);

  // 获取显示器信息
  const display = await window.windowManager.getDisplayInfo();
}
```

## API 文档

### WindowManager 类

#### 构造函数选项

```typescript
interface WindowManagerOptions {
  rendererDirectoryName?: string; // 渲染进程目录名
  enableDevTools?: boolean; // 是否启用开发者工具
  autoCenter?: boolean; // 是否自动居中窗口
  defaultWindowOptions?: WindowOptions; // 默认窗口选项
}
```

#### 窗口选项

```typescript
interface WindowOptions extends BrowserWindowConstructorOptions {
  id?: number;
  isMainWin?: boolean;
  route?: string;
  isMultiWindow?: boolean;
  parentId?: number;
  maximize?: boolean;
}
```

#### 事件

- `window-created`: 窗口创建时触发
- `window-closed`: 窗口关闭时触发
- `window-hidden`: 窗口隐藏时触发
- `window-shown`: 窗口显示时触发
- `window-focused`: 窗口获得焦点时触发
- `window-maximized`: 窗口最大化时触发
- `window-minimized`: 窗口最小化时触发
- `window-restored`: 窗口还原时触发
- `window-moved`: 窗口移动时触发
- `window-resized`: 窗口调整大小时触发

### 渲染进程 API

#### 方法

- `createWindow(options?: WindowOptions): Promise<number>`
- `closeWindow(winId?: number): Promise<void>`
- `hideWindow(winId?: number): Promise<void>`
- `showWindow(winId?: number): Promise<void>`
- `minimizeWindow(winId?: number): Promise<void>`
- `maximizeWindow(winId?: number): Promise<void>`
- `toggleMaximizeWindow(winId?: number): Promise<void>`
- `restoreWindow(winId?: number): Promise<void>`
- `reloadWindow(winId?: number): Promise<void>`
- `focusWindow(winId: number): Promise<void>`
- `getWindowId(): Promise<number>`
- `getWindowBounds(): Promise<{ x: number; y: number; width: number; height: number }>`
- `getDisplayInfo(): Promise<Electron.Display>`

## 注意事项

1. 确保在主进程中正确初始化 WindowManager 并调用 `listen()` 方法
2. 在应用退出时调用 `unListen()` 方法清理事件监听
3. 使用 TypeScript 时，需要添加全局类型定义
4. 窗口选项中的 `webPreferences` 配置会被默认的安全设置覆盖，如需修改请在 `defaultWindowOptions` 中配置

## 许可证

MIT 