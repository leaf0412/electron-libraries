# Electron Libraries

这是一个基于 Electron 的库集合，提供了一系列用于构建 Electron 应用的实用工具和组件。

## 项目结构

项目使用 pnpm workspace 进行管理，包含以下主要部分：

### 核心库 (packages/)

- `file-manager`: 文件管理相关的工具库
- `window-manager`: 窗口管理相关的工具库

### 示例项目 (examples/)

- `file-manager-vue`: 使用 Vue.js 的文件管理器示例
- `file-manager-react`: 使用 React 的文件管理器示例
- `window-manager-vue`: 使用 Vue.js 的窗口管理器示例
- `window-manager-react`: 使用 React 的窗口管理器示例

## 技术栈

- Electron
- TypeScript
- pnpm (包管理器)
- ESLint + Prettier (代码规范)
- Vitest (测试框架)
- Husky (Git hooks)

## 开发环境要求

- Node.js
- pnpm 8.15.4 或更高版本

## 安装

```bash
# 克隆项目
git clone https://github.com/leaf0412/electron-libraries.git

# 安装依赖
pnpm install
```

## 开发命令

```bash
# 构建所有包
pnpm build

# 运行测试
pnpm test

# 运行代码检查
pnpm lint

# 清理构建文件
pnpm clean

# 删除所有 node_modules
pnpm rm:node_modules
```

## 项目特点

- 使用 TypeScript 确保类型安全
- 采用 monorepo 结构，便于管理和维护
- 提供多个框架的示例实现
- 完整的开发工具链支持
- 代码提交前自动进行格式化和检查

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

[待定] 