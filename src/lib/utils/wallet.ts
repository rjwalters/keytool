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
 * Type representing a point in the finite field for Shamir's Secret Sharing
 * [x coordinate, y coordinate]
 */
type ShamirShare = [bigint, bigint];

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
    if (!Array.isArray(share) || share.length !== 2) {
      throw new Error(`Invalid share at index ${i}: wrong format`);
    }
    if (typeof share[0] !== "bigint" || typeof share[1] !== "bigint") {
      throw new Error(
        `Invalid share at index ${i}: coordinates must be bigints`,
      );
    }
  });

  // Check for unique x coordinates
  const xCoords = new Set(shares.map((share) => share[0].toString()));
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
 * Converts a BigInt value to a properly formatted entropy hex string
 * Automatically pads to either 16 or 32 bytes based on value size
 * @param value BigInt to convert
 * @returns Hex string starting with "0x" padded to appropriate length
 */
function shareValueToEntropyHex(value: bigint): string {
  if (value < 0n) {
    throw new Error("Entropy value must be positive");
  }
  const bitLength = value.toString(2).length;
  const targetLength = bitLength <= 128 ? 32 : 64;
  const hexString = value.toString(16);
  return `0x${hexString.padStart(targetLength, "0")}`;
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

  const xs = shares.map((share) => share[0]);
  const ys = shares.map((share) => share[1]);

  // Check if all shares are 128-bit by examining their y-values
  const is128Bit = shares.every((share) => {
    const yHex = share[1].toString(16);
    return yHex.length <= 32;
  });
  const prime = is128Bit ? PRIME_128 : PRIME_256;

  const recoveredSecret = lagrangeInterpolate(0n, xs, ys, prime);
  return walletFromEntropy(shareValueToEntropyHex(recoveredSecret));
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
    throw new Error("Required share must be >= 2");
  }

  if (minimum > shares) {
    throw new Error("Pool secret would be irrecoverable.");
  }

  const params =
    bitLength === EntropyBitLength.bits128
      ? { prime: PRIME_128, maxValue: 1n << 128n, bytes: 16 }
      : { prime: PRIME_256, maxValue: 1n << 256n, bytes: 32 };

  const { prime, maxValue, bytes } = params;

  secret = secret % prime;
  if (secret < 0n) secret += prime;

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

      points.push([x, y]);
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

export {
  createShares,
  generateWallet,
  recoverWalletFromShares,
  shareValueToEntropyHex,
  walletFromEntropy,
  walletFromMnemonic,
  type ShamirShare,
  type Wallet,
};
