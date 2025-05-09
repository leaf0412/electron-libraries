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
- Node.js >= 14

## 许可证

MIT © leaf 