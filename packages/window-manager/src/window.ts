import { BrowserWindow } from 'electron';
// import { join } from 'node:path';
// import { fileURLToPath } from 'node:url';
import {
  RENDERER_DIRECTORY_NAME,
  VITE_DEV_SERVER_URL,
  // VITE_PUBLIC,
} from './constants';
import { createProtocol, defaultScheme } from './protocol';
import { WindowOptions } from './types';

// const __dirname = dirname(fileURLToPath(import.meta.url));

class WindowManager {
  rendererDirectoryName = RENDERER_DIRECTORY_NAME;
  devServerUrl = VITE_DEV_SERVER_URL;
  windowOptionsConfig = {};
  main: BrowserWindow | null = null;
  group = new Map();
  constructor(
    props: {
      rendererDirectoryName?: string;
      devServerUrl?: string;
      icon?: string;
      webPreferences?: Electron.WebPreferences;
    } = {}
  ) {
    this.windowOptionsConfig = this.windowOptions({
      webPreferences: props.webPreferences,
    });
    this.rendererDirectoryName =
      props.rendererDirectoryName || this.rendererDirectoryName;
    this.devServerUrl = props.devServerUrl ?? this.devServerUrl;
    createProtocol({
      scheme: defaultScheme,
      directory: {
        isSameDirectory: true,
        name: this.rendererDirectoryName,
      },
    });
  }

  windowOptions({ width = 500, height = 800, icon = '', webPreferences = {} }) {
    return {
      width,
      height,
      isDevTools: false,
      resizable: true,
      minimizable: true,
      maximizable: true,
      show: false,
      icon,
      webPreferences: {
        // preload: join(__dirname, 'preload.mjs'),
        webSecurity: false,
        contextIsolation: true,
        nodeIntegration: true,
        ...webPreferences,
      },
    };
  }

  getWindow(id: number) {
    return BrowserWindow.fromId(id) || undefined;
  }

  getAllWindows() {
    return BrowserWindow.getAllWindows();
  }

  createWindow(options?: WindowOptions) {
    const opt = this.windowOptionsConfig;
    const args = Object.assign({}, opt, options);

    if (args.route && !args.isMultiWindow) {
      for (const [id, data] of this.group.entries()) {
        const currentWindow = BrowserWindow.fromId(id);
        if (currentWindow && data.route === args.route) {
          currentWindow.focus();
          return currentWindow;
        }
      }
    }

    if (args.parentId) {
      args.parent = this.getWindow(args.parentId);
    }

    const win = new BrowserWindow(args);
    this.group.set(win.id, {
      route: args.route || '',
      isMultiWindow: args.isMultiWindow || false,
    });

    if (args.maximize && args.resizable) {
      win.maximize();
    }

    if (args.isMainWin) {
      if (this.main) {
        this.group.delete(this.main.id);
        this.main.close();
      }
      this.main = win;
    }
    args.id = win.id;

    let winURL = '';
    if (this.devServerUrl) {
      winURL = args.route ? this.devServerUrl + args.route : this.devServerUrl;
      if (args.isDevTools) {
        win.webContents.openDevTools();
      }
    } else {
      const filePath = `./${this.rendererDirectoryName}`;
      winURL = args.route
        ? `${defaultScheme}://${filePath}${args.route}`
        : `${defaultScheme}://${filePath}`;
    }
    win.loadURL(winURL);

    win.on('close', () => {
      win.setOpacity(0);
      win.hide();
      this.group.delete(win.id);
    });
    return win;
  }

  closeAllWindow() {
    const windows = Array.from(this.group.keys());
    for (const id of windows) {
      const win = BrowserWindow.fromId(id);
      if (win) {
        win.close();
      }
    }
    this.group.clear();
  }
}

export default WindowManager;
