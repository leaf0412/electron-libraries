# @electron-libraries/window-manager

一个用于 Electron 应用的窗口管理库，提供了简单而强大的窗口管理功能。

## 特性

- 窗口创建和管理
- 窗口组管理
- 支持开发环境和生产环境
- 自定义协议支持
- 窗口状态管理（最大化、最小化、还原等）
- 窗口事件监听
- 安全的渲染进程 API
- TypeScript 支持
- 完整的类型定义

## 安装

```bash
npm install @electron-libraries/window-manager
# 或
yarn add @electron-libraries/window-manager
# 或
pnpm add @electron-libraries/window-manager
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
    devServerUrl: 'http://localhost:5173', // 开发服务器 URL（可选）
    webPreferences: {
      // 自定义 webPreferences
    }
  });

  // 创建主窗口
  const mainWindow = windowManager.createWindow({
    isMainWin: true,
    route: '/',
    width: 800,
    height: 600,
    maximize: true // 是否最大化
  });

  // 创建子窗口
  const childWindow = windowManager.createWindow({
    parentId: mainWindow.id,
    route: '/child',
    width: 400,
    height: 300
  });
});

// 清理
app.on('window-all-closed', () => {
  windowManager.closeAllWindow();
});
```

### 渲染进程

```typescript
// 类型定义已包含在库中
declare global {
  interface Window {
    windowManager: {
      createWindow: (options?: WindowOptions) => Promise<number>;
      closeWindow: (winId?: number) => Promise<void>;
      hideWindow: (winId?: number) => Promise<void>;
      showWindow: (winId?: number) => Promise<void>;
      minimizeWindow: (winId?: number) => Promise<void>;
      maximizeWindow: (winId?: number) => Promise<void>;
      toggleMaximizeWindow: (winId?: number) => Promise<void>;
      restoreWindow: (winId?: number) => Promise<void>;
      reloadWindow: (winId?: number) => Promise<void>;
      focusWindow: (winId: number) => Promise<void>;
      getWindowInfo: (params?: WindowInfoParams) => Promise<WindowInfo>;
      getDisplayInfo: () => Promise<Electron.Display[]>;
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

  // 获取窗口信息
  const windowInfo = await window.windowManager.getWindowInfo({
    isBounds: true,
    isMaximized: true,
    isFocused: true
  });

  // 获取显示器信息
  const displays = await window.windowManager.getDisplayInfo();
}
```

## API 文档

### WindowManager 类

#### 构造函数选项

```typescript
interface WindowManagerOptions {
  rendererDirectoryName?: string; // 渲染进程目录名
  devServerUrl?: string; // 开发服务器 URL
  icon?: string; // 窗口图标
  webPreferences?: Electron.WebPreferences; // 自定义 webPreferences
}
```

#### 窗口选项

```typescript
interface WindowOptions extends Electron.BrowserWindowConstructorOptions {
  id?: number;
  route?: string;
  isMultiWindow?: boolean;
  isMainWin?: boolean;
  maximize?: boolean;
  parentId?: number;
  isDevTools?: boolean;
}
```

#### 窗口信息参数

```typescript
interface WindowInfoParams {
  isBounds?: boolean;
  isMaximized?: boolean;
  isMinimized?: boolean;
  isFullScreen?: boolean;
  isVisible?: boolean;
  isDestroyed?: boolean;
  isFocused?: boolean;
  isAlwaysOnTop?: boolean;
}
```

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
- `getWindowInfo(params?: WindowInfoParams): Promise<WindowInfo>`
- `getDisplayInfo(): Promise<Electron.Display[]>`

## 注意事项

1. 确保在主进程中正确初始化 WindowManager
2. 使用 TypeScript 时，类型定义已包含在库中
3. 窗口选项中的 `webPreferences` 配置会被默认的安全设置覆盖，如需修改请在构造函数选项中配置
4. 支持开发环境和生产环境的不同配置
5. 使用自定义协议加载本地文件

## 开发

```bash
# 安装依赖
npm install

# 运行类型检查
npm run type-check

# 运行测试
npm test

# 构建
npm run build

# 代码检查
npm run lint
```

## 要求

- Electron >= 28.3.3
- Node.js >= 14

## 许可证

MIT © leaf 