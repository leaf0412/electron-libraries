"use strict";
const electron = require("electron");
const i = "WINDOW_NEW", n = "WINDOW_CLOSED", e = "WINDOW_HIDE", I = "WINDOW_SHOW", O = "WINDOW_FOCUS", N = "GET_WINDOW_INFO", _ = "WINDOW_MINI", D = "WINDOW_MAX", d = "WINDOW_MAX_MIN_SIZE", w = "WINDOW_RESTORE", k = "WINDOW_RELOAD", v = "SCREEN_GET_DISPLAY_INFO", E = { createWindow: (o) => electron.ipcRenderer.invoke(i, o), closeWindow: (o) => electron.ipcRenderer.invoke(n, o), hideWindow: (o) => electron.ipcRenderer.invoke(e, o), showWindow: (o) => electron.ipcRenderer.invoke(I, o), focusWindow: (o) => electron.ipcRenderer.invoke(O, o), getWindowInfo: (o) => electron.ipcRenderer.invoke(N, o), minimizeWindow: (o) => electron.ipcRenderer.invoke(_, o), maximizeWindow: (o) => electron.ipcRenderer.invoke(D, o), toggleMaximizeWindow: (o) => electron.ipcRenderer.invoke(d, o), restoreWindow: (o) => electron.ipcRenderer.invoke(w, o), reloadWindow: (o) => electron.ipcRenderer.invoke(k, o), getDisplayInfo: () => electron.ipcRenderer.invoke(v) };
electron.contextBridge.exposeInMainWorld("windowManager", E);
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
