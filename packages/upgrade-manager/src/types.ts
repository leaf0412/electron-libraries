export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
  downloadUrl: string;
  sha256: string;
}

export interface UpdateOptions {
  /**
   * 检查更新的服务器地址
   */
  serverUrl: string;
  /**
   * 当前应用版本
   */
  currentVersion: string;
  /**
   * 是否自动下载更新
   */
  autoDownload?: boolean;
  /**
   * 是否自动安装更新
   */
  autoInstall?: boolean;
}

export interface UpdateProgress {
  /**
   * 下载进度百分比 (0-100)
   */
  percent: number;
  /**
   * 已下载的字节数
   */
  transferred: number;
  /**
   * 总字节数
   */
  total: number;
}

export interface UpdateError {
  code: string;
  message: string;
  details?: unknown;
} 