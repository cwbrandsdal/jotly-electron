const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

const PORT = 17839;
const isDev = !app.isPackaged;
const DEV_URL = 'http://127.0.0.1:5173';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

let server = null;

function startStaticServer(root) {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
      let filePath = path.join(root, url.pathname);

      // Directory → try index.html inside it
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
      } catch {
        // file doesn't exist — SPA fallback below
      }

      // If file doesn't exist → SPA fallback to index.html
      if (!fs.existsSync(filePath)) {
        filePath = path.join(root, 'index.html');
      }

      try {
        const data = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        });
        res.end(data);
      } catch {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Static server running at http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

let mainWindow = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Jotly',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Show window when content is ready (avoids white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL(DEV_URL);
    mainWindow.webContents.openDevTools();
  } else {
    const rendererPath = path.join(app.getAppPath(), 'dist', 'renderer');
    await startStaticServer(rendererPath);
    mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (server) server.close();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
