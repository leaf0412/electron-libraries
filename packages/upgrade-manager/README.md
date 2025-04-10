# @electron-libraries/upgrade-manager

一个用于 Electron 应用程序的软件升级管理库。

## 功能特点

- 检查新版本更新
- 自动下载更新
- 下载进度显示
- 文件完整性验证
- 自动安装更新
- 支持多平台（Windows、macOS、Linux）

## 安装

```bash
npm install @electron-libraries/upgrade-manager
```

## 使用方法

### 主进程

```typescript
import { UpgradeManager } from '@electron-libraries/upgrade-manager';

// 创建升级管理器实例
const upgradeManager = new UpgradeManager({
  serverUrl: 'https://your-update-server.com',
  currentVersion: app.getVersion(),
  autoDownload: true,
  autoInstall: true
});

// 设置主窗口（用于显示更新进度）
upgradeManager.setMainWindow(mainWindow);

// 检查更新
try {
  const updateInfo = await upgradeManager.checkForUpdates();
  if (updateInfo) {
    console.log('发现新版本:', updateInfo.version);
    console.log('更新说明:', updateInfo.releaseNotes);
    
    // 下载更新
    const downloadPath = await upgradeManager.downloadUpdate();
    
    // 安装更新
    await upgradeManager.installUpdate();
  }
} catch (error) {
  console.error('更新失败:', error);
}
```

### 渲染进程

```typescript
// 监听更新进度
window.electron.on('upgrade-progress', (event, data) => {
  const { type, progress } = data;
  if (type === 'download') {
    console.log(`下载进度: ${progress.percent}%`);
  } else if (type === 'install') {
    console.log(`安装进度: ${progress.percent}%`);
  }
});
```

## API

### UpgradeManager

#### 构造函数

```typescript
constructor(options: UpdateOptions)
```

#### 方法

- `setMainWindow(window: BrowserWindow)`: 设置主窗口
- `checkForUpdates(): Promise<UpdateInfo | null>`: 检查更新
- `downloadUpdate(): Promise<string>`: 下载更新
- `installUpdate(): Promise<void>`: 安装更新

### 类型定义

```typescript
interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
  downloadUrl: string;
  sha256: string;
}

interface UpdateOptions {
  serverUrl: string;
  currentVersion: string;
  autoDownload?: boolean;
  autoInstall?: boolean;
}

interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
}

interface UpdateError {
  code: string;
  message: string;
  details?: unknown;
}
```

## 注意事项

1. 确保更新服务器返回的 JSON 数据格式符合 `UpdateInfo` 接口定义
2. 下载的更新文件必须与服务器提供的 SHA256 校验和匹配
3. 安装更新时需要根据不同的操作系统实现相应的安装逻辑
4. 建议在应用启动时检查更新，并在适当的时候提示用户

## 许可证

MIT 