import {
  createIndexedShares,
  createShares,
  generateWallet,
  recoverShareIndex,
  recoverWalletFromIndexedShares,
  recoverWalletFromShares,
  shareValueToEntropyHex,
  walletFromEntropy,
  walletFromMnemonic,
  type ShamirShare,
  type Wallet,
} from "$utils/wallet";
import { ethers } from "ethers";

describe("Wallet Utilities", () => {
  const TEST_ENTROPY = "0x" + "1".repeat(64);
  const KNOWN_MNEMONIC =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
  const isValidAddress = (address: string) =>
    /^0x[0-9a-fA-F]{40}$/.test(address);
  const isValidPrivateKey = (key: string) => /^0x[0-9a-fA-F]{64}$/.test(key);

  describe("Wallet Generation", () => {
    describe("generateWallet", () => {
      it("should generate unique wallets on each call", () => {
        const wallet1 = generateWallet();
        const wallet2 = generateWallet();
        expect(wallet1.entropy).not.toBe(wallet2.entropy);
        expect(wallet1.privateKey).not.toBe(wallet2.privateKey);
      });

      it("should generate cryptographically secure entropy", () => {
        const wallets = Array.from({ length: 100 }, () => generateWallet());
        const entropyValues = new Set(wallets.map((w) => w.entropy));
        expect(entropyValues.size).toBe(100);
      });

      it("should generate valid wallet with default settings", () => {
        const wallet = generateWallet();
        expect(isValidPrivateKey(wallet.privateKey)).toBe(true);
        expect(wallet.mnemonic.split(" ")).toHaveLength(24);
        expect(wallet.entropy).toMatch(/^0x[0-9a-f]{64}$/i);
        expect(wallet.addresses).toHaveLength(4);
        expect(wallet.addresses.every(isValidAddress)).toBe(true);
      });

      it.each([
        [128, 32, 12],
        [256, 64, 24],
      ])("should handle %i bits correctly", (bits, entropyChars, words) => {
        const wallet = generateWallet(bits);
        expect(wallet.entropy).toMatch(
          new RegExp(`^0x[0-9a-f]{${entropyChars}}$`, "i"),
        );
        expect(wallet.mnemonic.split(" ")).toHaveLength(words);
        expect(isValidPrivateKey(wallet.privateKey)).toBe(true);
      });

      it.each([
        [100, "Not multiple of 32"],
        [512, "Too large"],
        [-256, "Negative"],
        [0, "Invalid"],
        [NaN, "Invalid"],
      ])("should reject invalid bit strength: %i", (bits) => {
        expect(() => generateWallet(bits)).toThrow();
      });
    });

    describe("walletFromEntropy", () => {
      it("should be deterministic", () => {
        const wallet1 = walletFromEntropy(TEST_ENTROPY);
        const wallet2 = walletFromEntropy(TEST_ENTROPY);
        expect(wallet1).toEqual(wallet2);
      });

      it("should preserve entropy through conversion cycles", () => {
        const originalWallet = generateWallet();
        const recoveredWallet = walletFromEntropy(originalWallet.entropy);
        expect(recoveredWallet.entropy).toBe(originalWallet.entropy);
      });

      it("should handle valid entropy formats", () => {
        const entropyBytes = ethers.randomBytes(32);
        const walletFromBytes = walletFromEntropy(entropyBytes);
        const walletFromString = walletFromEntropy(
          ethers.hexlify(entropyBytes),
        );

        expect(walletFromBytes.entropy).toEqual(walletFromString.entropy);
        expect(walletFromBytes.privateKey).toEqual(walletFromString.privateKey);
      });

      it.each([
        [16, 128], // 16 bytes = 128 bits
        [32, 256], // 32 bytes = 256 bits
      ])("should accept %i byte entropy (%i bits)", (bytes, bits) => {
        const entropy = new Uint8Array(bytes);
        entropy.fill(1);
        expect(() => walletFromEntropy(entropy)).not.toThrow();
      });

      it.each([
        [8, "too short"],
        [24, "invalid length"],
        [48, "too long"],
      ])("should reject %i byte entropy", (bytes, desc) => {
        const entropy = new Uint8Array(bytes);
        entropy.fill(1);
        expect(() => walletFromEntropy(entropy)).toThrow();
      });

      it.each<[any, string]>([
        ["not hex", "Invalid hex string"],
        ["0x123", "Invalid length"],
        ["0xgg" + "0".repeat(62), "Invalid hex"],
        [null, "Invalid entropy"],
        [undefined, "Invalid entropy"],
        [{}, "Invalid entropy"],
        [[], "Invalid entropy"],
        ["0x" + "g".repeat(64), "Invalid hex"],
        [new Uint8Array(64), "Invalid length"],
      ])("should reject invalid entropy: %s", (entropy, desc) => {
        expect(() => walletFromEntropy(entropy)).toThrow();
      });
    });

    describe("walletFromMnemonic", () => {
      it("should handle excess whitespace", () => {
        const messyMnemonic = `  ${KNOWN_MNEMONIC}  `;
        const wallet = walletFromMnemonic(messyMnemonic.trim());
        expect(wallet.mnemonic).toBe(KNOWN_MNEMONIC);
      });

      it("should preserve exact mnemonic case", () => {
        const mixedCaseMnemonic =
          "Abandon ABANDON abandon abandon ABANDON abandon abandon abandon abandon abandon abandon about";
        const wallet = walletFromMnemonic(mixedCaseMnemonic);
        // BIP39 implementations typically normalize to lowercase
        expect(wallet.mnemonic.toLowerCase()).toBe(KNOWN_MNEMONIC);
      });

      it("should reject non-BIP39 words", () => {
        const invalidMnemonic = KNOWN_MNEMONIC.replace("abandon", "invalid");
        expect(() => walletFromMnemonic(invalidMnemonic)).toThrow();
      });

      it("should validate mnemonic integrity", () => {
        const validMnemonic = KNOWN_MNEMONIC;
        const invalidChecksum = validMnemonic.replace("about", "wrong");

        expect(() => walletFromMnemonic(validMnemonic)).not.toThrow();
        expect(() => walletFromMnemonic(invalidChecksum)).toThrow();
      });

      it.each([9, 15, 18, 21])("should reject %i word mnemonic", (length) => {
        const phrase = Array(length).fill("abandon").join(" ");
        expect(() => walletFromMnemonic(phrase)).toThrow();
      });
    });
  });

  describe("Address Generation", () => {
    let wallet: Wallet;

    beforeEach(() => {
      wallet = walletFromMnemonic(KNOWN_MNEMONIC);
    });

    it("should generate deterministic HD paths", () => {
      const rootNode = ethers.HDNodeWallet.fromPhrase(wallet.mnemonic);
      wallet.addresses.forEach((address, i) => {
        const derivedPath = `44'/60'/0'/0/${i}`;
        const derivedAddress = rootNode.derivePath(derivedPath).address;
        expect(address).toBe(derivedAddress);
      });
    });

    it("should enforce checksum and uniqueness", () => {
      const addresses = wallet.addresses;
      expect(new Set(addresses).size).toBe(addresses.length);
      addresses.forEach((address) => {
        expect(address).toBe(ethers.getAddress(address));
        expect(isValidAddress(address)).toBe(true);
      });
    });
  });

  describe("Secret Sharing", () => {
    const minimum = 3;
    const total = 5;
    let wallet: Wallet;
    let shares: ShamirShare[];

    beforeEach(() => {
      wallet = walletFromEntropy(TEST_ENTROPY);
      shares = createShares(wallet, minimum, total);
    });

    describe("share creation", () => {
      it.each([
        [3, 5],
        [2, 4],
        [5, 7],
        [3, 10],
      ])("should create valid %i of %i shares", (min, total) => {
        const shares = createShares(wallet, min, total);
        expect(shares).toHaveLength(total);
        shares.forEach((share) => {
          expect(share).toHaveLength(2);
          expect(typeof share[0]).toBe("bigint");
          expect(typeof share[1]).toBe("bigint");
        });
      });

      it.each([128, 256])(
        "should preserve bit length for %i bit entropy",
        (bits) => {
          const wallet = generateWallet(bits);
          const shares = createShares(wallet, minimum, total);

          shares.forEach((share) => {
            const hex = shareValueToEntropyHex(share[1]);
            expect(hex.slice(2).length).toBeLessThanOrEqual(bits / 4);
          });
        },
      );
    });

    describe("recovery", () => {
      it("should recover from minimum shares", () => {
        for (let i = 0; i <= total - minimum; i++) {
          const shareSet = shares.slice(i, i + minimum);
          const recovered = recoverWalletFromShares(minimum, shareSet);
          expect(recovered.entropy).toBe(wallet.entropy);
        }
      });
    });

    it("should maintain security with insufficient shares", () => {
      const subset = shares.slice(0, minimum - 1);
      const recoveredEntropies = new Set();

      for (let i = 0; i < 10; i++) {
        try {
          const recovered = recoverWalletFromShares(minimum, subset);
          recoveredEntropies.add(recovered.entropy);
        } catch (e) {}
      }
      expect(recoveredEntropies.has(wallet.entropy)).toBe(false);
    });

    it("should handle share reordering", () => {
      const shuffled = [...shares].sort(() => Math.random() - 0.5);
      const recovered = recoverWalletFromShares(minimum, shuffled);
      expect(recovered.entropy).toBe(wallet.entropy);
    });

    it("should reject shares from different polynomials", () => {
      const otherShares = createShares(generateWallet(), 3, 5);
      const mixedShares = [...shares.slice(0, 2), otherShares[0]];
      expect(() => recoverWalletFromShares(minimum, mixedShares)).toThrow();
    });

    it("should handle maximum valid entropy", () => {
      const maxEntropy = "0x" + "f".repeat(64);
      const maxWallet = walletFromEntropy(maxEntropy);
      const maxShares = createShares(maxWallet, 3, 5);
      const recovered = recoverWalletFromShares(minimum, maxShares.slice(0, 3));
      expect(recovered.entropy).toBe(maxEntropy);
    });

    it("should handle minimum valid entropy", () => {
      const minEntropy = "0x" + "0".repeat(31) + "1";
      const minWallet = walletFromEntropy(minEntropy);
      const minShares = createShares(minWallet, 3, 5);
      const recovered = recoverWalletFromShares(minimum, minShares.slice(0, 3));
      expect(recovered.entropy).toBe(minEntropy);
    });

    describe("error handling", () => {
      it("should validate share format strictly", () => {
        const invalidShares = [
          [1n, 2n, 3n], // Wrong tuple size
          ["1", "2"], // Wrong types
          [1n], // Incomplete share
        ];

        invalidShares.forEach((invalid) => {
          expect(() =>
            recoverWalletFromShares(minimum, [invalid as ShamirShare]),
          ).toThrow();
        });
      });
    });

    describe("integration", () => {
      it("should round-trip through indexed shares correctly", () => {
        // Test with both 128 and 256 bit entropy
        const entropySizes = [
          { entropy: "0x" + "1".repeat(32), description: "128-bit" },
          { entropy: "0x" + "1".repeat(64), description: "256-bit" },
        ];

        entropySizes.forEach(({ entropy, description }) => {
          const originalWallet = walletFromEntropy(entropy);
          const shares = createShares(originalWallet, 3, 5);
          const recoveredWallet = recoverWalletFromShares(
            minimum,
            shares.slice(0, 3),
          );

          expect(recoveredWallet.entropy).toBe(originalWallet.entropy);
          expect(recoveredWallet.privateKey).toBe(originalWallet.privateKey);
          expect(recoveredWallet.mnemonic).toBe(originalWallet.mnemonic);
          expect(recoveredWallet.addresses).toEqual(originalWallet.addresses);
        });
      });
    });
  });

  describe("shareValueToEntropyHex", () => {
    it.each([
      [0n, "0x" + "0".repeat(32)],
      [1n, "0x" + "0".repeat(31) + "1"],
      [BigInt("0x" + "f".repeat(32)), "0x" + "f".repeat(32)],
      [BigInt("0x" + "f".repeat(64)), "0x" + "f".repeat(64)],
    ])("should format %s correctly", (input, expected) => {
      expect(shareValueToEntropyHex(input)).toBe(expected);
    });

    it("should reject negative values", () => {
      expect(() => shareValueToEntropyHex(-1n)).toThrow();
    });
  });

  describe("Indexed Shares", () => {
    const TEST_ENTROPY = "0x" + "1".repeat(64);
    const wallet = walletFromEntropy(TEST_ENTROPY);

    describe("createIndexedShares", () => {
      it("should create shares with indices encoded in high bits", () => {
        const minimum = 3;
        const total = 5;
        const shares = createIndexedShares(wallet, minimum, total);

        expect(shares).toHaveLength(total);
        shares.forEach((share) => {
          expect(recoverShareIndex(share) == share[0]);
        });
      });

      it("should handle 128-bit entropy", () => {
        const shorter_entropy = "0x" + "1".repeat(32);
        const smallerWallet = walletFromEntropy(shorter_entropy);
        const shares = createIndexedShares(smallerWallet, 3, 5);

        shares.forEach((share, index) => {
          expect(recoverShareIndex(share) == share[0]);
          // Verify y-value doesn't exceed 128 bits
          const yHex = share[1].toString(16);
          expect(yHex.length).toBeLessThanOrEqual(32);
        });
      });

      // Create arrays of minimum and total shares
      const minShares = [2, 3, 4, 5];
      const totalShares = [2, 3, 4, 5, 6, 7, 8];

      // Generate outer product where minimum <= total
      const testCases = minShares.flatMap((min) =>
        totalShares
          .filter((total) => min <= total)
          .filter((total) => total <= 7) // computing eight indexed shares takes 60 seconds!
          .map((total) => [min, total] as [number, number]),
      );

      it.each(testCases)(
        "should create valid %i of %i indexed shares",
        (minimum, total) => {
          const shares = createIndexedShares(wallet, minimum, total);
          expect(shares).toHaveLength(total);
          shares.forEach((share, i) => {
            expect(share).toHaveLength(2);
            expect(typeof share[0]).toBe("bigint");
            expect(typeof share[1]).toBe("bigint");
            expect(recoverShareIndex(share) == share[0]);
          });
        },
      );

      it("should reliably generate indexed shares for 100 random wallets", () => {
        for (let i = 0; i < 100; i++) {
          const wallet = generateWallet();
          const minimum = 2;
          const total = 3;

          // Generate and verify indexed shares
          const shares = createIndexedShares(wallet, minimum, total);

          // Basic share validation
          expect(shares).toHaveLength(total);

          // Verify each share's properties
          shares.forEach((share, index) => {
            // Structure checks
            expect(share).toHaveLength(2);
            expect(typeof share[0]).toBe("bigint");
            expect(typeof share[1]).toBe("bigint");

            // Index encoding check
            expect(recoverShareIndex(share)).toBe(share[0]);
          });

          // Verify reconstruction works
          const recoveredWallet = recoverWalletFromIndexedShares(
            minimum,
            shares.slice(0, minimum),
          );
          expect(recoveredWallet.entropy).toBe(wallet.entropy);
        }
      });

      it("should reject invalid parameters", () => {
        expect(() => createIndexedShares(wallet, 4, 3)).toThrow(
          "Pool secret would be irrecoverable",
        );
        expect(() => createIndexedShares(wallet, 0, 5)).toThrow(
          "Required shares must be >= 2",
        );
        expect(() => createIndexedShares(wallet, -1, 5)).toThrow(
          "Required shares must be >= 2",
        );
        expect(() => createIndexedShares(wallet, 3, 0)).toThrow(
          "Pool secret would be irrecoverable",
        );
      });
    });

    describe("recoverWalletFromIndexedShares", () => {
      const minimum = 3;
      const total = 5;
      let indexedShares: ShamirShare[];

      beforeEach(() => {
        indexedShares = createIndexedShares(wallet, minimum, total);
      });

      it("should recover wallet from minimum indexed shares", () => {
        const subset = indexedShares.slice(0, minimum);
        const recovered = recoverWalletFromIndexedShares(minimum, subset);
        expect(recovered.entropy).toBe(wallet.entropy);
      });

      it("should recover wallet with shuffled shares", () => {
        const shuffled = [...indexedShares]
          .slice(0, minimum)
          .sort(() => Math.random() - 0.5);

        const recovered = recoverWalletFromIndexedShares(minimum, shuffled);
        expect(recovered.entropy).toBe(wallet.entropy);
      });

      it("should handle maximum valid entropy", () => {
        const maxEntropy = "0x" + "f".repeat(64);
        const maxWallet = walletFromEntropy(maxEntropy);
        const maxShares = createIndexedShares(maxWallet, 3, 5);
        const recovered = recoverWalletFromIndexedShares(
          minimum,
          maxShares.slice(0, 3),
        );
        expect(recovered.entropy).toBe(maxEntropy);
      });

      it("should maintain security with insufficient shares", () => {
        const insufficientShares = indexedShares.slice(0, minimum - 1);
        expect(() =>
          recoverWalletFromIndexedShares(minimum, insufficientShares),
        ).toThrow();
      });

      it("should reject empty share arrays", () => {
        expect(() => recoverWalletFromIndexedShares(minimum, [])).toThrow(
          "Invalid shares: empty array",
        );
      });

      it("should reject malformed shares", () => {
        const invalidInputs = [
          null,
          undefined,
          "not an array",
          [["not", "bigints"]],
          [[1n, 2n, 3n]], // Wrong tuple size
        ];

        invalidInputs.forEach((invalid) => {
          expect(() =>
            recoverWalletFromIndexedShares(minimum, invalid as any),
          ).toThrow();
        });
      });
    });

    describe("integration", () => {
      it("should round-trip through indexed shares correctly", () => {
        const minimum = 3;
        const total = 5;

        // Test with both 128 and 256 bit entropy
        const entropySizes = [
          { entropy: "0x" + "1".repeat(32), description: "128-bit" },
          { entropy: "0x" + "1".repeat(64), description: "256-bit" },
        ];

        entropySizes.forEach(({ entropy, description }) => {
          const originalWallet = walletFromEntropy(entropy);
          const shares = createIndexedShares(originalWallet, minimum, total);
          const recoveredWallet = recoverWalletFromIndexedShares(
            minimum,
            shares.slice(0, 3),
          );

          expect(recoveredWallet.entropy).toBe(originalWallet.entropy);
          expect(recoveredWallet.privateKey).toBe(originalWallet.privateKey);
          expect(recoveredWallet.mnemonic).toBe(originalWallet.mnemonic);
          expect(recoveredWallet.addresses).toEqual(originalWallet.addresses);
        });
      });
    });
  });
});
