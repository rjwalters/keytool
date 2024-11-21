// .prettierrc.cjs
module.exports = {
  plugins: [
    "prettier-plugin-svelte",
    "prettier-plugin-organize-imports",
    "prettier-plugin-tailwindcss",
  ],
  tailwindConfig: "./tailwind.config.ts",
  semi: true,
  trailingComma: "all",
  singleQuote: false,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",
  embeddedLanguageFormatting: "auto",
  svelteStrictMode: false,
  svelteIndentScriptAndStyle: true,
  overrides: [
    {
      files: "*.svelte",
      options: {
        parser: "svelte",
      },
    },
    {
      files: ["*.json", "*.json5"],
      options: {
        parser: "json",
        singleQuote: false,
        quoteProps: "preserve",
      },
    },
    {
      files: "*.yaml",
      options: {
        parser: "yaml",
        singleQuote: false,
      },
    },
    {
      // Ensure package.json is consistently formatted
      files: "package.json",
      options: {
        parser: "json-stringify",
        trailingComma: "none",
      },
    },
    {
      // TypeScript configuration files
      files: ["*.ts", "*.tsx"],
      options: {
        parser: "typescript",
      },
    },
  ],
};
