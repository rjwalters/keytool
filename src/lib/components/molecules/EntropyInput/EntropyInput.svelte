<script module lang="ts">
  export type EntropyInputDisplayMode = "hex" | "mnemonic" | "grid";
</script>

<script lang="ts">
  import { Button, Input } from "$components/atoms";
  import {
    walletFromEntropy,
    walletFromMnemonic,
    type Wallet,
  } from "$utils/wallet";

  export interface EntropyInputProps {
    value: string; // mnemonic or hex
    label?: string;
    disabled?: boolean;
    required?: boolean;
    displayMode?: EntropyInputDisplayMode;
    onchange?: (wallet: Wallet) => void;
  }

  import { isAriaIntent } from "$utils/aria";

  let {
    value = $bindable(""),
    label = "Key",
    disabled = false,
    required = false,
    displayMode = "grid",
    onchange = () => {},
  }: EntropyInputProps = $props();

  let activeMode = $state(displayMode);
  let wallet = $state<Wallet | null>(null);
  let errorMessage = $state("");
  let editingIndex = $state<number | null>(null);

  function startEditing(index: number, word: string) {
    if (disabled) return;
    editingIndex = index;
  }

  function handleWordEdit(index: number, newWord: string) {
    try {
      console.log(`attempting to change ${index} to ${newWord}`);
      const words = wallet?.mnemonic.split(" ") ?? [];
      words[index] = newWord.trim().toLowerCase();
      const newMnemonic = words.join(" ");
      wallet = walletFromMnemonic(newMnemonic);
      onchange(wallet);
      editingIndex = null;
      errorMessage = "";
    } catch (err) {
      console.log(err);
      errorMessage = "Invalid checksum";
    }
  }

  // Update wallet when value changes
  $effect(() => {
    if (!value) {
      wallet = null;
      errorMessage = "";
      return;
    }

    try {
      wallet = value.startsWith("0x")
        ? walletFromEntropy(value)
        : walletFromMnemonic(value);
      errorMessage = "";
    } catch (err) {
      console.error("Effect error:", err);
      errorMessage = `Invalid entropy`;
      wallet = null;
    }
  });

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

  const modes: Array<{
    id: EntropyInputDisplayMode;
    label: string;
  }> = [
    { id: "hex", label: "Hex" },
    { id: "mnemonic", label: "Words" },
    { id: "grid", label: "Grid" },
  ];
</script>

<div class="w-full flex gap-2 flex-col p-2">
  {#if label}
    <p class="w-full mb-1 text-sm font-medium text-black-80" class:required>
      {label}
    </p>
  {/if}

  <div class="w-full flex flex-row gap-2 items-start">
    {#if activeMode === "hex"}
      <div class="w-full flex flex-row gap-2 items-center">
        <p class="pr-2 text-sm font-medium text-black-80">0x</p>

        <Input
          value={wallet?.entropy.slice(2) ?? ""}
          label=""
          {disabled}
          placeholder={"Enter 16 or 32 hex bytes..."}
          onchange={(e) => {
            try {
              const target = e.target as HTMLInputElement;
              wallet = walletFromEntropy(`0x${target.value}`);
              onchange(wallet);
              errorMessage = "";
            } catch (err) {
              errorMessage = "Invalid hex";
            }
          }}
        />
      </div>
    {:else if activeMode === "mnemonic"}
      <textarea
        class="w-full p-2 border-2 border-black-40 outline-none rounded text-sm bg-white-100 min-h-[5rem] resize-none"
        class:cursor-not-allowed={disabled}
        value={wallet?.mnemonic ?? ""}
        readonly={disabled}
        placeholder="Enter your 12/24 word mnemonic phrase..."
        onchange={(e) => {
          try {
            const target = e.target as HTMLTextAreaElement;
            wallet = walletFromMnemonic(target.value);
            onchange(wallet);
            errorMessage = "";
          } catch (err) {
            errorMessage = "Invalid mnemonic";
          }
        }}
      ></textarea>
    {:else if activeMode === "grid"}
      <div class="w-full">
        <div class="grid grid-cols-6 gap-x-2 gap-y-1">
          {#each Array(24) as _, index}
            {@const word = wallet?.mnemonic.split(" ")[index] ?? ""}
            {#if index < (wallet?.mnemonic.split(" ").length ?? 0)}
              <div class="flex flex-row items-center min-w-0">
                <span class="flex-shrink-0 w-5 text-sm text-black-60"
                  >{index + 1}:</span
                >
                <input
                  type="text"
                  value={word}
                  readonly={editingIndex !== index}
                  class="flex-1 min-w-0 p-2 border-2 border-black-40 outline-none rounded text-sm bg-white-100 hover:bg-black-05
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
    {/if}

    <div class="flex flex-col items-center justify-center w-24 gap-y-4">
      {#each modes as mode}
        <div class="w-full" class:hidden={activeMode === mode.id}>
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

      <Button
        variant="secondary"
        size="sm"
        onclick={() => {
          let clipboardValue = undefined;
          if (activeMode === "hex") {
            clipboardValue = wallet?.entropy;
          } else {
            clipboardValue = wallet?.mnemonic;
          }
          navigator.clipboard.writeText(clipboardValue || "");
        }}
        disabled={!wallet}
      >
        Copy
      </Button>
    </div>
  </div>

  {#if errorMessage}
    <p class="w-full mt-1 text-sm text-red-100" role="alert">{errorMessage}</p>
  {/if}
</div>

<style lang="postcss">
  .required {
    @apply after:ml-0.5 after:text-red-100 after:content-['*'];
  }
</style>
