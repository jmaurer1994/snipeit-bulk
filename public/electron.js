const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const config = require('electron-json-config').factory();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900, 
        height: 680,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            webSecurity: false
        } });
        
    mainWindow.loadURL(isDev ? "http://localhost:3000": 
        `file://${path.join(__dirname, "../build/index.html")}`);

    mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// End of the file
ipcMain.on('GET_DATA', (event, args) => {
    if (args.message === 'initial') {
        event.sender.send('GET_DATA', { api_key: config.get('api_key'), base_url: config.get('base_url') });

        console.log("Got Config")
    }

    if (args.message === 'update') {
        config.set('api_key', args.api_key)
        config.set('base_url', args.base_url)
        console.log("Set Config")
    }
});