const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const wallet = require('./wallet.js');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    })

    // Set Content Security Policy
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ["default-src 'self'; style-src 'self' 'unsafe-inline';"]
            }
        })
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('generate-wallet', async (event, bitStrength) => {
    return wallet.generateWallet(bitStrength);
});

ipcMain.handle('wallet-from-private-key', async (event, privateKey) => {
    return wallet.walletFromPrivateKey(privateKey);
});

ipcMain.handle('wallet-from-mnemonic', async (event, mnemonic) => {
    return wallet.walletFromMnemonic(mnemonic);
});

ipcMain.handle('wallet-from-entropy', async (event, entropy) => {
    return wallet.walletFromEntropy(entropy);
});

ipcMain.handle('create-shares', async (event, entropy, minimum, shares) => {
    const walletData = wallet.walletFromEntropy(entropy);
    return wallet.createShares(walletData, minimum, shares);
});

ipcMain.handle('recover-wallet-from-shares', async (event, shares) => {
    return wallet.recoverWalletFromShares(shares);
});