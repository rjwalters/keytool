import { ethers, HDNodeWallet, Mnemonic } from "ethers";

/**
 * Interface representing a cryptocurrency wallet with extended properties
 */
interface Wallet {
  privateKey: string; // The wallet's private key (32 bytes / 256 bits) in hex format
  addresses: string[]; // List of derived Ethereum addresses (20 bytes / 160 bits)
  mnemonic: string; // The wallet's entropy as a BIP39 mnemonic phrase (12 or 24 words)
  entropy: string; // The wallet's entropy as a 16 or 32-byte hex value
}

enum EntropyBitLength {
  bits128 = 128,
  bits256 = 256,
}

/**
 * Converts a BigInt value to a properly formatted entropy hex string
 * Automatically pads to either 16 or 32 bytes based on value size
 * @param value BigInt to convert
 * @returns Hex string starting with "0x" padded to appropriate length
 */
function toEntropyHex(value: bigint): string {
  if (value < 0n) {
    throw new Error("Entropy value must be positive");
  }
  const bitLength = value.toString(2).length;
  const targetLength = bitLength <= 128 ? 32 : 64;
  const hexString = value.toString(16);
  return `0x${hexString.padStart(targetLength, "0")}`;
}

/**
 * Class representing a point in the finite field for Shamir's Secret Sharing
 */
class ShamirShare {
  constructor(
    private readonly _index: number = 0,
    public readonly value: bigint = BigInt("0x0"),
    public readonly isIndexed: boolean = false,
  ) {}

  /**
   * Factory method to create a ShamirShare with optional parameters
   * @param shareIndex - Optional index value
   * @param shareEntropy - Optional entropy value as string
   * @param isIndexed - Optional boolean flag
   * @returns A new ShamirShare instance
   */
  static create(
    shareIndex?: number,
    shareEntropy?: string,
    isIndexed?: boolean,
  ): ShamirShare {
    return new ShamirShare(
      shareIndex ?? 0,
      BigInt(shareEntropy || "0x0"),
      isIndexed ?? false,
    );
  }

  get index(): number {
    if (this.isIndexed) {
      return Number(this.value & 0xffn);
    }
    return this._index;
  }

  get entropyHex(): string {
    return toEntropyHex(this.value);
  }

  /**
   * Returns a string representation of the share
   * Format: "Share(index: X, value: 0x..., indexed: true/false)"
   */
  toString(): string {
    return `Share(index: ${this.index}, value: ${this.entropyHex}, indexed: ${this.isIndexed})`;
  }
}

/**
 * Prime field modulus used for Shamir's Secret Sharing
 * Equal to 2^256 + 297, chosen to be larger than any possible 32-byte number
 * This ensures no bias when generating random coefficients
 *
 * https://en.wikipedia.org/wiki/Shamir's_secret_sharing
 * https://crypto.stackexchange.com/questions/107015/is-2256-297-safe-to-use-as-modulus-in-shamir-secret-sharing
 *
 */
const PRIME_128 = ethers.toBigInt(2) ** 128n + 51n;
const PRIME_256 = ethers.toBigInt(2) ** 256n + 297n;

/**
 * Validates entropy input for wallet generation
 * Accepts 16 or 32 bytes of entropy in hex string or Uint8Array format
 * Ensures input is within valid prime field range
 */
function validateEntropyValue(
  entropy: unknown,
): asserts entropy is string | Uint8Array {
  if (entropy === null || entropy === undefined) {
    throw new Error("Invalid entropy: null or undefined");
  }
  if (typeof entropy === "string") {
    if (!entropy.startsWith("0x")) {
      throw new Error("Invalid entropy: string must start with 0x");
    }
    if (!/^0x[0-9a-fA-F]+$/.test(entropy)) {
      throw new Error("Invalid entropy: invalid hex characters");
    }
    const byteLength = (entropy.length - 2) / 2;
    if (byteLength !== 16 && byteLength !== 32) {
      throw new Error("Invalid entropy: must be 16 or 32 bytes");
    }
  } else if (entropy instanceof Uint8Array) {
    if (entropy.length !== 16 && entropy.length !== 32) {
      throw new Error("Invalid entropy: must be 16 or 32 bytes");
    }
  } else {
    throw new Error("Invalid entropy: must be hex string or Uint8Array");
  }
}

