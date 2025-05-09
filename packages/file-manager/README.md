# @electron-libraries/file-manager

一个用于 Electron 应用的文件管理库，提供了简单而强大的文件操作功能。

## 特性

- 文件和文件夹的读写操作
- 文件和文件夹的创建、复制、移动、删除
- 文件信息获取
- 路径标准化处理
- 跨平台支持（Windows、macOS、Linux）
- TypeScript 支持
- 完整的类型定义
- 错误处理机制

## 安装

```bash
npm install @electron-libraries/file-manager
# 或
yarn add @electron-libraries/file-manager
# 或
pnpm add @electron-libraries/file-manager
```

## 使用方法

### 主进程

```typescript
import FileManager from '@electron-libraries/file-manager';

// 获取 FileManager 实例
const fileManager = FileManager.getInstance();

// 读取目录
const files = await fileManager.readDirectory('/path/to/directory');

// 创建文件
await fileManager.createFile('/path/to/file.txt', 'Hello World');

// 创建目录
await fileManager.createDirectory('/path/to/directory');

// 复制文件或目录
await fileManager.copy('/path/to/source', '/path/to/destination');

// 移动文件或目录
await fileManager.move('/path/to/source', '/path/to/destination');

// 删除文件或目录
await fileManager.delete('/path/to/target');

// 获取文件信息
const fileInfo = await fileManager.getInfo('/path/to/file');

// 检查文件或目录是否存在
const exists = await fileManager.exists('/path/to/target');
```

### 渲染进程

在渲染进程中，通过预加载脚本暴露的 `fileManager` 对象来使用文件管理功能：

```typescript
// 读取目录
const files = await window.fileManager.readDirectory('/path/to/directory');

// 创建文件
await window.fileManager.createFile('/path/to/file.txt', 'Hello World');

// 创建目录
await window.fileManager.createDirectory('/path/to/directory');

// 复制文件或目录
await window.fileManager.copyFile('/path/to/source', '/path/to/destination');

// 移动文件或目录
await window.fileManager.moveFile('/path/to/source', '/path/to/destination');

// 删除文件或目录
await window.fileManager.deleteFile('/path/to/target');

// 获取文件信息
const fileInfo = await window.fileManager.getFileInfo('/path/to/file');

// 检查文件或目录是否存在
const exists = await window.fileManager.existsFile('/path/to/target');
```

### 渲染进程类型定义

```typescript
interface FileOperations {
  readDirectory: (dirPath: string) => Promise<FileInfo[]>;
  createDirectory: (dirPath: string) => Promise<void>;
  createFile: (filePath: string, content?: string) => Promise<void>;
  readFile: (filePath: string, encoding?: BufferEncoding) => Promise<string>;
  copyFile: (sourcePath: string, destinationPath: string) => Promise<void>;
  moveFile: (sourcePath: string, destinationPath: string) => Promise<void>;
  deleteFile: (targetPath: string) => Promise<void>;
  getFileInfo: (targetPath: string) => Promise<FileInfo>;
  existsFile: (targetPath: string) => Promise<boolean>;
}
```

### 渲染进程使用示例

```typescript
// 示例：读取目录并显示文件列表
async function listFiles(dirPath: string) {
  try {
    const files = await window.fileManager.readDirectory(dirPath);
    files.forEach(file => {
      console.log(`${file.name} - ${file.isDirectory ? '目录' : '文件'}`);
    });
  } catch (error) {
    console.error('读取目录失败:', error);
  }
}

// 示例：创建并写入文件
async function createAndWriteFile(filePath: string, content: string) {
  try {
    await window.fileManager.createFile(filePath, content);
    console.log('文件创建成功');
  } catch (error) {
    console.error('创建文件失败:', error);
  }
}
```

### 渲染进程注意事项

1. 所有操作都是异步的，需要使用 `async/await` 或 Promise 方式调用
2. 所有路径操作都会自动进行标准化处理
3. 所有方法都包含完整的错误处理
4. 支持跨平台路径处理
5. 文件操作会自动处理权限问题
6. 渲染进程中的操作实际上是通过 IPC 通信转发到主进程执行的，所以性能上可能比直接在主进程中使用稍慢

## API 文档

### FileManager 类

#### 单例获取

```typescript
const fileManager = FileManager.getInstance();
```

#### 方法

- `readDirectory(dirPath: string): Promise<FileInfo[]>`
  - 读取目录内容，返回文件和文件夹信息数组

- `createDirectory(dirPath: string): Promise<void>`
  - 创建新目录

- `createFile(filePath: string, content?: string): Promise<void>`
  - 创建新文件，可选指定内容

- `read(filePath: string, encoding?: BufferEncoding): Promise<string>`
  - 读取文件内容

- `copy(sourcePath: string, destinationPath: string): Promise<void>`
  - 复制文件或目录

- `move(sourcePath: string, destinationPath: string): Promise<void>`
  - 移动文件或目录

- `delete(targetPath: string): Promise<void>`
  - 删除文件或目录

- `getInfo(targetPath: string): Promise<FileInfo>`
  - 获取文件或目录信息

- `exists(targetPath: string): Promise<boolean>`
  - 检查文件或目录是否存在

### 类型定义

```typescript
interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
  createdTime: Date;
}
```

## 注意事项

1. 所有路径操作都会自动进行标准化处理
2. 所有操作都支持异步/await 语法
3. 所有方法都包含完整的错误处理
4. 支持跨平台路径处理
5. 文件操作会自动处理权限问题

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