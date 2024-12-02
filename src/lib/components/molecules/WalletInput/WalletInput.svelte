<script module lang="ts">
  export type WalletInputDisplayMode =
    | "entropy"
    | "mnemonic"
    | "grid"
    | "addresses";
</script>

<script lang="ts">
  import { Badge, Button, Input } from "$components/atoms";
  import {
    generateWallet,
    walletFromEntropy,
    walletFromMnemonic,
    type Wallet,
  } from "$utils/wallet";

  import { isAriaIntent } from "$utils/aria";

  export interface WalletInputProps {
    entropy?: string; // 16 or 32 bytes
    label?: string;
    disabled?: boolean;
    required?: boolean;
    displayMode?: WalletInputDisplayMode;
    hiddenModes?: WalletInputDisplayMode[];
    showGenerationButtons?: boolean;
    showCopyButton?: boolean;
    onChange?: (wallet: Wallet) => void;
  }

  let {
    entropy = $bindable(""),
    label = "",
    disabled = false,
    required = false,
    displayMode = "mnemonic",
    hiddenModes = [],
    showGenerationButtons = false,
    showCopyButton = true,
    onChange = (_wallet) => {},
  }: WalletInputProps = $props();

  let activeMode = $state(displayMode);
  let wallet = $state<Wallet | null>(null);
  const bits: number = $derived((wallet?.entropy.slice(2).length || 0) * 4);
  let errorMessage = $state("");
  let editingIndex = $state<number | null>(null);

  // If the current activeMode is in hiddenModes, switch to the first available mode
  $effect(() => {
    if (hiddenModes.includes(activeMode)) {
      const availableModes = modes.filter(
        (mode) => !hiddenModes.includes(mode.id),
      );
      if (availableModes.length > 0) {
        activeMode = availableModes[0].id;
      }
    }
  });

  $effect(() => {
    if (!entropy) {
      wallet = null;
      errorMessage = "";
      return;
    }

    try {
      // console.log(`updating wallet using entropy = ${entropy}`);
      wallet = walletFromEntropy(entropy);
      errorMessage = "";
    } catch (err) {
      console.error("Effect error:", err);
      errorMessage = "Invalid entropy";
      wallet = null;
    }
  });

  function startEditing(index: number, word: string) {
    if (disabled) return;
    editingIndex = index;
  }

  function handleWordEdit(index: number, newWord: string) {
    try {
      const words = wallet?.mnemonic.split(" ") ?? [];
      words[index] = newWord.trim().toLowerCase();
      handleMnemonicChange(words.join(" "));
      editingIndex = null;
    } catch (err) {
      console.log(err);
      errorMessage = "Invalid checksum";
    }
  }

  function handleMnemonicChange(mnemonic: string) {
    try {
      const newWallet = walletFromMnemonic(mnemonic);
      entropy = newWallet.entropy;
      onChange(newWallet);
      errorMessage = "";
    } catch (err) {
      errorMessage = "Invalid mnemonic";
    }
  }

  function handleEntropyChange(hexValue: string) {
    try {
      const newWallet = walletFromEntropy(`0x${hexValue}`);
      entropy = newWallet.entropy;
      onChange(newWallet);
      errorMessage = "";
    } catch (err) {
      errorMessage = "Invalid hex";
    }
  }

  function handleKeyDown(e: KeyboardEvent, index: number, word: string) {
    if (isAriaIntent(e)) {
      e.preventDefault();
      if (editingIndex !== index) {
        startEditing(index, word);
      } else {
        const target = e.target as HTMLInputElement;
        handleWordEdit(index, target.value);
      }
    }
  }

  function copyToClipboard() {
    if (!wallet) return;

    const clipboardValue =
      activeMode === "entropy"
        ? wallet.entropy
        : activeMode === "addresses"
          ? wallet.addresses[0]
          : wallet.mnemonic;

    navigator.clipboard.writeText(clipboardValue);
  }

  const modes: Array<{
    id: WalletInputDisplayMode;
    label: string;
  }> = [
    { id: "entropy", label: "Hex" },
    { id: "mnemonic", label: "Words" },
    { id: "grid", label: "Grid" },
    { id: "addresses", label: "Addresses" },
  ];

  const visibleModes = $derived(
    modes.filter((mode) => !hiddenModes.includes(mode.id)),
  );

  function generateSample(bits: number) {
    const wallet = generateWallet(bits);
    entropy = wallet.entropy;
    onChange(wallet);
  }
</script>

