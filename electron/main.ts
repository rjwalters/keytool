import {
  app,
  BrowserWindow,
  Menu,
  type MenuItemConstructorOptions,
} from "electron";
import serve from "electron-serve";
import squirrelStartup from "electron-squirrel-startup";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const isDev = process.env.NODE_ENV === "development";
const loadURL = serve({ directory: "build" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Only use electron-squirrel-startup in production on Windows
if (process.platform === "win32" && !isDev) {
  try {
    if (squirrelStartup) {
      app.quit();
    }
  } catch (e) {
    console.log("Not running in Squirrel mode");
  }
}

app.setAboutPanelOptions({
  applicationName: "KeyTool",
  applicationVersion: app.getVersion(),
  copyright: "© 2024 Robb Walters",
  website: "https://github.com/rjwalters/keytool",
  iconPath:
    process.platform === "darwin"
      ? join(__dirname, "../icons/icons.icns") // Use .icns for macOS
      : join(__dirname, "../icons/icon.png"), // Use .png for other platforms
  credits: "Built with Electron and SvelteKit",
});

const template: MenuItemConstructorOptions[] = [
  {
    label: "KeyTool",
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  },
  {
    label: "File",
    submenu: [{ role: "close" }],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { role: "togglefullscreen" },
      { type: "separator" },
      { role: "reload" },
      ...(process.env.NODE_ENV === "development"
        ? ([
            { role: "toggleDevTools" },
            { role: "forceReload" },
          ] as MenuItemConstructorOptions[])
        : []),
    ] as MenuItemConstructorOptions[],
  },
];

// Add this before creating your BrowserWindow
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
    },
  });

  // Set CSP headers
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' file: data:",
          ],
        },
      });
    },
  );

  // In development, use Vite's dev server
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    // In production, load from the built files
    loadURL(mainWindow);
  }
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
