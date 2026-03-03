const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  notify:     (title, body) => ipcRenderer.send('notify', title, body),
  quit:       ()            => ipcRenderer.send('quit-app'),
  importData:   ()            => ipcRenderer.invoke('import-data'),
  openExternal: (url)        => ipcRenderer.send('open-external', url)
});
