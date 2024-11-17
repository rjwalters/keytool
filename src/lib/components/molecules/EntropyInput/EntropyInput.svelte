<script lang="ts">
  import { Button, Input } from "$components/atoms";
  import {
    walletFromEntropy,
    walletFromMnemonic,
    type Wallet,
  } from "$utils/wallet";

  export interface EntropyInputProps {
    value: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    onchange?: (value: string) => void;
  }

  let {
    value = $bindable(""),
    label = "Key",
    error,
    disabled = false,
    required = false,
    onchange = () => {},
  }: EntropyInputProps = $props();

  let showingAsHexValue = $state(true);
  let displayValue = $state("");
  let internalError = $state("");

  function toggleDisplay() {
    try {
      let wallet: Wallet;
      internalError = "";

      if (showingAsHexValue) {
        wallet = walletFromMnemonic(value);
        displayValue = wallet.entropy;
      } else {
        wallet = walletFromEntropy(value);
        displayValue = wallet.mnemonic;
      }

      showingAsHexValue = !showingAsHexValue;
      value = displayValue;
      onchange(value);
    } catch (err) {
      internalError = `Invalid ${showingAsHexValue ? "hex" : "mnemonic"} format`;
    }
  }

  // Initialize display value
  $effect(() => {
    try {
      if (value) {
        let wallet: Wallet;
        if (value.startsWith("0x")) {
          wallet = walletFromEntropy(value);
          displayValue = showingAsHexValue ? value : wallet.mnemonic;
        } else {
          wallet = walletFromMnemonic(value);
          displayValue = showingAsHexValue ? wallet.entropy : value;
        }
        internalError = "";
      } else {
        displayValue = "";
      }
    } catch (err) {
      internalError = "Invalid key format";
    }
  });
</script>

<div class="flex gap-2 flex-col">
  {#if label}
    <p class="mb-1 text-sm font-medium text-black-80">
      {label}
    </p>
  {/if}

  <div class="flex flex-row gap-2 items-start">
    {#if showingAsHexValue}
      <p class="ml-2 px-1 pt-3 text-sm font-medium text-black-80">0x</p>
    {/if}

    <Input
      value={displayValue}
      label=""
      error={internalError || error}
      {disabled}
      {required}
      placeholder={showingAsHexValue ? "Enter hex..." : "Enter mnemonic..."}
      onchange={(e) => {
        const target = e.target as HTMLInputElement;
        displayValue = target.value;
        value = target.value;
        onchange(target.value);
      }}
    />

    <Button
      variant="outline"
      size="md"
      disabled={disabled || !displayValue}
      onclick={toggleDisplay}
    >
      {showingAsHexValue ? "Words" : "Hex"}
    </Button>
  </div>
</div>
