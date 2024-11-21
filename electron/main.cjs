const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "development";

// Debug environment setup
console.log("Environment Setup:", {
  NODE_ENV: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === "development",
  cwd: process.cwd(),
  dirname: __dirname,
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

function createWindow() {
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
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' file: data:",
          ],
        },
      });
    },
  );

  const indexPath = path.join(__dirname, "..", "build", "index.html");
  console.log("Current directory (__dirname):", __dirname);
  console.log("Attempting to load index from:", indexPath);

  // Check if files/directories exist
  console.log(
    "Build directory exists:",
    fs.existsSync(path.join(__dirname, "..", "build")),
  );
  console.log("index.html exists:", fs.existsSync(indexPath));

  if (isDev) {
    console.log("Development mode: Loading from localhost:5173");
    mainWindow.loadURL("http://localhost:5173");
  } else {
    const indexPath = path.join(process.cwd(), "build", "index.html");

    console.log("Production mode:", {
      loading: indexPath,
      exists: fs.existsSync(indexPath),
      buildDir: fs.readdirSync(path.join(process.cwd(), "build")),
      appDir: fs.readdirSync(
        path.join(process.cwd(), "build", "_app", "immutable"),
      ),
    });

    //mainWindow.loadURL(`file://${indexPath}`);
    mainWindow.loadFile(indexPath);
  }

  // Debug
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      console.log("Failed to load:", {
        errorCode,
        errorDescription,
        validatedURL,
        indexPath,
        currentDir: __dirname,
        cwd: process.cwd(),
        buildPath: path.join(process.cwd(), "build"),
      });
    },
  );
}

app.whenReady().then(() => {
  protocol.handle("file", (request) => {
    try {
      const requestUrl = new URL(request.url);
      let filePath = decodeURIComponent(requestUrl.pathname);

      if (filePath.startsWith("/_app/")) {
        // Handle _app resources
        filePath = path.join(
          process.cwd(),
          "build",
          filePath.replace(/^\/+/, ""),
        );
      }

      console.log("Protocol handler resolved:", {
        requestUrl: request.url,
        finalPath: filePath,
        exists: fs.existsSync(filePath),
      });

      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType =
          {
            ".js": "application/javascript",
            ".css": "text/css",
            ".html": "text/html",
            ".json": "application/json",
            ".map": "application/json",
            ".png": "image/png",
            ".ico": "image/x-icon",
            ".svg": "image/svg+xml",
          }[ext] || "application/octet-stream";

        const content = fs.readFileSync(filePath);

        /*
        // Inject base tag for HTML files
        if (contentType === "text/html") {
          content = content
            .toString("utf8")
            .replace("<head>", `<head><base href="/">`);
        }
        */

        return new Response(content, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "no-cache",
          },
        });
      }

      console.error(`File not found: ${filePath}`);

      return new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    } catch (error) {
      console.error("Protocol handler error:", error);

      return new Response(error.toString(), {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
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
