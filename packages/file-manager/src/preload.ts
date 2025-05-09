import { contextBridge, ipcRenderer } from 'electron';
import { FileManagerEvents as Events } from './event';
import { FileOperations } from './types';

const fileApi: FileOperations = {
  readDirectory: (dirPath: string) =>
    ipcRenderer.invoke(Events.FILE_READ_DIRECTORY, dirPath),
  createDirectory: (dirPath: string) =>
    ipcRenderer.invoke(Events.FILE_CREATE_DIRECTORY, dirPath),
  createFile: (filePath: string, content?: string) =>
    ipcRenderer.invoke(Events.FILE_CREATE_FILE, filePath, content),
  readFile: (filePath: string, encoding?: BufferEncoding) =>
    ipcRenderer.invoke(Events.FILE_READ, filePath, encoding),
  copyFile: (sourcePath: string, destinationPath: string) =>
    ipcRenderer.invoke(Events.FILE_COPY, sourcePath, destinationPath),
  moveFile: (sourcePath: string, destinationPath: string) =>
    ipcRenderer.invoke(Events.FILE_MOVE, sourcePath, destinationPath),
  deleteFile: (targetPath: string) =>
    ipcRenderer.invoke(Events.FILE_DELETE, targetPath),
  getFileInfo: (targetPath: string) =>
    ipcRenderer.invoke(Events.FILE_GET_INFO, targetPath),
  existsFile: (targetPath: string) =>
    ipcRenderer.invoke(Events.FILE_EXISTS, targetPath),
};

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('fileManager', fileApi);
