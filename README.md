# KeyTool

A desktop application for securely splitting and recovering cryptographic keys using Shamir's Secret Sharing scheme. Perfect for creating redundant backups or implementing multi-party recovery schemes for cryptocurrency wallets.

## Features

- Split keys into multiple shares with customizable recovery thresholds
- Support for both standard and self-indexed share formats
- BIP39 mnemonic phrase compatibility
- Information-theoretic security (no computational assumptions)
- Built-in share recovery verification
- Cross-platform support (Windows, macOS, Linux)
- Offline-first design for maximum security

## Download

Get the latest release for your platform from the [GitHub Releases](https://github.com/rjwalters/keytool/releases) page:

- Windows: `KeyTool-Setup.exe`
- macOS: `KeyTool.dmg` or `KeyTool-mac.zip`
- Linux: `KeyTool.AppImage`

## Usage Guide

1. Generate Shares:

   - Input your wallet's private key or seed phrase
   - Choose number of total shares and recovery threshold
   - Select share format (standard/indexed)
   - Generate and save shares securely

2. Recover Key:
   - Input the required number of shares
   - Verify recovery threshold
   - Reconstruct original key

For detailed examples and security recommendations, see the "Learn More" tab within the application.

### Tiered Sharing

KeyTool could be used in tiered sharing schemes, in which one or more of the shares is split into subparts. This approach allows you to create a hierarchical access structure for reconstruction. As an example, splitting a secret with a 2-of-3 scheme into parts (a, b, c) and then further splitting part (c) with a 3-of-5 scheme could enforce the requirements:

- 2 admin shares ("a" and "b"), or
- 1 admin share ("a" or "b") plus 3 user shares (any 3 of the five shares created from "c")

This can be achieved by creating a tree of shares, where the secret is first split among admins, and then one admin share is further split among users. This approach, inspired by [codahale/shamir](https://github.com/codahale/shamir), provides flexible access control while maintaining security.

## Security Notes

- Store shares separately and securely
- Never store all shares in one location
- Consider physical (paper) backups
- Test recovery process before deploying
- Verify checksums when recovering

## Technical Details

KeyTool uses Shamir's Secret Sharing over GF(Q) (prime fields) rather than GF(256) for several reasons:

1. **Simplicity**: The implementation over prime fields is more straightforward and easier to understand.
2. **128b BIP39 Compatibility**: For 128-bit cryptocurrency seeds, using a 128-bit prime field allows shares to be stored as 12-word BIP39 mnemonic phrases.
3. **Use Case Optimization**: Since KeyTool is used for occasional key backup and recovery, we prioritize implementation clarity over raw performance.

For splitting larger secrets (>256-bits), GF(256) implementations like [codahale/shamir](https://github.com/codahale/shamir) would be more appropriate.

### Security Implementation

- Uses polynomial interpolation in finite fields
- 256-bit keys: Prime field of 2^256 + 297
- 128-bit keys: Prime field of 2^128 + 51
- Information-theoretic security

### Dependencies

- Electron for cross-platform desktop support
- SvelteKit for UI
- ethers.js for cryptographic operations
- TailwindCSS for styling

## Building from Source

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- git

### Setup

```bash
# Clone repository
git clone https://github.com/rjwalters/keytool.git
cd keytool

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run electron-dev

# Run tests
npm test

# Lint and format code
npm run lint
npm run format
```

### Building

```bash
# Build for all platforms
npm run make

# Build for specific platform
npm run make -- --mac
npm run make -- --win
npm run make -- --linux
```

Build outputs will be available in the `dist` directory.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss proposed changes.

## License

[MIT](LICENSE)

## Author

Robb Walters ([GitHub](https://github.com/rjwalters))
