<script lang="ts">
  import { Button } from "$components/atoms";
  import {
    ShamirSchemeSelector,
    ShamirShareInput,
    WalletInput,
  } from "$components/molecules";
  import {
    createShares,
    shareValueToEntropyHex,
    type ShamirShare,
    type Wallet,
  } from "$utils/wallet";

  export interface ShamirShareGeneratorProps {
    label?: string;
  }

  let { label = "Your Secret Key" }: ShamirShareGeneratorProps = $props();

  // Configuration options
  const minShareOptions = ["2", "3", "4", "5"];
  const totalShareOptions = ["3", "4", "5", "6", "7", "8"];

  // Component state
  let wallet = $state<Wallet | null>(null);
  let entropy = $state("");
  let minShares = $state("3");
  let totalShares = $state("5");
  let generatedShares = $state<ShamirShare[]>([]);
  let error = $state("");

  let sharesReport: string = $derived(
    [
      `generated shares for ${entropy} (${minShares} of ${totalShares} scheme)\n`,
      ...generatedShares.map(
        (share, index) =>
          `Share ${index + 1}: [index: ${share[0]}, share: ${shareValueToEntropyHex(share[1])}]`
      ),
    ].join("\n")
  );

  // Generate shares when wallet or configuration changes
  function generateShares() {
    if (!wallet) {
      console.error("no source wallet");
      generatedShares = [];
      error = "";
      return;
    }

    try {
      const min = parseInt(minShares);
      const total = parseInt(totalShares);

      if (min > total) {
        error = "Required shares cannot exceed total shares";
        generatedShares = [];
        return;
      }

      generatedShares = createShares(wallet, min, total);
      console.log(sharesReport);
      error = "";
    } catch (err) {
      console.error("Error generating shares:", err);
      error = err instanceof Error ? err.message : "Failed to generate shares";
      generatedShares = [];
    }
  }

  // Handle wallet input changes
  function handleWalletChange(newWallet: Wallet) {
    wallet = newWallet;
    entropy = wallet.entropy;
    generateShares();
  }

  function handleSchemeChange(required: number, total: number) {
    minShares = required.toString();
    totalShares = total.toString();
    generateShares();
  }

  // Simplify copyAllToClipboard() to use the derived state
  function copyAllToClipboard() {
    if (!wallet || generatedShares.length === 0) return;
    navigator.clipboard.writeText(sharesReport);
  }
</script>

<div class="flex flex-col gap-6 p-4">
  <!-- Source Wallet Input -->
  <div class="w-full">
    <WalletInput {label} {entropy} onchange={handleWalletChange} />
  </div>

  <!-- Configuration Options -->
  <ShamirSchemeSelector onChange={handleSchemeChange} />

  <!-- Error Display -->
  {#if error}
    <div class="text-red-100 text-sm" role="alert">
      {error}
    </div>
  {/if}

  <!-- Generated Shares -->
  {#if generatedShares.length > 0}
    <div class="flex flex-col gap-4">
      <div class="flex space-beween gap-x-8">
        <h3 class="text-lg font-medium w-full">Generated Shares</h3>
        <div class="w-32">
          <Button
            variant="secondary"
            size="md"
            onclick={() => generateShares()}
          >
            Regenerate
          </Button>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        {#each generatedShares as share, i}
          <ShamirShareInput
            disabled={true}
            shareIndex={share[0].toString()}
            shareEntropy={shareValueToEntropyHex(share[1])}
          />
        {/each}
      </div>

      <div class="flex space-beween gap-x-8">
        <p class="text-sm text-black-60 w-full">
          Any {minShares} of these {generatedShares.length} shares can be used to
          reconstruct the original wallet.
        </p>
        <div class="w-32">
          <Button
            variant="secondary"
            size="md"
            onclick={() => copyAllToClipboard()}
          >
            Copy all
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>
