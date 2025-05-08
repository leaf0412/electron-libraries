import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import WindowManager from '../src/window';
import type { WindowOptions } from '../src/types';

describe('WindowManager', () => {
  let windowManager: WindowManager;
  const mockOptions: WindowOptions = {
    width: 800,
    height: 600,
    title: 'Test Window',
  };

  beforeEach(() => {
    windowManager = new WindowManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a window manager instance', () => {
      expect(windowManager).toBeDefined();
      expect(windowManager.main).toBeNull();
      expect(windowManager.group.size).toBe(0);
    });

    it('should use default values when no options provided', () => {
      expect(windowManager.rendererDirectoryName).toBe('dist');
      expect(windowManager.devServerUrl).toBe('http://localhost:5173/');
    });
  });

  describe('createWindow', () => {
    it('should create a new window with provided options', () => {
      const window = windowManager.createWindow(mockOptions);
      expect(window).toBeDefined();
      expect(windowManager.group.size).toBe(1);
    });

    it('should not create duplicate window for same route', () => {
      const window1 = windowManager.createWindow({ ...mockOptions, route: '/test' });
      const window2 = windowManager.createWindow({ ...mockOptions, route: '/test' });
      expect(window1).toBe(window2);
      expect(windowManager.group.size).toBe(1);
    });

    it('should create multiple windows with different routes', () => {
      const window1 = windowManager.createWindow({ ...mockOptions, route: '/test1' });
      const window2 = windowManager.createWindow({ ...mockOptions, route: '/test2' });
      expect(window1).not.toBe(window2);
      expect(windowManager.group.size).toBe(2);
    });
  });

  describe('getWindow', () => {
    it('should return window by id', () => {
      const window = windowManager.createWindow(mockOptions);
      const foundWindow = windowManager.getWindow(window.id);
      expect(foundWindow).toBe(window);
    });

    it('should return undefined for non-existent window id', () => {
      const foundWindow = windowManager.getWindow(999);
      expect(foundWindow).toBeUndefined();
    });
  });

  describe('getAllWindows', () => {
    it('should return all windows', () => {
      windowManager.createWindow(mockOptions);
      windowManager.createWindow({ ...mockOptions, route: '/test2' });
      const windows = windowManager.getAllWindows();
      expect(windows.length).toBe(2);
    });

    it('should return empty array when no windows exist', () => {
      const windows = windowManager.getAllWindows();
      expect(windows.length).toBe(0);
    });
  });

  describe('closeAllWindow', () => {
    it('should close all windows', () => {
      const window1 = windowManager.createWindow(mockOptions);
      const window2 = windowManager.createWindow({ ...mockOptions, route: '/test2' });
      
      windowManager.closeAllWindow();
      
      expect(windowManager.group.size).toBe(0);
      expect(window1.close).toHaveBeenCalled();
      expect(window2.close).toHaveBeenCalled();
    });
  });
}); 