import { vi, beforeEach } from 'vitest';

// 设置环境变量
process.env.NODE_ENV = 'test';

// Mock electron modules
vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showMessageBox: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// 在每个测试之前清空所有 mock
beforeEach(() => {
  vi.clearAllMocks();
}); 