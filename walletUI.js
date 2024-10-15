// walletUI.js

class WalletUI {
    constructor(container, onChange, onGenerateShares) {
        this.container = container;
        this.onChange = onChange;
        this.onGenerateShares = onGenerateShares;
        this.currentDisplayMode = 'entropy'; // or 'mnemonic'
        this.isAddressListVisible = false;
        
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div id="wallet-display">
                <textarea id="wallet-data" rows="3"></textarea>
                <div id="error-display" style="color: red; display: none;"></div>
                <div class="display-toggle">
                    <button id="toggle-entropy">Show Entropy</button>
                    <button id="toggle-mnemonic">Show Mnemonic</button>
                </div>
                <div class="address-toggle">
                    <h3>Public Addresses <button id="toggle-addresses">▼</button></h3>
                </div>
                <ul id="address-list" style="display: none;"></ul>
            </div>
        `;

        this.walletDataTextarea = this.container.querySelector('#wallet-data');
        this.errorDisplay = this.container.querySelector('#error-display');
        this.addressList = this.container.querySelector('#address-list');
        this.toggleEntropyBtn = this.container.querySelector('#toggle-entropy');
        this.toggleMnemonicBtn = this.container.querySelector('#toggle-mnemonic');
        this.toggleAddressesBtn = this.container.querySelector('#toggle-addresses');

        // Shamir's Secret Sharing UI elements (already in HTML)
        this.minimumSharesInput = document.getElementById('minimum-shares');
        this.totalSharesInput = document.getElementById('total-shares');
        this.generateSharesBtn = document.getElementById('generate-shares-btn');
        this.sharesDisplay = document.getElementById('shares-display');
        this.shareList = document.getElementById('share-list');
    }

    attachEventListeners() {
        this.walletDataTextarea.addEventListener('input', () => {
            if (this.onChange) {
                this.onChange(this.currentDisplayMode, this.walletDataTextarea.value);
            }
        });

        this.toggleEntropyBtn.addEventListener('click', () => this.toggleDisplayMode('entropy'));
        this.toggleMnemonicBtn.addEventListener('click', () => this.toggleDisplayMode('mnemonic'));
        this.toggleAddressesBtn.addEventListener('click', () => this.toggleAddressList());

        this.generateSharesBtn.addEventListener('click', () => {
            const minimum = parseInt(this.minimumSharesInput.value);
            const total = parseInt(this.totalSharesInput.value);
            if (this.onGenerateShares) {
                this.onGenerateShares(minimum, total);
            }
        });
    }

    toggleDisplayMode(mode) {
        this.currentDisplayMode = mode;
        this.updateDisplay();
    }

    toggleAddressList() {
        this.isAddressListVisible = !this.isAddressListVisible;
        this.addressList.style.display = this.isAddressListVisible ? 'block' : 'none';
        this.toggleAddressesBtn.textContent = this.isAddressListVisible ? '▲' : '▼';
    }

    updateDisplay() {
        if (this.wallet) {
            this.walletDataTextarea.value = this.currentDisplayMode === 'entropy' 
                ? (this.wallet.entropy || '')
                : (this.wallet.mnemonic || '');
        }
        this.toggleEntropyBtn.disabled = this.currentDisplayMode === 'entropy';
        this.toggleMnemonicBtn.disabled = this.currentDisplayMode === 'mnemonic';
    }

    displayWallet(wallet) {
        this.wallet = wallet;
        this.updateDisplay();

        this.addressList.innerHTML = '';
        wallet.addresses.forEach((address, index) => {
            const li = document.createElement('li');
            li.textContent = `${index}: ${address}`;
            this.addressList.appendChild(li);
        });

        this.errorDisplay.style.display = 'none';
    }

    showError(message) {
        this.errorDisplay.textContent = message;
        this.errorDisplay.style.display = 'block';
    }

    clearError() {
        this.errorDisplay.style.display = 'none';
    }

    displayShares(shares) {
        this.shareList.innerHTML = '';
        shares.forEach((share, index) => {
            const li = document.createElement('li');
            li.textContent = `Share ${index + 1}: ${share}`;
            this.shareList.appendChild(li);
        });
        this.sharesDisplay.style.display = 'block';
    }
}

export default WalletUI;