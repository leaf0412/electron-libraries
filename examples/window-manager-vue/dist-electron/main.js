import { app, protocol, BrowserWindow, ipcMain, screen, net } from "electron";
import s from "node:path";
import a from "node:fs";
import { URL } from "node:url";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const w = "development" === process.env.NODE_ENV, l = process.env.VITE_DEV_SERVER_URL, g = app.getName(), h = (e2 = g) => {
  protocol.registerSchemesAsPrivileged([{ scheme: e2, privileges: { secure: true, standard: true, corsEnabled: true, supportFetchAPI: true } }]);
}, u = ({ scheme: n2 = g, directory: t2 = { isSameDirectory: false, name: "dist" } }) => {
  protocol.handle(n2, async (i2) => {
    try {
      const n3 = ((e2, i3) => {
        const r2 = decodeURI(e2).replace(/^\//, "").replace(/\/$/, "");
        if (i3.isSameDirectory) return r2.startsWith(i3.name) ? r2 === i3.name ? s.join(r2, "index.html") : r2 : "" === r2 ? s.join(i3.name, "index.html") : s.join(i3.name, r2);
        return r2;
      })(new URL(i2.url).pathname, t2);
      let o2;
      o2 = w ? process.cwd() : app.getAppPath();
      const l2 = s.resolve(o2, n3);
      return await a.promises.access(l2, a.constants.R_OK), net.fetch(`file://${l2}`);
    } catch (e2) {
      return new Response(null, { status: 404 });
    }
  });
}, c = (e2 = g) => {
  protocol.unhandle(e2);
};
class W {
  constructor(e2 = {}) {
    Object.defineProperty(this, "rendererDirectoryName", { enumerable: true, configurable: true, writable: true, value: "dist" }), Object.defineProperty(this, "devServerUrl", { enumerable: true, configurable: true, writable: true, value: l }), Object.defineProperty(this, "windowOptionsConfig", { enumerable: true, configurable: true, writable: true, value: {} }), Object.defineProperty(this, "main", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "group", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), this.windowOptionsConfig = this.windowOptions({ webPreferences: e2.webPreferences }), this.rendererDirectoryName = e2.rendererDirectoryName || this.rendererDirectoryName, this.devServerUrl = e2.devServerUrl ?? this.devServerUrl, u({ scheme: g, directory: { isSameDirectory: true, name: this.rendererDirectoryName } });
  }
  windowOptions({ width: e2 = 500, height: i2 = 800, icon: r2 = "", webPreferences: n2 = {} }) {
    return { width: e2, height: i2, isDevTools: false, resizable: true, minimizable: true, maximizable: true, show: false, icon: r2, webPreferences: { webSecurity: false, contextIsolation: true, nodeIntegration: true, ...n2 } };
  }
  getWindow(e2) {
    return BrowserWindow.fromId(e2) || void 0;
  }
  getAllWindows() {
    return BrowserWindow.getAllWindows();
  }
  createWindow(e2) {
    const i2 = this.windowOptionsConfig, r2 = Object.assign({}, i2, e2);
    for (const e3 in this.group) {
      const i3 = this.getWindow(Number(e3)), { route: n2, isMultiWindow: t3 } = this.group.get(e3);
      if (i3 && n2 === r2.route && !t3) return i3.focus(), i3;
    }
    r2.parentId && (r2.parent = this.getWindow(r2.parentId));
    const t2 = new BrowserWindow(r2);
    this.group.set(t2.id, { route: r2.route || "", isMultiWindow: r2.isMultiWindow || false }), r2.maximize && r2.resizable && t2.maximize(), r2.isMainWin && (this.main && (this.group.delete(this.main.id), this.main.close()), this.main = t2), r2.id = t2.id;
    let o2 = "";
    if (this.devServerUrl) o2 = r2.route ? this.devServerUrl + r2.route : this.devServerUrl, r2.isDevTools && t2.webContents.openDevTools();
    else {
      const e3 = `./${this.rendererDirectoryName}`;
      o2 = r2.route ? `${g}://${e3}${r2.route}` : `${g}://${e3}`;
    }
    return t2.loadURL(o2), t2.on("close", () => {
      t2.setOpacity(0), t2.hide(), this.group.delete(t2.id);
    }), t2;
  }
  closeAllWindow() {
    var _a;
    for (const i2 in this.group) this.group.get(i2) && (this.getWindow(Number(i2)) ? (_a = this.getWindow(Number(i2))) == null ? void 0 : _a.close() : app.quit());
  }
}
const m = { WINDOW_NEW: "WINDOW_NEW", WINDOW_CLOSED: "WINDOW_CLOSED", WINDOW_HIDE: "WINDOW_HIDE", WINDOW_SHOW: "WINDOW_SHOW", WINDOW_FOCUS: "WINDOW_FOCUS", GET_WINDOW_INFO: "GET_WINDOW_INFO", WINDOW_MINI: "WINDOW_MINI", WINDOW_MAX: "WINDOW_MAX", WINDOW_MAX_MIN_SIZE: "WINDOW_MAX_MIN_SIZE", WINDOW_RESTORE: "WINDOW_RESTORE", WINDOW_RELOAD: "WINDOW_RELOAD", SCREEN_GET_DISPLAY_INFO: "SCREEN_GET_DISPLAY_INFO" };
class N {
  constructor(e2) {
    Object.defineProperty(this, "windowManager", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "paramToInfoKey", { enumerable: true, configurable: true, writable: true, value: (e3) => ({ isBounds: "bounds", isMaximized: "isMaximized", isMinimized: "isMinimized", isFullScreen: "isFullScreen", isVisible: "isVisible", isDestroyed: "isDestroyed", isFocused: "isFocused", isAlwaysOnTop: "isAlwaysOnTop" })[e3] }), Object.defineProperty(this, "assignTyped", { enumerable: true, configurable: true, writable: true, value: (e3, i2, r2) => {
      e3[i2] = r2;
    } }), this.windowManager = e2;
  }
  initIpcHandlers() {
    ipcMain.handle(m.WINDOW_CLOSED, (e2, i2) => {
      var _a;
      i2 ? ((_a = this.windowManager.getWindow(Number(i2))) == null ? void 0 : _a.close(), this.windowManager.group.delete(i2)) : this.windowManager.closeAllWindow();
    }), ipcMain.handle(m.WINDOW_HIDE, (e2, i2) => {
      var _a, _b;
      if (i2) (_a = this.windowManager.getWindow(Number(i2))) == null ? void 0 : _a.hide();
      else for (const e3 in this.windowManager.group) this.windowManager.group.get(e3) && ((_b = this.windowManager.getWindow(Number(e3))) == null ? void 0 : _b.hide());
    }), ipcMain.handle(m.WINDOW_SHOW, (e2, i2) => {
      var _a, _b;
      if (i2) (_a = this.windowManager.getWindow(Number(i2))) == null ? void 0 : _a.show();
      else for (const e3 in this.windowManager.group) this.windowManager.group.get(e3) && ((_b = this.windowManager.getWindow(Number(e3))) == null ? void 0 : _b.show());
    }), ipcMain.handle(m.WINDOW_MINI, (e2, i2) => {
      var _a, _b;
      if (i2) (_a = this.windowManager.getWindow(Number(i2))) == null ? void 0 : _a.minimize();
      else for (const e3 in this.windowManager.group) this.windowManager.group.get(e3) && ((_b = this.windowManager.getWindow(Number(e3))) == null ? void 0 : _b.minimize());
    }), ipcMain.handle(m.WINDOW_MAX, (e2, i2) => {
      var _a, _b;
      if (i2) (_a = this.windowManager.getWindow(Number(i2))) == null ? void 0 : _a.maximize();
      else for (const e3 in this.windowManager.group) this.windowManager.group.get(e3) && ((_b = this.windowManager.getWindow(Number(e3))) == null ? void 0 : _b.maximize());
    }), ipcMain.handle(m.WINDOW_MAX_MIN_SIZE, (e2, i2) => {
      var _a, _b, _c;
      i2 && (((_a = this.windowManager.getWindow(i2)) == null ? void 0 : _a.isMaximized()) ? (_b = this.windowManager.getWindow(i2)) == null ? void 0 : _b.unmaximize() : (_c = this.windowManager.getWindow(i2)) == null ? void 0 : _c.maximize());
    }), ipcMain.handle(m.WINDOW_RESTORE, (e2, i2) => {
      var _a, _b;
      if (i2) (_a = this.windowManager.getWindow(Number(i2))) == null ? void 0 : _a.restore();
      else for (const e3 in this.windowManager.group) this.windowManager.group.get(e3) && ((_b = this.windowManager.getWindow(Number(e3))) == null ? void 0 : _b.restore());
    }), ipcMain.handle(m.WINDOW_RELOAD, (e2, i2) => {
      var _a, _b;
      if (i2) (_a = this.windowManager.getWindow(Number(i2))) == null ? void 0 : _a.reload();
      else for (const e3 in this.windowManager.group) this.windowManager.group.get(e3) && ((_b = this.windowManager.getWindow(Number(e3))) == null ? void 0 : _b.reload());
    }), ipcMain.handle(m.WINDOW_FOCUS, (e2, i2) => {
      var _a;
      i2 && ((_a = this.windowManager.getWindow(Number(i2))) == null ? void 0 : _a.focus());
    }), ipcMain.handle(m.GET_WINDOW_INFO, (e2, i2 = {}) => {
      const r2 = BrowserWindow.fromWebContents(e2.sender);
      if (!r2) throw new Error("Window not found");
      const t2 = { id: r2.id, title: r2.title, url: r2.webContents.getURL() }, o2 = { isBounds: () => r2.getBounds(), isMaximized: () => r2.isMaximized(), isMinimized: () => r2.isMinimized(), isFullScreen: () => r2.isFullScreen(), isVisible: () => r2.isVisible(), isDestroyed: () => r2.isDestroyed(), isFocused: () => r2.isFocused(), isAlwaysOnTop: () => r2.isAlwaysOnTop() };
      return Object.keys(i2).forEach((e3) => {
        if (i2[e3]) {
          const i3 = this.paramToInfoKey(e3);
          this.assignTyped(t2, i3, o2[e3]());
        }
      }), t2;
    }), ipcMain.handle(m.WINDOW_NEW, (e2, i2) => this.windowManager.createWindow(i2).id), ipcMain.handle(m.SCREEN_GET_DISPLAY_INFO, () => screen.getPrimaryDisplay());
  }
  destroyIpcHandlers() {
    Object.keys(m).forEach((e2) => {
      ipcMain.removeHandler(m[e2]);
    });
  }
}
let windowManager = null;
let windowIpcHandler = null;
let mainWindow;
const __dirname = dirname(fileURLToPath(import.meta.url));
const initApp = async () => {
  await app.whenReady();
  windowManager = new W({
    rendererDirectoryName: "dist",
    webPreferences: {
      preload: join(__dirname, "preload.mjs")
    }
  });
  windowIpcHandler = new N(windowManager);
  windowIpcHandler.initIpcHandlers();
  mainWindow = windowManager.createWindow({
    isMainWin: true,
    width: 1024,
    height: 768
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });
};
const destroyIpcHandlers = () => {
  windowIpcHandler == null ? void 0 : windowIpcHandler.destroyIpcHandlers();
  windowIpcHandler = null;
};
const destroyApp = () => {
  c();
  destroyIpcHandlers();
  windowManager == null ? void 0 : windowManager.closeAllWindow();
  windowManager = null;
};
const gotTheLock = app.requestSingleInstanceLock();
if (gotTheLock) {
  h();
  initApp().catch(console.error);
  app.on("window-all-closed", () => {
    destroyApp();
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      initApp().catch(console.error);
    }
  });
} else {
  app.quit();
}
export {
  __dirname
};
