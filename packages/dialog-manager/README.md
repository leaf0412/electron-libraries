# @sky-hi/dialog-manager

一个用于 Electron 应用的对话框管理库，提供了简单而强大的对话框操作功能。

## 特性

- 文件打开对话框
- 文件保存对话框
- 消息对话框（支持多种类型）
- 完整的 TypeScript 支持
- 类型安全
- 跨平台支持（Windows、macOS、Linux）
- 预加载脚本集成
- 错误处理机制

## 安装

```bash
npm install @sky-hi/dialog-manager
# 或
yarn add @sky-hi/dialog-manager
# 或
pnpm add @sky-hi/dialog-manager
```

## 使用方法

### 主进程

```typescript
import DialogManager from '@sky-hi/dialog-manager';

// 显示打开文件对话框
const result = await DialogManager.showOpenDialog({
  properties: ['openFile', 'multiSelections']
});

// 显示保存文件对话框
const saveResult = await DialogManager.showSaveDialog({
  title: '保存文件',
  defaultPath: 'untitled.txt'
});

// 显示消息对话框
await DialogManager.showMessageBox({
  title: '提示',
  message: '操作成功',
  type: 'info'
});

// 显示错误对话框
await DialogManager.showErrorBox({
  title: '错误',
  message: '操作失败'
});

// 显示警告对话框
await DialogManager.showWarningBox({
  title: '警告',
  message: '请注意'
});

// 显示询问对话框
await DialogManager.showQuestionBox({
  title: '确认',
  message: '是否继续？'
});
```

### 渲染进程

在渲染进程中，通过预加载脚本暴露的 `dialogManager` 对象来使用对话框功能：

```typescript
// 显示打开文件对话框
const result = await window.dialogManager.openDialog({
  properties: ['openFile', 'multiSelections']
});

// 显示保存文件对话框
const saveResult = await window.dialogManager.saveDialog({
  title: '保存文件',
  defaultPath: 'untitled.txt'
});

// 显示消息对话框
await window.dialogManager.showMessageDialog({
  title: '提示',
  message: '操作成功',
  type: 'info'
});

// 显示错误对话框
await window.dialogManager.showErrorDialog({
  title: '错误',
  message: '操作失败'
});

// 显示警告对话框
await window.dialogManager.showWarningDialog({
  title: '警告',
  message: '请注意'
});

// 显示询问对话框
await window.dialogManager.showQuestionDialog({
  title: '确认',
  message: '是否继续？'
});
```

### 渲染进程类型定义

```typescript
interface DialogOperations {
  openDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>;
  saveDialog: (options: SaveDialogOptions) => Promise<SaveDialogReturnValue>;
  showMessageDialog: (options: DialogOptions) => Promise<MessageBoxReturnValue>;
  showErrorDialog: (options: Omit<DialogOptions, 'type'>) => Promise<MessageBoxReturnValue>;
  showInfoDialog: (options: Omit<DialogOptions, 'type'>) => Promise<MessageBoxReturnValue>;
  showWarningDialog: (options: Omit<DialogOptions, 'type'>) => Promise<MessageBoxReturnValue>;
  showQuestionDialog: (options: Omit<DialogOptions, 'type'>) => Promise<MessageBoxReturnValue>;
}
```

## API 文档

### DialogManager 类

#### 方法

- `showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>`
  - 显示打开文件对话框

- `showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue>`
  - 显示保存文件对话框

- `showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue>`
  - 显示消息对话框

- `showErrorBox(options: Omit<MessageBoxOptions, 'type'>): Promise<MessageBoxReturnValue>`
  - 显示错误对话框

- `showInfoBox(options: Omit<MessageBoxOptions, 'type'>): Promise<MessageBoxReturnValue>`
  - 显示信息对话框

- `showWarningBox(options: Omit<MessageBoxOptions, 'type'>): Promise<MessageBoxReturnValue>`
  - 显示警告对话框

- `showQuestionBox(options: Omit<MessageBoxOptions, 'type'>): Promise<MessageBoxReturnValue>`
  - 显示询问对话框

## 注意事项

1. 所有对话框操作都是异步的，需要使用 `async/await` 或 Promise 方式调用
2. 所有方法都包含完整的错误处理
3. 支持跨平台对话框样式
4. 渲染进程中的操作通过 IPC 通信转发到主进程执行

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