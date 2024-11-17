import {
  createShares,
  generateWallet,
  recoverWalletFromShares,
  walletFromEntropy,
  walletFromMnemonic,
  type Wallet,
} from "$utils/wallet";
import { ethers } from "ethers";

describe("Wallet Utilities", () => {
  describe("generateWallet", () => {
    it("should generate a valid wallet with default bit strength", () => {
      const wallet = generateWallet();
      expect(wallet).toHaveProperty("privateKey");
      expect(wallet).toHaveProperty("mnemonic");
      expect(wallet).toHaveProperty("addresses");
      expect(wallet).toHaveProperty("entropy");
      expect(wallet.addresses).toHaveLength(4);
      expect(wallet.entropy).toMatch(/^0x[0-9a-f]{64}$/i);
    });

    it("should generate different wallets on subsequent calls", () => {
      const wallet1 = generateWallet();
      const wallet2 = generateWallet();
      expect(wallet1.entropy).not.toEqual(wallet2.entropy);
      expect(wallet1.mnemonic).not.toEqual(wallet2.mnemonic);
    });
  });

  describe("walletFromEntropy", () => {
    it("should recreate the same wallet from entropy", () => {
      const originalWallet = generateWallet();
      const recreatedWallet = walletFromEntropy(originalWallet.entropy);
      
      expect(recreatedWallet.entropy).toEqual(originalWallet.entropy);
      expect(recreatedWallet.mnemonic).toEqual(originalWallet.mnemonic);
      expect(recreatedWallet.privateKey).toEqual(originalWallet.privateKey);
    });

    it("should accept both string and Uint8Array entropy", () => {
      const entropy = ethers.randomBytes(32);
      const walletFromBytes = walletFromEntropy(entropy);
      const walletFromString = walletFromEntropy(ethers.hexlify(entropy));
      
      expect(walletFromBytes.entropy).toEqual(walletFromString.entropy);
    });
  });

  describe("walletFromMnemonic", () => {
    it("should recreate the same wallet from mnemonic", () => {
      const originalWallet = generateWallet();
      const recreatedWallet = walletFromMnemonic(originalWallet.mnemonic);
      
      expect(recreatedWallet.entropy).toEqual(originalWallet.entropy);
      expect(recreatedWallet.mnemonic).toEqual(originalWallet.mnemonic);
      expect(recreatedWallet.privateKey).toEqual(originalWallet.privateKey);
    });

    it("should throw on invalid mnemonic", () => {
      expect(() => {
        walletFromMnemonic("not a valid mnemonic phrase");
      }).toThrow();
    });
  });

  describe("Shamir's Secret Sharing", () => {
    let wallet: Wallet;
    const minimum = 3;
    const totalShares = 5;

    beforeEach(() => {
      wallet = generateWallet();
    });

    it("should create the specified number of shares", () => {
      const shares = createShares(wallet, minimum, totalShares);
      expect(shares).toHaveLength(totalShares);
    });

    it("should recover wallet from minimum number of shares", () => {
      const shares = createShares(wallet, minimum, totalShares);
      const minShares = shares.slice(0, minimum);
      const recoveredWallet = recoverWalletFromShares(minShares);
      
      expect(recoveredWallet.entropy).toEqual(wallet.entropy);
      expect(recoveredWallet.mnemonic).toEqual(wallet.mnemonic);
    });

    it("should recover wallet from different combinations of shares", () => {
      const shares = createShares(wallet, minimum, totalShares);
      
      // Test different combinations
      const combinations = [
        shares.slice(0, minimum),
        shares.slice(1, minimum + 1),
        shares.slice(2, minimum + 2),
      ];

      combinations.forEach(shareSet => {
        const recoveredWallet = recoverWalletFromShares(shareSet);
        expect(recoveredWallet.entropy).toEqual(wallet.entropy);
      });
    });

    it("should throw error when using insufficient shares", () => {
      const shares = createShares(wallet, minimum, totalShares);
      const insufficientShares = shares.slice(0, minimum - 1);
      
      expect(() => {
        recoverWalletFromShares(insufficientShares);
      }).toThrow("need at least three shares");
    });

    it("should throw error when minimum exceeds total shares", () => {
      expect(() => {
        createShares(wallet, 6, 5);
      }).toThrow("Pool secret would be irrecoverable");
    });


    it("should handle entropy values with leading zeros", () => {
      // Create a wallet with entropy that has leading zeros
      const entropy = "0x00" + "f".repeat(62);
      const testWallet = walletFromEntropy(entropy);
      
      // Create and recover shares
      const shares = createShares(testWallet, minimum, totalShares);
      const recoveredWallet = recoverWalletFromShares(shares.slice(0, minimum));
      
      expect(recoveredWallet.entropy).toEqual(testWallet.entropy);
      expect(recoveredWallet.mnemonic).toEqual(testWallet.mnemonic);
    });

    it("should handle entropy values with all possible hex characters", () => {
      // Test a range of entropy values
      for (let i = 0; i < 5; i++) {
        const wallet = generateWallet();
        const shares = createShares(wallet, minimum, totalShares);
        const recoveredWallet = recoverWalletFromShares(shares.slice(0, minimum));
        
        expect(recoveredWallet.entropy).toEqual(wallet.entropy);
        expect(recoveredWallet.mnemonic).toEqual(wallet.mnemonic);
      }
    });

  });
});