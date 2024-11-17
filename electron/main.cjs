const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

function createWindow() {
  // Register file protocol
  protocol.registerFileProtocol("file", (request, callback) => {
    const url = request.url.replace("file:///", "");
    const decodedUrl = decodeURI(url);
    try {
      return callback(decodedUrl);
    } catch (error) {
      console.error("ERROR: registerFileProtocol : ", error);
      return callback(404);
    }
  });

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
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
            "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
          ],
        },
      });
    },
  );

  const indexPath = path.join(__dirname, "..", "build", "index.html");
  console.log("Loading:", indexPath);

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(indexPath).catch((e) => {
      console.error("Failed to load:", e);
    });
  }

  // Debug
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.log("Failed to load:", errorCode, errorDescription);
    },
  );
}

app.whenReady().then(() => {
  // Register the custom protocol
  protocol.registerFileProtocol("file", (request, callback) => {
    const filePath = request.url.replace("file://", "");
    callback({ path: path.normalize(`${__dirname}/../build/${filePath}`) });
  });

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// Handle any errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
