import { app, BrowserWindow } from "electron";
import serve from "electron-serve";
import squirrelStartup from "electron-squirrel-startup";

const isDev = process.env.NODE_ENV === "development";
const loadURL = serve({ directory: "build" });

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