/**
 * Validates a set of secret shares for reconstruction
 * Checks format, types, and uniqueness of share coordinates
 */
function validateShares(shares: ShamirShare[]): void {
  if (!Array.isArray(shares)) {
    throw new Error("Invalid shares: must be an array");
  }

  if (shares.length === 0) {
    throw new Error("Invalid shares: empty array");
  }

  // Validate individual shares
  shares.forEach((share, i) => {
    if (!(share instanceof ShamirShare)) {
      throw new Error(
        `Invalid share at index ${i}: not a ShamirShare instance`,
      );
    }

    if (typeof share.value !== "bigint") {
      throw new Error(`Invalid share at index ${i}: value must be bigint`);
    }

    if (typeof share.index !== "number") {
      throw new Error(`Invalid share at index ${i}: index must be number`);
    }
  });

  // Check for unique x coordinates
  const xCoords = new Set(shares.map((share) => share.index));
  if (xCoords.size !== shares.length) {
    throw new Error("points must be distinct");
  }
}

/**
 * Creates a wallet from entropy input
 * Generates mnemonic and derives addresses using BIP44 paths
 */
function walletFromEntropy(entropy: unknown): Wallet {
  try {
    validateEntropyValue(entropy);
    const mnemonic = Mnemonic.fromEntropy(entropy);
    const hdNode = HDNodeWallet.fromMnemonic(mnemonic);
    return walletToObject(hdNode);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Invalid entropy");
  }
}

/**
 * Creates Shamir secret shares from a wallet's entropy
 * Uses polynomial interpolation in prime field for security
 * @param wallet Source wallet to share
 * @param minimum Number of shares required for reconstruction
 * @param shares Total number of shares to generate
 * @returns Array of [x,y] coordinate pairs in prime field
 */
function createShares(
  wallet: Wallet,
  minimum: number,
  shares: number,
): ShamirShare[] {
  if (minimum > shares) {
    throw new Error("Pool secret would be irrecoverable.");
  }
  const entropyHex = wallet.entropy.startsWith("0x")
    ? wallet.entropy.slice(2)
    : wallet.entropy;

  const shareBitLength =
    entropyHex.length <= 32
      ? EntropyBitLength.bits128
      : EntropyBitLength.bits256;

  const secret = ethers.toBigInt("0x" + entropyHex);

  return makeRandomShares(secret, minimum, shares, shareBitLength);
}

/**
 * Recovers a wallet from a set of Shamir secret shares
 * Uses Lagrange interpolation to reconstruct the secret
 * @param shares Array of shares, length must be >= minimum required
 * @returns Reconstructed wallet
 * @throws If shares are invalid or insufficient
 */
function recoverWalletFromShares(
  requiredShares: number,
  shares: ShamirShare[],
): Wallet {
  validateShares(shares);

  if (shares.length < requiredShares) {
    throw new Error(`Need at least ${requiredShares} shares for recovery`);
  }

  const xs = shares.map((share) => BigInt(share.index));
  const ys = shares.map((share) => share.value);

  // Check if all shares are 128-bit by examining their y-values
  const is128Bit = shares.every((share) => {
    const yHex = share.value.toString(16);
    return yHex.length <= 32;
  });
  const prime = is128Bit ? PRIME_128 : PRIME_256;

  const recoveredSecret = lagrangeInterpolate(0n, xs, ys, prime);
  return walletFromEntropy(toEntropyHex(recoveredSecret));
}

/**
 * Generates 160-bit Ethereum wallet addresses using BIP44 paths
 * Default derivation path: m/44'/60'/0'/0/i
 */
function generateAddresses(hdNode: HDNodeWallet, count: number = 4): string[] {
  const addresses: string[] = [];
  for (let i = 0; i < count; i++) {
    // Use the derivePath method directly with the same path format as the test
    const derivedWallet = hdNode.derivePath(`44'/60'/0'/0/${i}`);
    addresses.push(derivedWallet.address);
  }
  return addresses;
}

