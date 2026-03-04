const { app, BrowserWindow, Notification, ipcMain, Tray, Menu, nativeImage, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }
app.on('second-instance', () => { if (win) { if (!win.isVisible()) win.show(); win.focus(); } });

let win, tray;

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    title: 'MvndiCraft Brewery',
    backgroundColor: '#0d0a07',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Auto-import mvndi-data.json from Downloads on first load
  win.webContents.on('did-finish-load', () => checkForDataImport());

  win.on('close', () => app.quit());
}

// ── Auto-import from browser export ──────────────────
function checkForDataImport() {
  const dataFile = path.join(os.homedir(), 'Downloads', 'mvndi-data.json');
  if (!fs.existsSync(dataFile)) return;

  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    win.webContents.executeJavaScript(`localStorage.getItem('mvndi_username')`)
      .then(existing => {
        if (existing) {
          const choice = dialog.showMessageBoxSync(win, {
            type: 'question',
            buttons: ['Import & Overwrite', 'Skip'],
            defaultId: 1,
            title: 'MvndiCraft Brewery — Import Data',
            message: 'Found your browser data (mvndi-data.json)',
            detail: `You already have brewery data saved. Import from browser and overwrite it?`
          });
          if (choice !== 0) return;
        }
        applyImport(data, dataFile);
      });
  } catch(e) {
    console.log('Could not read mvndi-data.json:', e.message);
  }
}

function applyImport(data, filePath) {
  const js = Object.entries(data)
    .map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(v)})`)
    .join(';');

  win.webContents.executeJavaScript(js + '; location.reload();')
    .then(() => {
      try { fs.unlinkSync(filePath); } catch(e) {}
    });
}

// ── Manual import via file picker ────────────────────
ipcMain.handle('import-data', async () => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Import Brewery Data',
    defaultPath: path.join(os.homedir(), 'Downloads', 'mvndi-data.json'),
    filters: [{ name: 'MvndiCraft Data', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (result.canceled || !result.filePaths.length) return null;
  try { return JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8')); }
  catch(e) { return null; }
});

// ── Tray ─────────────────────────────────────────────
function createTray() {
  let icon;
  try { icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png')); }
  catch { icon = nativeImage.createEmpty(); }

  tray = new Tray(icon);
  tray.setToolTip('MvndiCraft Brewery');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Brewery', click: () => { win.show(); win.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]));
  tray.on('double-click', () => { win.show(); win.focus(); });
}

// ── IPC ──────────────────────────────────────────────
ipcMain.on('quit-app', () => app.quit());
ipcMain.on('notify', (_, title, body) => {
  if (Notification.isSupported()) new Notification({ title, body }).show();
  if (win && !win.isVisible()) { win.show(); win.focus(); }
});

// Open external links in real browser, not Electron window
ipcMain.on('open-external', (_, url) => shell.openExternal(url));

// ── Boot ─────────────────────────────────────────────
app.whenReady().then(() => { createWindow(); createTray(); });
app.on('window-all-closed', () => app.quit());
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else { win.show(); win.focus(); }
});