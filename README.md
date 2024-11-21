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

## Security Notes

- Store shares separately and securely
- Never store all shares in one location
- Consider physical (paper) backups
- Test recovery process before deploying
- Verify checksums when recovering

## Technical Details

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

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss proposed changes.

## License

[MIT](LICENSE)

## Author

Robb Walters ([GitHub](https://github.com/rjwalters))
