<script lang="ts">
  import { RadioGroup } from "$components/atoms";
  import { ShamirShareInput, WalletInput } from "$components/molecules";
  import {
    createShares,
    shareValueToEntropyHex,
    type ShamirShare,
    type Wallet,
  } from "$utils/wallet";

  export interface ShamirShareGeneratorProps {
    label?: string;
  }

  let { label = "Key" }: ShamirShareGeneratorProps = $props();

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

      console.log(
        `generating shares for ${entropy} (${min} of ${total} scheme)`
      );
      generatedShares = createShares(wallet, min, total);

      console.log(`Successfully generated ${generatedShares.length} shares:`);
      generatedShares.forEach((share, index) => {
        console.log(
          `Share ${index + 1}: [index: ${share[0]}, entropy: ${shareValueToEntropyHex(share[1])}]`
        );
      });

      error = "";
    } catch (err) {
      console.error("Error generating shares:", err);
      error = err instanceof Error ? err.message : "Failed to generate shares";
      generatedShares = [];
    }
  }

  // Handle wallet input changes
  function handleWalletChange(newWallet: Wallet) {
    console.log(newWallet);

    wallet = newWallet;
    entropy = wallet.entropy;
    generateShares();
  }
</script>

<div class="flex flex-col gap-6 p-4">
  <!-- Source Wallet Input -->
  <div class="w-full">
    <WalletInput {label} {entropy} onchange={handleWalletChange} />
  </div>

  <!-- Configuration Options -->
  <div class="flex gap-8 items-center">
    <div class="flex-1 border border-black-20 p-3">
      <RadioGroup
        options={minShareOptions}
        bind:value={minShares}
        maxOptionsPerColumn={2}
        onChange={(value, index) => generateShares()}
      />
    </div>
    <div>of</div>
    <div class="flex-1 border border-black-20 p-3">
      <RadioGroup
        options={totalShareOptions}
        bind:value={totalShares}
        onChange={(value, index) => generateShares()}
      />
    </div>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="text-red-100 text-sm" role="alert">
      {error}
    </div>
  {/if}

  <!-- Generated Shares -->
  {#if generatedShares.length > 0}
    <div class="flex flex-col gap-4">
      <h3 class="text-lg font-medium">Generated Shares</h3>

      <div class="flex flex-col gap-4">
        {#each generatedShares as share, i}
          <ShamirShareInput
            disabled={true}
            shareIndex={share[0].toString()}
            shareEntropy={shareValueToEntropyHex(share[1])}
          />
        {/each}
      </div>

      <p class="text-sm text-black-60">
        Any {minShares} of these {generatedShares.length} shares can be used to reconstruct
        the original wallet.
      </p>
    </div>
  {/if}
</div>
