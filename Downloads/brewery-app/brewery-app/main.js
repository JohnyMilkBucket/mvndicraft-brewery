const { app, BrowserWindow, Notification, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

// ── Single instance lock ──────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  // Another instance is already running — quit this one immediately
  app.quit();
  process.exit(0);
}

// If a second instance tried to open, focus the existing window
app.on('second-instance', () => {
  if (win) {
    if (!win.isVisible()) win.show();
    win.focus();
  }
});
// ─────────────────────────────────────────────────────

let win;
let tray;
let isQuitting = false;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'MvndiCraft Brewery',
    backgroundColor: '#0d0a07',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Minimize to tray on close so timers keep running
  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      win.hide();
      if (tray) {
        tray.displayBalloon({
          title: 'MvndiCraft Brewery',
          content: 'Running in background — timers are still active!',
          iconType: 'info'
        });
      }
    }
  });
}

function createTray() {
  // Use a simple placeholder icon if none provided
  const iconPath = path.join(__dirname, 'assets', 'tray.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('MvndiCraft Brewery');

  const menu = Menu.buildFromTemplate([
    { label: 'Open Brewery', click: () => { win.show(); win.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
  ]);

  tray.setContextMenu(menu);
  tray.on('double-click', () => { win.show(); win.focus(); });
}

// IPC: renderer asks to send a system notification
ipcMain.on('notify', (event, title, body) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: false }).show();
  }
  // If window is hidden, bring it back to show the alarm
  if (win && !win.isVisible()) {
    win.show();
    win.focus();
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('before-quit', () => { isQuitting = true; });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else { win.show(); win.focus(); }
});
