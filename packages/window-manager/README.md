# @sky-hi/window-manager

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
npm install @sky-hi/window-manager
# 或
yarn add @sky-hi/window-manager
# 或
pnpm add @sky-hi/window-manager
```

## 使用方法

### 主进程

```typescript
import { app } from 'electron';
import WindowManager from '@sky-hi/window-manager';

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

#### 渲染进程详细使用说明

1. **窗口创建**
```typescript
// 创建独立窗口
const winId = await window.windowManager.createWindow({
  route: '/new-window',
  width: 800,
  height: 600,
  title: '新窗口',
  webPreferences: {
    nodeIntegration: true
  }
});

// 创建模态窗口
const modalWinId = await window.windowManager.createWindow({
  route: '/modal',
  width: 400,
  height: 300,
  parentId: winId, // 指定父窗口
  modal: true
});
```

2. **窗口控制**
```typescript
// 关闭当前窗口
await window.windowManager.closeWindow();

// 关闭指定窗口
await window.windowManager.closeWindow(winId);

// 最小化窗口
await window.windowManager.minimizeWindow();

// 最大化窗口
await window.windowManager.maximizeWindow();

// 切换最大化状态
await window.windowManager.toggleMaximizeWindow();

// 还原窗口
await window.windowManager.restoreWindow();
```

3. **窗口状态管理**
```typescript
// 隐藏窗口
await window.windowManager.hideWindow();

// 显示窗口
await window.windowManager.showWindow();

// 聚焦窗口
await window.windowManager.focusWindow(winId);

// 重新加载窗口
await window.windowManager.reloadWindow();
```

4. **获取窗口信息**
```typescript
// 获取当前窗口的完整信息
const windowInfo = await window.windowManager.getWindowInfo({
  isBounds: true,      // 获取窗口位置和大小
  isMaximized: true,   // 获取最大化状态
  isMinimized: true,   // 获取最小化状态
  isFullScreen: true,  // 获取全屏状态
  isVisible: true,     // 获取可见状态
  isDestroyed: true,   // 获取销毁状态
  isFocused: true,     // 获取焦点状态
  isAlwaysOnTop: true  // 获取置顶状态
});

// 获取显示器信息
const displays = await window.windowManager.getDisplayInfo();
console.log('可用显示器:', displays);
```

5. **实际应用场景**
```typescript
// 创建设置窗口
async function openSettings() {
  const settingsWinId = await window.windowManager.createWindow({
    route: '/settings',
    width: 600,
    height: 400,
    title: '设置',
    resizable: false,
    minimizable: false
  });
}

// 创建预览窗口
async function openPreview() {
  const previewWinId = await window.windowManager.createWindow({
    route: '/preview',
    width: 1024,
    height: 768,
    title: '预览',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
}

// 窗口状态监听
async function monitorWindowState() {
  const windowInfo = await window.windowManager.getWindowInfo({
    isMaximized: true,
    isFocused: true
  });
  
  if (windowInfo.isMaximized) {
    console.log('窗口已最大化');
  }
  
  if (windowInfo.isFocused) {
    console.log('窗口已获得焦点');
  }
}
```

#### 注意事项

1. 所有窗口操作方法都是异步的，需要使用 `async/await` 或 Promise 处理
2. 窗口 ID 是唯一的，建议保存需要重复操作的窗口 ID
3. 创建窗口时可以指定 `parentId` 来创建父子窗口关系
4. 使用 `getWindowInfo` 时，只请求需要的状态信息以提高性能
5. 在开发环境中，确保 `devServerUrl` 配置正确
6. 窗口操作失败时会抛出异常，建议使用 try-catch 处理

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
- Node.js >= 20

## 许可证

MIT © leaf 