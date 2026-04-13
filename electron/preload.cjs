const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jotly', {
  getAppUpdateState: () => ipcRenderer.invoke('jotly:get-app-update-state'),
  checkForAppUpdates: () => ipcRenderer.invoke('jotly:check-for-app-updates'),
  downloadAppUpdate: () => ipcRenderer.invoke('jotly:download-app-update'),
  installAppUpdate: () => ipcRenderer.invoke('jotly:install-app-update'),
  onAppUpdateState: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('jotly:app-update-state', listener);
    return () => ipcRenderer.removeListener('jotly:app-update-state', listener);
  },
});
