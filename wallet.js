const { ethers } = require('ethers');

function generateAddresses(hdNode, count = 4) {
    const addresses = [];
    const basePath = hdNode.path || "m";
    for (let i = 0; i < count; i++) {
        let path = `${basePath}/0/${i}`;
        if (basePath === "m") {
            path = `m/44'/60'/0'/0/${i}`; // Full path for root nodes
        }
        let derivedWallet = hdNode.derivePath(path.slice(basePath.length + 1)); // Remove base path
        addresses.push(derivedWallet.address);
    }
    return addresses;
}

function walletToObject(hdNode) {
    return {
        privateKey: hdNode.privateKey,
        mnemonic: hdNode.mnemonic.phrase,
        addresses: generateAddresses(hdNode),
        entropy: ethers.hexlify(hdNode.mnemonic.entropy)
    };
}

function generateWallet(bitStrength = 256) {
    const entropy = ethers.randomBytes(bitStrength / 8);
    return walletFromEntropy(entropy);
}

function walletFromEntropy(entropy) {
    const mnemonic = ethers.Mnemonic.fromEntropy(entropy);
    const hdNode = ethers.HDNodeWallet.fromMnemonic(mnemonic);
    return walletToObject(hdNode);
}

function walletFromMnemonic(mnemonicPhrase) {
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonicPhrase);
    return walletToObject(hdNode);
}

const PRIME = ethers.toBigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F");

function random32Bytes() {
    return ethers.toBigInt(ethers.randomBytes(32));
}

function evalAt(poly, x, prime) {
    let accum = 0n;
    for (let i = poly.length - 1; i >= 0; i--) {
        accum = (accum * x + poly[i]) % prime;
    }
    return accum;
}

function makeRandomShares(secret, minimum, shares, prime = PRIME) {
    if (minimum > shares) {
        throw new Error('Pool secret would be irrecoverable.');
    }
    const poly = [secret];
    for (let i = 0; i < minimum - 1; i++) {
        poly.push(random32Bytes());
    }
    const points = [];
    for (let i = 1; i <= shares; i++) {
        points.push([BigInt(i), evalAt(poly, BigInt(i), prime)]);
    }
    return points;
}

function extendedGCD(a, b) {
    let x = 0n;
    let lastX = 1n;
    let y = 1n;
    let lastY = 0n;

    while (b !== 0n) {
        const quot = a / b;
        [a, b] = [b, a % b];
        [x, lastX] = [lastX - quot * x, x];
        [y, lastY] = [lastY - quot * y, y];
    }
    return [lastX, lastY];
}

function divmod(num, den, p) {
    const [inv, _] = extendedGCD(den, p);
    return (num * inv) % p;
}

function lagrangeInterpolate(x, xs, ys, p) {
    const k = xs.length;
    if (k !== new Set(xs.map(x => x.toString())).size) {
        throw new Error('points must be distinct');
    }

    const PI = (vals) => vals.reduce((accum, v) => accum * v, 1n);

    let nums = [];
    let dens = [];
    for (let i = 0; i < k; i++) {
        let others = [...xs];
        let cur = others.splice(i, 1)[0];
        nums.push(PI(others.map(o => x - o)));
        dens.push(PI(others.map(o => cur - o)));
    }

    const den = PI(dens);
    let num = 0n;
    for (let i = 0; i < k; i++) {
        num = (num + divmod(nums[i] * den * ys[i] % p, dens[i], p)) % p;
    }

    return (divmod(num, den, p) + p) % p;
}

function recoverSecret(shares, prime = PRIME) {
    if (shares.length < 3) {
        throw new Error('need at least three shares');
    }
    const xs = shares.map(share => share[0]);
    const ys = shares.map(share => share[1]);
    return lagrangeInterpolate(0n, xs, ys, prime);
}

function createShares(wallet, minimum, shares) {
    const secret = ethers.toBigInt(wallet.entropy);
    return makeRandomShares(secret, minimum, shares);
}

function recoverWalletFromShares(shares) {
    const recoveredSecret = recoverSecret(shares);
    const recoveredEntropy = ethers.hexlify(recoveredSecret).slice(2).padStart(32, '0');
    return walletFromEntropy(recoveredEntropy);
}

module.exports = {
    generateWallet,
    walletFromEntropy,
    walletFromMnemonic,
    createShares,
    recoverWalletFromShares
};