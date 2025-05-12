import { describe, it, expect, beforeEach, vi } from 'vitest';
import DialogManager from '../src/dialog';
import DialogIpcHandler from '../src/ipc';
import { dialog, ipcMain } from 'electron';
import { DialogEvents } from '../src/event';

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

describe('DialogManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('showOpenDialog', () => {
    it('should call dialog.showOpenDialog with correct options', async () => {
      const options = { title: 'Open File' };
      const expectedResult = { canceled: false, filePaths: ['/path/to/file'] };
      
      (dialog.showOpenDialog as any).mockResolvedValue(expectedResult);
      
      const result = await DialogManager.showOpenDialog(options);
      
      expect(dialog.showOpenDialog).toHaveBeenCalledWith(options);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('showSaveDialog', () => {
    it('should call dialog.showSaveDialog with correct options', async () => {
      const options = { title: 'Save File' };
      const expectedResult = { canceled: false, filePath: '/path/to/save' };
      
      (dialog.showSaveDialog as any).mockResolvedValue(expectedResult);
      
      const result = await DialogManager.showSaveDialog(options);
      
      expect(dialog.showSaveDialog).toHaveBeenCalledWith(options);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('showMessageBox', () => {
    it('should call dialog.showMessageBox with correct options', async () => {
      const options = { title: 'Message', message: 'Test message' };
      const expectedResult = { response: 0 };
      
      (dialog.showMessageBox as any).mockResolvedValue(expectedResult);
      
      const result = await DialogManager.showMessageBox(options);
      
      expect(dialog.showMessageBox).toHaveBeenCalledWith(options);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('showErrorBox', () => {
    it('should call dialog.showMessageBox with error type', async () => {
      const options = { title: 'Error', message: 'Test error' };
      const expectedResult = { response: 0 };
      
      (dialog.showMessageBox as any).mockResolvedValue(expectedResult);
      
      const result = await DialogManager.showErrorBox(options);
      
      expect(dialog.showMessageBox).toHaveBeenCalledWith({
        ...options,
        type: 'error',
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('showInfoBox', () => {
    it('should call dialog.showMessageBox with info type', async () => {
      const options = { title: 'Info', message: 'Test info' };
      const expectedResult = { response: 0 };
      
      (dialog.showMessageBox as any).mockResolvedValue(expectedResult);
      
      const result = await DialogManager.showInfoBox(options);
      
      expect(dialog.showMessageBox).toHaveBeenCalledWith({
        ...options,
        type: 'info',
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('showWarningBox', () => {
    it('should call dialog.showMessageBox with warning type', async () => {
      const options = { title: 'Warning', message: 'Test warning' };
      const expectedResult = { response: 0 };
      
      (dialog.showMessageBox as any).mockResolvedValue(expectedResult);
      
      const result = await DialogManager.showWarningBox(options);
      
      expect(dialog.showMessageBox).toHaveBeenCalledWith({
        ...options,
        type: 'warning',
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('showQuestionBox', () => {
    it('should call dialog.showMessageBox with question type', async () => {
      const options = { title: 'Question', message: 'Test question' };
      const expectedResult = { response: 0 };
      
      (dialog.showMessageBox as any).mockResolvedValue(expectedResult);
      
      const result = await DialogManager.showQuestionBox(options);
      
      expect(dialog.showMessageBox).toHaveBeenCalledWith({
        ...options,
        type: 'question',
      });
      expect(result).toEqual(expectedResult);
    });
  });
});

describe('DialogIpcHandler', () => {
  let dialogIpcHandler: DialogIpcHandler;

  beforeEach(() => {
    dialogIpcHandler = new DialogIpcHandler();
    vi.clearAllMocks();
  });

  describe('initIpcHandlers', () => {
    it('should register all IPC handlers', () => {
      dialogIpcHandler.initIpcHandlers();

      expect(ipcMain.handle).toHaveBeenCalledTimes(7);
      expect(ipcMain.handle).toHaveBeenCalledWith(
        DialogEvents.DIALOG_OPEN,
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        DialogEvents.DIALOG_SAVE,
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        DialogEvents.DIALOG_MESSAGE,
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        DialogEvents.DIALOG_ERROR,
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        DialogEvents.DIALOG_INFO,
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        DialogEvents.DIALOG_WARNING,
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        DialogEvents.DIALOG_QUESTION,
        expect.any(Function)
      );
    });
  });

  describe('destroyIpcHandlers', () => {
    it('should remove all IPC handlers', () => {
      dialogIpcHandler.destroyIpcHandlers();

      expect(ipcMain.removeHandler).toHaveBeenCalledTimes(7);
      Object.values(DialogEvents).forEach(event => {
        expect(ipcMain.removeHandler).toHaveBeenCalledWith(event);
      });
    });
  });
});
