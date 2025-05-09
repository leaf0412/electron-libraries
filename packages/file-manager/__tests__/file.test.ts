import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import FileManager from '../src/file';
import { promises as fs } from 'fs';
import path from 'path';

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
vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return {
    ...actual,
    default: actual,
    join: vi.fn((...args: string[]) => args.join('/')),
    basename: vi.fn((filePath: string) => filePath.split('/').pop() || ''),
  };
});

describe('FileManager', () => {
  let fileManager: FileManager;
  const mockPath = '/test/path';
  const mockFileInfo = {
    name: 'test.txt',
    path: '/test/path/test.txt',
    isDirectory: false,
    size: 1024,
    modifiedTime: new Date(),
    createdTime: new Date(),
  };

  beforeEach(() => {
    fileManager = FileManager.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = FileManager.getInstance();
      const instance2 = FileManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('readDirectory', () => {
    it('should read directory contents', async () => {
      const mockEntries = [
        { name: 'file1.txt', isDirectory: () => false },
        { name: 'dir1', isDirectory: () => true },
      ];

      (fs.readdir as any).mockResolvedValue(mockEntries);
      (fs.stat as any).mockResolvedValue({
        isDirectory: () => false,
        size: 1024,
        mtime: new Date(),
        birthtime: new Date(),
      });

      const result = await fileManager.readDirectory(mockPath);
      expect(result).toHaveLength(2);
      expect(fs.readdir).toHaveBeenCalledWith(mockPath, {
        withFileTypes: true,
      });
    });

    it('should handle errors', async () => {
      (fs.readdir as any).mockRejectedValue(new Error('Read error'));
      await expect(fileManager.readDirectory(mockPath)).rejects.toThrow(
        'Failed to read directory'
      );
    });
  });

  describe('createDirectory', () => {
    it('should create a directory', async () => {
      await fileManager.createDirectory(mockPath);
      expect(fs.mkdir).toHaveBeenCalledWith(mockPath, { recursive: true });
    });

    it('should handle errors', async () => {
      (fs.mkdir as any).mockRejectedValue(new Error('Create error'));
      await expect(fileManager.createDirectory(mockPath)).rejects.toThrow(
        'Failed to create directory'
      );
    });
  });

  describe('createFile', () => {
    it('should create a file with content', async () => {
      const content = 'test content';
      await fileManager.createFile(mockPath, content);
      expect(fs.writeFile).toHaveBeenCalledWith(mockPath, content, 'utf-8');
    });

    it('should handle errors', async () => {
      (fs.writeFile as any).mockRejectedValue(new Error('Write error'));
      await expect(fileManager.createFile(mockPath)).rejects.toThrow(
        'Failed to create file'
      );
    });
  });

  describe('read', () => {
    it('should read file content', async () => {
      const content = 'test content';
      (fs.readFile as any).mockResolvedValue(content);
      const result = await fileManager.read(mockPath);
      expect(result).toBe(content);
      expect(fs.readFile).toHaveBeenCalledWith(mockPath, { encoding: 'utf-8' });
    });

    it('should handle errors', async () => {
      (fs.readFile as any).mockRejectedValue(new Error('Read error'));
      await expect(fileManager.read(mockPath)).rejects.toThrow(
        'Failed to read file'
      );
    });
  });

  describe('copy', () => {
    it('should copy a file', async () => {
      const destPath = '/test/dest';
      (fs.stat as any).mockResolvedValue({
        isDirectory: () => false,
        size: 1024,
        mtime: new Date(),
        birthtime: new Date(),
      });
      await fileManager.copy(mockPath, destPath);
      expect(fs.stat).toHaveBeenCalled();
      expect(fs.copyFile).toHaveBeenCalledWith(mockPath, destPath);
    });

    it('should handle errors', async () => {
      (fs.stat as any).mockRejectedValue(new Error('Copy error'));
      await expect(fileManager.copy(mockPath, '/test/dest')).rejects.toThrow(
        'Failed to copy'
      );
    });
  });

  describe('move', () => {
    it('should move a file', async () => {
      const destPath = '/test/dest';
      await fileManager.move(mockPath, destPath);
      expect(fs.rename).toHaveBeenCalledWith(mockPath, destPath);
    });

    it('should handle errors', async () => {
      (fs.rename as any).mockRejectedValue(new Error('Move error'));
      await expect(fileManager.move(mockPath, '/test/dest')).rejects.toThrow(
        'Failed to move'
      );
    });
  });

  describe('delete', () => {
    it('should delete a file', async () => {
      (fs.stat as any).mockResolvedValue({
        isDirectory: () => false,
        size: 1024,
        mtime: new Date(),
        birthtime: new Date(),
      });
      await fileManager.delete(mockPath);
      expect(fs.unlink).toHaveBeenCalledWith(mockPath);
    });

    it('should delete a directory', async () => {
      (fs.stat as any).mockResolvedValue({
        isDirectory: () => true,
        size: 1024,
        mtime: new Date(),
        birthtime: new Date(),
      });
      await fileManager.delete(mockPath);
      expect(fs.rm).toHaveBeenCalledWith(mockPath, {
        recursive: true,
        force: true,
      });
    });

    it('should handle errors', async () => {
      (fs.stat as any).mockRejectedValue(new Error('Delete error'));
      await expect(fileManager.delete(mockPath)).rejects.toThrow(
        'Failed to delete'
      );
    });
  });

  describe('getInfo', () => {
    it('should get file info', async () => {
      (fs.stat as any).mockResolvedValue({
        isDirectory: () => false,
        size: 1024,
        mtime: new Date(),
        birthtime: new Date(),
      });

      const result = await fileManager.getInfo(mockPath);
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('isDirectory');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('modifiedTime');
      expect(result).toHaveProperty('createdTime');
    });

    it('should handle errors', async () => {
      (fs.stat as any).mockRejectedValue(new Error('Stat error'));
      await expect(fileManager.getInfo(mockPath)).rejects.toThrow(
        'Failed to get file info'
      );
    });
  });

  describe('exists', () => {
    it('should return true if file exists', async () => {
      (fs.access as any).mockResolvedValue(undefined);
      const result = await fileManager.exists(mockPath);
      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      (fs.access as any).mockRejectedValue(new Error('File not found'));
      const result = await fileManager.exists(mockPath);
      expect(result).toBe(false);
    });
  });
});
