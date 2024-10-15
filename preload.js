const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    generateWallet: (bitStrength) => ipcRenderer.invoke('generate-wallet', bitStrength),
    walletFromEntropy: (entropy) => ipcRenderer.invoke('wallet-from-entropy', entropy),
    walletFromMnemonic: (mnemonic) => ipcRenderer.invoke('wallet-from-mnemonic', mnemonic),
    createShares: (entropy, minimum, shares) => ipcRenderer.invoke('create-shares', entropy, minimum, shares),
    recoverWalletFromShares: (shares) => ipcRenderer.invoke('recover-wallet-from-shares', shares)
});
