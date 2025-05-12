import {
  contextBridge,
  ipcRenderer,
  OpenDialogOptions,
  SaveDialogOptions,
} from 'electron';
import { DialogEvents as Events } from './event';
import { DialogOperations, DialogOptions } from './types';

const dialogApi: DialogOperations = {
  openDialog: (options: OpenDialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_OPEN, options),
  saveDialog: (options: SaveDialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_SAVE, options),
  showMessageDialog: (options: DialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_MESSAGE, options),
  showErrorDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_ERROR, options),
  showInfoDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_INFO, options),
  showWarningDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_WARNING, options),
  showQuestionDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_QUESTION, options),
};

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('dialogManager', dialogApi);
