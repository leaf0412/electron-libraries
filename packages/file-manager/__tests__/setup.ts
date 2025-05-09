import { vi, beforeEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

// 设置环境变量
process.env.NODE_ENV = 'test';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    rename: vi.fn(),
    rm: vi.fn(),
    unlink: vi.fn(),
    access: vi.fn(),
    copyFile: vi.fn(),
  },
}));

// Mock path module
const mockPath = {
  join: vi.fn((...args: string[]) => args.join('/')),
  basename: vi.fn((filePath: string) => filePath.split('/').pop() || ''),
};

vi.mock('path', () => mockPath);

// 在每个测试之前清空所有 mock
beforeEach(() => {
  vi.clearAllMocks();
}); 