function walletToObject(hdNode: HDNodeWallet): Wallet {
  return {
    privateKey: hdNode.privateKey,
    mnemonic: hdNode.mnemonic!.phrase,
    addresses: generateAddresses(hdNode),
    entropy: ethers.hexlify(hdNode.mnemonic!.entropy),
  };
}

function generateWallet(bitStrength: number = 256): Wallet {
  const entropy = ethers.randomBytes(bitStrength / 8);
  return walletFromEntropy(entropy);
}

function walletFromMnemonic(mnemonicPhrase: string): Wallet {
  const hdNode = HDNodeWallet.fromPhrase(mnemonicPhrase);
  return walletToObject(hdNode);
}

function randomBytes(bytes: number): bigint {
  return ethers.toBigInt(ethers.hexlify(ethers.randomBytes(bytes)));
}

/**
 * Evaluates a polynomial at point x in the prime field
 * Used internally for share generation
 */
function evalAt(poly: bigint[], x: bigint, prime: bigint): bigint {
  let accum = 0n;
  for (let i = poly.length - 1; i >= 0; i--) {
    accum = (accum * x + poly[i]) % prime;
    if (accum < 0n) accum += prime;
  }
  return accum;
}

/**
 * Creates random polynomial coefficients and generates shares
 * Coefficients are uniformly random
 * X coordinates are consecutive integers starting at 1
 */
function makeRandomShares(
  secret: bigint,
  minimum: number,
  shares: number,
  bitLength: EntropyBitLength,
): ShamirShare[] {
  if (minimum < 2) {
    throw new Error("Required shares must be >= 2");
  }

  if (minimum > shares) {
    throw new Error("Pool secret would be irrecoverable.");
  }

  const params =
    bitLength === EntropyBitLength.bits128
      ? { prime: PRIME_128, maxValue: 1n << 128n, bytes: 16 }
      : { prime: PRIME_256, maxValue: 1n << 256n, bytes: 32 };

  const { prime, maxValue, bytes } = params;

  // If by vanishingly small chance we calculate a small negative y coordinate, it
  // will exceed 128 or 256 bits when added to our prime. If this happens, we will
  // just generate different random shares
  while (true) {
    const poly = [secret];
    for (let i = 0; i < minimum - 1; i++) {
      poly.push(randomBytes(bytes) % prime);
    }

    const points: ShamirShare[] = [];
    let allPointsValid = true;

    for (let i = 1; i <= shares; i++) {
      const x = BigInt(i);
      let y = evalAt(poly, x, prime);

      if (y < 0n) {
        y += prime; // Ensure positive modulo
      }

      // Check if y-value exceeds our bit length
      if (y >= maxValue) {
        allPointsValid = false;
        break;
      }

      points.push(new ShamirShare(Number(x), y, false));
    }
    if (allPointsValid) {
      return points;
    }
  }
}

function extendedGCD(a: bigint, b: bigint): [bigint, bigint] {
  let [old_r, r] = [a, b];
  let [old_s, s] = [1n, 0n];
  let [old_t, t] = [0n, 1n];

  while (r !== 0n) {
    const quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
    [old_t, t] = [t, old_t - quotient * t];
  }

  return [old_s, old_t];
}

/**
 * Calculates modular multiplicative inverse using extended GCD
 * Used internally for Lagrange interpolation
 */
function mod_inverse(k: bigint, prime: bigint): bigint {
  const [inv] = extendedGCD(k, prime);
  return ((inv % prime) + prime) % prime;
}

/**
 * Performs Lagrange interpolation in prime field
 * Used to reconstruct secret from shares
 */
function lagrangeInterpolate(
  x: bigint,
  xs: bigint[],
  ys: bigint[],
  prime: bigint,
): bigint {
  let result = 0n;

  for (let i = 0; i < xs.length; i++) {
    let numerator = 1n;
    let denominator = 1n;

    for (let j = 0; j < xs.length; j++) {
      if (i === j) continue;

      numerator = (numerator * (x - xs[j])) % prime;
      denominator = (denominator * (xs[i] - xs[j])) % prime;
    }

    if (numerator < 0n) numerator += prime;
    if (denominator < 0n) denominator += prime;

    const inv = mod_inverse(denominator, prime);
    result = (result + ((ys[i] * numerator * inv) % prime)) % prime;
  }

  return result;
}

