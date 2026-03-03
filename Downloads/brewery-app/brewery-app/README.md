# MvndiCraft Brewery

Recipe tracker, barrel manager & brewing timers for MvndiCraft.

---

## Requirements

- **Node.js v18+** — https://nodejs.org (download the LTS version)
- **Windows 10/11 64-bit**

---

## Build Instructions

1. Extract this zip somewhere on your PC
2. Open **Command Prompt** or **PowerShell** inside the extracted folder
3. Run:

```
npm install
npm run build
```

4. When it finishes, open the `dist/` folder — you'll find **two files**:

| File | Use |
|------|-----|
| `MvndiCraft-Brewery-Setup.exe` | **Installer** — share this with others. Installs the app, adds a Start Menu + Desktop shortcut, and includes an uninstaller. |
| `MvndiCraft-Brewery-Portable.exe` | **Portable** — single EXE, no install needed. Drop it anywhere and run it. |

---

## Sharing with Others

Give people **MvndiCraft-Brewery-Setup.exe** — they just double-click, click through the wizard, done. No Node.js required on their machine.

---

## Features

- All data saved automatically and restored on relaunch
- Aging timers accurate even after the app is closed for days/weeks
- Cooking timers restored if app was closed mid-timer
- Minimizes to system tray (timers keep running in background)
- Audible alarms + system notifications on timer completion
- Single instance lock — opening a second copy brings the existing window to focus
- Settings page: reset barrels, clear brew log, or wipe all data (double confirmation)

## Data Location

`%APPDATA%\mvndicraft-brewery\`
