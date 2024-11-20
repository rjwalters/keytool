<script lang="ts">
  import { Badge, Input } from "$components/atoms";
  import { WalletInput } from "$components/molecules";
  import { type ShamirShare, recoverShareIndex } from "$utils/wallet";

  export interface ShareInputProps {
    shareIndex: number | undefined;
    shareEntropy: string;
    isIndexed?: boolean;
    disabled?: boolean;
    required?: boolean;
    showCopyButton?: boolean;
    onChange?: (share: ShamirShare | undefined) => void;
    label?: string;
  }

  let {
    shareIndex = $bindable(undefined),
    shareEntropy = $bindable(""),
    isIndexed = $bindable(false),
    disabled = false,
    required = false,
    showCopyButton = true,
    onChange = () => {},
    label = "",
  }: ShareInputProps = $props();

  let share: ShamirShare = $derived([
    BigInt(shareIndex || 0),
    BigInt(shareEntropy),
  ]);

  let errorMessage = $state("");

  // Validate the shareEntropy (similar to validateEntropyValue in wallet.ts)
  function validateShareEntropy(hexValue: string): boolean {
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
      return true;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Invalid share value";
      return false;
    }
  }

  // Update the share when either coordinate changes
  $effect(() => {
    try {
      errorMessage = "";
      if (isIndexed) {
        shareIndex = Number(recoverShareIndex(share));
      }

      if (shareIndex !== undefined && shareEntropy) {
        // Validate the shareIndex is a positive integer
        if (shareIndex < 1) {
          errorMessage = "Share index must be >=1";
          onChange(undefined);
          return;
        }

        // Validate the share entropy
        if (!validateShareEntropy(shareEntropy)) {
          onChange(undefined);
          return;
        }
        console.log(share);
        onChange(share);
      } else {
        onChange(undefined);
      }
    } catch (err) {
      console.error("Error updating share:", err);
      errorMessage = err instanceof Error ? err.message : "Invalid share";
      onChange(undefined);
    }
  });
</script>

<div class="flex flex-col gap-2 border border-black-10">
  <div class="flex pl-2">
    <!-- Index -->
    <div class="flex flex-col justify-around">
      <div class="flex flex-col items-center gap-2 w-20">
        {#if isIndexed}
          <Badge
            label="Indexed"
            color="blue"
            {disabled}
            onClick={(_e) => (isIndexed = false)}
          />
        {:else}
          <Badge
            label="Standard"
            color="black"
            {disabled}
            onClick={(_e) => (isIndexed = true)}
          />
        {/if}
        <Input
          bind:value={shareIndex}
          disabled={isIndexed || disabled}
          variant="number"
        />
      </div>
    </div>

    <!-- Value Input (reusing WalletInput for hex handling) -->
    <div class="flex-1">
      <WalletInput
        bind:entropy={shareEntropy}
        {label}
        {required}
        {disabled}
        {showCopyButton}
        hiddenModes={["addresses"]}
      />
    </div>
  </div>

  {#if errorMessage}
    <p class="text-sm text-red-100" role="alert">{errorMessage}</p>
  {/if}
</div>