/**
 * Creates self-indexing secret shares from a wallet's entropy
 * Shares encode their own positions in the lowest 8 bits of the y-coordinate
 * @param wallet Source wallet to share
 * @param minimum Number of shares required for reconstruction
 * @param shares Total number of shares to generate
 * @returns Array of [x,y] coordinate pairs where y & 0xff encodes position
 */
function createIndexedShares(
  wallet: Wallet,
  minimum: number,
  shares: number,
): ShamirShare[] {
  if (minimum > shares) {
    throw new Error("Pool secret would be irrecoverable.");
  }
  const entropyHex = wallet.entropy.startsWith("0x")
    ? wallet.entropy.slice(2)
    : wallet.entropy;

  const shareBitLength =
    entropyHex.length <= 32
      ? EntropyBitLength.bits128
      : EntropyBitLength.bits256;

  const secret = ethers.toBigInt("0x" + entropyHex);

  return makeIndexedShares(secret, minimum, shares, shareBitLength);
}

/**
 * Creates shares that self-encode their index through natural matching
 * Each share's x-coordinate must match the lowest 8 bits of its y-coordinate
 * Finding such matching points requires brute force search through polynomials
 *
 * We are looking for k rare (1 in 256) events in a large number (256) of independent
 * trials, which sets us up for Poisson statistics (1/e/k!). The odds are about:
 *
 * 0: 0.368  (1/e)
 * 1: 0.368  (1/e)
 * 2: 0.184  (1/2e)
 * 3: 0.061  (1/6e)
 * 4: 0.015  (1/24e)
 * 5: 0.003  (1/120e)
 * 6: 0.0005 (1/720e)
 * 7: 0.0001 (1/5040e)
 * 8: 0.00001 (1/40320e)
 */
function makeIndexedShares(
  secret: bigint,
  minimum: number,
  shares: number,
  bitLength: EntropyBitLength,
): ShamirShare[] {
  if (minimum < 2) {
    throw new Error("Required shares must be >= 2");
  }
  if (minimum > shares) {
    throw new Error("Pool secret would be irrecoverable.");
  }

  const params =
    bitLength === EntropyBitLength.bits128
      ? { prime: PRIME_128, maxValue: 1n << 128n, bytes: 16 }
      : { prime: PRIME_256, maxValue: 1n << 256n, bytes: 32 };

  const { prime, maxValue, bytes } = params;

  const maxAttempts: Record<number, number> = {
    2: 1000, // 1/(1/2e) * 10
    3: 3000, // 1/(1/6e) * 10
    4: 12000, // 1/(1/24e) * 10
    5: 60000, // 1/(1/120e) * 10
    6: 360000, // 1/(1/720e) * 10
    7: 2520000, // 1/(1/5040e) * 10
    8: 20160000, // 1/(1/40320e) * 10
  };

  let attempts = 0;
  let matches = [];
  while (attempts < maxAttempts[shares]) {
    // Generate one random polynomial per attempt
    const poly = [secret];
    for (let i = 0; i < minimum - 1; i++) {
      poly.push(randomBytes(bytes) % prime);
    }

    const points: ShamirShare[] = [];

    // Search through x-coordinates for naturally matching y-values
    for (let i = 1; i <= 256; i++) {
      const x = BigInt(i);
      let y = evalAt(poly, x, prime);
      if (y < 0n) {
        y += prime;
      }

      // Skip y-values that exceed our bit length
      if (y >= maxValue) {
        continue;
      }

      // Check if y naturally encodes x
      if (x === (y & 0xffn)) {
        points.push(new ShamirShare(Number(x), y, true));
        if (points.length === shares) {
          return points;
        }
      }
    }
    matches.push(points.length);
    attempts++;
  }

  let histogram = Array(shares)
    .fill(0)
    .map((_, i) => matches.filter((x) => x === i).length);

  throw new Error(
    `Failed to generate valid indexed shares after ${attempts} attempts. ${histogram}`,
  );
}

export {
  createIndexedShares,
  createShares,
  generateWallet,
  recoverWalletFromShares,
  ShamirShare,
  toEntropyHex,
  walletFromEntropy,
  walletFromMnemonic,
  type Wallet,
};
