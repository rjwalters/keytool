import WalletUI from "./walletUI.js";

document.addEventListener("DOMContentLoaded", () => {
  let currentWallet = null;
  const walletContainer = document.getElementById("wallet-container");
  const walletUI = new WalletUI(
    walletContainer,
    handleWalletDataChange,
    handleGenerateShares,
  );

  const new128BitWalletBtn = document.querySelector(
    'button[id="new-128-bit-wallet-btn"]',
  );
  const new256BitWalletBtn = document.querySelector(
    'button[id="new-256-bit-wallet-btn"]',
  );

  if (new128BitWalletBtn) {
    new128BitWalletBtn.addEventListener("click", () => generateNewWallet(128));
  } else {
    console.error("128-bit wallet button not found");
  }

  if (new256BitWalletBtn) {
    new256BitWalletBtn.addEventListener("click", () => generateNewWallet(256));
  } else {
    console.error("256-bit wallet button not found");
  }

  async function generateNewWallet(bitStrength) {
    try {
      currentWallet = await window.electronAPI.generateWallet(bitStrength);
      console.log("Generated wallet:", currentWallet); // Debug log
      walletUI.displayWallet(currentWallet);
    } catch (error) {
      console.error("Error generating wallet:", error);
      walletUI.showError("Error generating wallet. Please try again.");
    }
  }

  async function handleWalletDataChange(mode, value) {
    try {
      if (value.trim()) {
        if (mode === "entropy") {
          currentWallet = await window.electronAPI.walletFromEntropy(value);
        } else {
          currentWallet = await window.electronAPI.walletFromMnemonic(value);
        }
        walletUI.displayWallet(currentWallet);
      }
    } catch (error) {
      console.error(`Error applying ${mode}:`, error);
      walletUI.showError(`Invalid ${mode}. Please check your input.`);
    }
  }

  async function handleGenerateShares(minimum, total) {
    if (minimum >= total || minimum < 2 || total < 3) {
      walletUI.showError(
        "Invalid share configuration. Ensure minimum is less than total and both are at least 2 and 3 respectively.",
      );
      return;
    }

    if (!currentWallet || !currentWallet.entropy) {
      walletUI.showError("Please generate or load a wallet first.");
      return;
    }

    try {
      const shares = await window.electronAPI.createShares(
        currentWallet.entropy,
        minimum,
        total,
      );

      // Convert BigInt shares to hexadecimal strings
      const hexShares = shares.map((share) => [
        share[0].toString(16).padStart(2, "0"), // Convert index to hex
        share[1].toString(16).padStart(64, "0"), // Convert share value to hex
      ]);

      walletUI.displayShares(hexShares);
    } catch (error) {
      console.error("Error generating shares:", error);
      walletUI.showError("Error generating shares. Please try again.");
    }
  }
});
