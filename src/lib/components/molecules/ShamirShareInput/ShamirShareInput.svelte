<script lang="ts">
  import { Input } from "$components/atoms";
  import { WalletInput } from "$components/molecules";
  import type { ShamirShare } from "$utils/wallet";

  export interface ShareInputProps {
    shareIndex?: string;
    shareValue?: string;
    disabled?: boolean;
    required?: boolean;
    onchange?: (share: ShamirShare | undefined) => void;
    label?: string;
  }

  let {
    shareIndex = $bindable(""),
    shareValue = $bindable(""),
    disabled = false,
    required = false,
    onchange = () => {},
    label = "Share",
  }: ShareInputProps = $props();

  let errorMessage = $state("");

  // Validate the shareValue (similar to validateEntropyValue in wallet.ts)
  function validateShareValue(hexValue: string): boolean {
    try {
      if (!hexValue.startsWith("0x")) {
        throw new Error("Invalid share value: must start with 0x");
      }
      if (!/^0x[0-9a-fA-F]+$/.test(hexValue)) {
        throw new Error("Invalid share value: invalid hex characters");
      }
      const byteLength = (hexValue.length - 2) / 2;
      if (byteLength !== 16 && byteLength !== 32) {
        throw new Error("Invalid share value: must be 16 or 32 bytes");
      }

      // Check if shareValue is within the prime field
      // Using same PRIME as in wallet.ts: 2^256 + 297
      const PRIME = 2n ** 256n + 297n;
      const valueBigInt = BigInt(hexValue);
      if (valueBigInt >= PRIME) {
        throw new Error("Invalid share value: exceeds prime field maximum");
      }

      return true;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Invalid share value";
      return false;
    }
  }

  // Update the share when either coordinate changes
  function updateShare() {
    try {
      // Clear any previous errors
      errorMessage = "";

      // Only create share if we have both values
      if (shareIndex && shareValue) {
        // Validate the shareIndex is a positive integer
        const x = BigInt(shareIndex);
        if (x <= 0n) {
          errorMessage = "Index must be positive";
          onchange(undefined);
          return;
        }

        // Validate the value
        if (!validateShareValue(shareValue)) {
          onchange(undefined);
          return;
        }

        const y = BigInt(shareValue);
        const newShare: ShamirShare = [x, y];
        onchange(newShare);
      } else {
        onchange(undefined);
      }
    } catch (err) {
      console.error("Error updating share:", err);
      errorMessage = err instanceof Error ? err.message : "Invalid share";
      onchange(undefined);
    }
  }

  // Watch for value changes
  $effect(() => {
    updateShare();
  });
</script>

<div class="flex flex-col gap-2">
  {#if label}
    <p class="text-sm font-medium text-black-80" class:required>
      {label}
    </p>
  {/if}

  <div class="flex gap-4 items-start">
    <!-- Index Input -->
    <div class="w-24">
      <Input
        bind:value={shareIndex}
        label="Index"
        {disabled}
        {required}
        type="number"
        min="1"
        placeholder="1"
      />
    </div>

    <!-- Value Input (reusing WalletInput for hex handling) -->
    <div class="flex-1">
      <WalletInput
        bind:value={shareValue}
        label="Value"
        {disabled}
        {required}
        hiddenModes={["addresses"]}
      />
    </div>
  </div>

  {#if errorMessage}
    <p class="text-sm text-red-100" role="alert">{errorMessage}</p>
  {/if}
</div>

<style lang="postcss">
  .required {
    @apply after:ml-0.5 after:text-red-100 after:content-['*'];
  }
</style>
