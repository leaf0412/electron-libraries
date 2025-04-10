import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater, UpdateInfo as ElectronUpdateInfo } from 'electron-updater';
import { UpdateInfo, UpdateOptions, UpdateProgress, UpdateError } from './types';

const Events = {
  CHECK_FOR_UPDATES: 'CHECK_FOR_UPDATES',
  DOWNLOAD_UPDATE: 'DOWNLOAD_UPDATE',
  INSTALL_UPDATE: 'INSTALL_UPDATE',
} as const;

export class UpgradeManager {
  private options: UpdateOptions;
  private mainWindow: BrowserWindow | null = null;

  constructor(options: UpdateOptions) {
    this.options = options;
    this.initializeAutoUpdater();
  }

  /**
   * 初始化自动更新器
   */
  private initializeAutoUpdater(): void {
    // 配置更新服务器
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: this.options.serverUrl,
    });

    // 注册事件监听器
    autoUpdater.on('checking-for-update', () => {
      this.notifyProgress('check', { percent: 0, transferred: 0, total: 0 });
    });

    autoUpdater.on('update-available', (info: ElectronUpdateInfo) => {
      this.notifyProgress('available', { percent: 0, transferred: 0, total: 0 });
    });

    autoUpdater.on('update-not-available', () => {
      this.notifyProgress('not-available', { percent: 0, transferred: 0, total: 0 });
    });

    autoUpdater.on('download-progress', (progressObj: UpdateProgress) => {
      this.notifyProgress('download', progressObj);
    });

    autoUpdater.on('update-downloaded', () => {
      this.notifyProgress('downloaded', { percent: 100, transferred: 0, total: 0 });
      if (this.options.autoInstall) {
        this.installUpdate();
      }
    });

    autoUpdater.on('error', (error: Error) => {
      this.handleError(error);
    });
  }

  /**
   * 设置主窗口，用于显示更新进度
   */
  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  /**
   * listen
   */
  listen(): void {
    ipcMain.handle(Events.CHECK_FOR_UPDATES, async () => {
      return await this.checkForUpdates();
    });

    ipcMain.handle(Events.DOWNLOAD_UPDATE, async () => {
      return await this.downloadUpdate();
    });

    ipcMain.handle(Events.INSTALL_UPDATE, async () => {
      return await this.installUpdate();
    });
  }
  /**
   * 检查更新
   */
  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const result = await autoUpdater.checkForUpdates();
      if (!result) {
        return null;
      }

      if (result.isUpdateAvailable) {
        const updateInfo = result.updateInfo;
        return {
          version: updateInfo.version,
          releaseDate: updateInfo.releaseDate,
          releaseNotes: Array.isArray(updateInfo.releaseNotes) 
            ? updateInfo.releaseNotes.map(note => note.note).join('\n')
            : updateInfo.releaseNotes || '',
          downloadUrl: updateInfo.files?.[0]?.url || '',
          sha256: updateInfo.files?.[0]?.sha512 || '',
        };
      }
      return null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 下载更新
   */
  async downloadUpdate(): Promise<void> {
    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 安装更新
   */
  async installUpdate(): Promise<void> {
    try {
      autoUpdater.quitAndInstall();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 通知更新进度
   */
  private notifyProgress(type: 'check' | 'available' | 'not-available' | 'download' | 'downloaded', progress: UpdateProgress): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('upgrade-progress', { type, progress });
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: unknown): UpdateError {
    return {
      code: 'UPDATE_ERROR',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      details: error,
    };
  }
} 