<div class="flex w-full flex-col gap-2 p-2">
  <div class="flex flex-row items-center justify-between">
    <p class="mb-1 flex-1 text-sm font-medium text-black-80" class:required>
      {label}
    </p>

    {#if !wallet || showGenerationButtons}
      <div class="flex gap-2">
        <Button variant="primary" size="sm" onclick={() => generateSample(128)}>
          Generate 128-bit
        </Button>
        <Button variant="primary" size="sm" onclick={() => generateSample(256)}>
          Generate 256-bit
        </Button>
      </div>
    {/if}

    <div class="flex w-1/3 justify-end gap-2">
      {#each visibleModes as mode}
        <div class:hidden={activeMode === mode.id}>
          <Button
            variant="primary"
            size="sm"
            disabled={!wallet}
            onclick={() => {
              editingIndex = null;
              errorMessage = "";
              activeMode = mode.id;
            }}
          >
            {mode.label}
          </Button>
        </div>
      {/each}
    </div>

    {#if showCopyButton}
      <div class="ml-4 w-1/12">
        <Button
          variant="secondary"
          size="sm"
          onclick={copyToClipboard}
          disabled={!wallet}
        >
          Copy
        </Button>
      </div>
    {/if}
  </div>

  <div class="flex w-full flex-row items-start gap-2">
    {#if activeMode === "entropy"}
      <div class="flex w-full flex-row items-center">
        <p class="p-2 text-sm font-medium text-black-80">0x</p>
        <div class="flex flex-1 items-center gap-2">
          <Input
            value={wallet?.entropy.slice(2) ?? ""}
            label=""
            {disabled}
            placeholder="Enter 16 or 32 hex bytes..."
            onchange={(e) => {
              const target = e.target as HTMLInputElement;
              handleEntropyChange(target.value);
            }}
          />
          {#if wallet}
            <Badge label="{bits}b" color={bits === 128 ? "red" : "green"} />
          {/if}
        </div>
      </div>
    {:else if activeMode === "mnemonic"}
      <div class="flex flex-1 items-center gap-2">
        <textarea
          class="w-full resize-none rounded border-2 border-black-40 bg-white-100 p-2 text-sm outline-none"
          class:cursor-not-allowed={disabled}
          value={wallet?.mnemonic ?? ""}
          readonly={disabled}
          placeholder="Enter your 12 or 24 word mnemonic phrase..."
          onchange={(e) => {
            const target = e.target as HTMLTextAreaElement;
            handleMnemonicChange(target.value);
          }}
        ></textarea>
        {#if wallet}
          <Badge label="{bits}b" color={bits === 128 ? "red" : "green"} />
        {/if}
      </div>
    {:else if activeMode === "grid"}
      <div class="w-full">
        <div class="grid grid-cols-6 gap-x-2 gap-y-1">
          {#each Array(24) as _, index}
            {@const word = wallet?.mnemonic.split(" ")[index] ?? ""}
            {#if index < (wallet?.mnemonic.split(" ").length ?? 0)}
              <div class="flex min-w-0 flex-row items-center">
                <span class="w-5 flex-shrink-0 text-sm text-black-60"
                  >{index + 1}:</span
                >
                <input
                  type="text"
                  value={word}
                  readonly={editingIndex !== index}
                  class="min-w-0 flex-1 rounded border-2 border-black-40 bg-white-100 p-2 text-sm outline-none hover:bg-black-05
                    {editingIndex === index ? 'border-black-100' : ''}"
                  class:cursor-not-allowed={disabled}
                  onclick={() => startEditing(index, word)}
                  onkeydown={(e) => handleKeyDown(e, index, word)}
                  onchange={(e) => {
                    const target = e.target as HTMLInputElement;
                    handleWordEdit(index, target.value);
                  }}
                />
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {:else if activeMode === "addresses"}
      <div class="w-full">
        <div class="flex flex-col gap-2">
          {#each wallet?.addresses ?? [] as address, index}
            <div class="flex flex-row items-center gap-2">
              <span class="w-24 flex-shrink-0 text-sm text-black-60">
                m/44'/60'/0'/0/{index}:
              </span>
              <div
                class="flex-1 rounded border-2 border-black-40 bg-white-100 p-2 font-mono text-sm"
              >
                {address}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  <div class="flex w-full flex-row items-start gap-2">
    {#if errorMessage}
      <p class="mt-1 w-full text-sm text-red-100" role="alert">
        {errorMessage}
      </p>
    {/if}
  </div>
</div>

<style lang="postcss">
  .required {
    @apply after:ml-0.5 after:text-red-100 after:content-['*'];
  }
</style>
