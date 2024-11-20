<script module lang="ts">
  export interface SharesReportShare {
    index: string;
    value: string; // a hex string
    isIndexed: boolean;
  }

  export interface SharesReport {
    entropy: string; // a hex string
    minimum: number;
    total: number;
    shares: SharesReportShare[];
  }
</script>

<script lang="ts">
  import { Button } from "$components/atoms";
  import {
    ShamirSchemeSelector,
    ShamirShareInput,
    WalletInput,
  } from "$components/molecules";
  import {
    createIndexedShares,
    createShares,
    isIndexed,
    shareValueToEntropyHex,
    type ShamirShare,
    type Wallet,
  } from "$utils/wallet";

  export interface ShamirShareGeneratorProps {
    label?: string;
    sharesReport?: string;
  }

  let {
    label = "Your Secret Key",
    sharesReport = $bindable(""),
  }: ShamirShareGeneratorProps = $props();

  // Component state
  let wallet = $state<Wallet | null>(null);
  let entropy = $state("");
  let requiredShares = $state(3);
  let totalShares = $state(5);

  let generatedShares = $state<ShamirShare[]>([]);
  let error = $state("");

  // Generate shares when wallet or configuration changes
  function generateShares(
    makeShares: (
      wallet: Wallet,
      minimum: number,
      shares: number
    ) => ShamirShare[] = createShares
  ) {
    if (!wallet) {
      console.error("no source wallet");
      generatedShares = [];
      error = "";
      return;
    }

    try {
      if (requiredShares > totalShares) {
        error = "Required shares cannot exceed total shares";
        generatedShares = [];
        return;
      }

      generatedShares = makeShares(wallet, requiredShares, totalShares);

      const reportData: SharesReport = {
        entropy,
        minimum: requiredShares,
        total: totalShares,
        shares: generatedShares.map((share) => ({
          index: share[0].toString(),
          value: shareValueToEntropyHex(share[1]),
          isIndexed: isIndexed(share),
        })),
      };

      sharesReport = JSON.stringify(reportData, null, 2);
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
    requiredShares = required;
    totalShares = total;
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
    <WalletInput
      {label}
      {entropy}
      showGenerationButtons
      onchange={handleWalletChange}
    />
  </div>

  {#if wallet}
    <!-- Configuration Options -->
    <ShamirSchemeSelector
      {requiredShares}
      {totalShares}
      onChange={handleSchemeChange}
    />

    <!-- Generated Shares -->
    {#if generatedShares.length > 0}
      <div class="flex flex-col gap-4">
        <div class="flex space-beween gap-x-8">
          <h3 class="text-lg font-medium w-full">Generated Shares</h3>
          <div class="w-64">
            <Button
              variant="secondary"
              size="md"
              onclick={() => generateShares()}
            >
              Standard Shares
            </Button>
          </div>
          <div class="w-64">
            <Button
              variant="secondary"
              size="md"
              onclick={() => generateShares(createIndexedShares)}
            >
              Indexed Shares
            </Button>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          {#each generatedShares as share, i}
            <ShamirShareInput
              disabled={true}
              shareIndex={parseInt(share[0].toString(10))}
              shareEntropy={shareValueToEntropyHex(share[1])}
            />
          {/each}
        </div>

        <div class="flex space-beween gap-x-8">
          <p class="text-sm text-black-60 w-full">
            Any {requiredShares} of these {generatedShares.length} shares can be
            used to reconstruct the original wallet. If you are using Standard Shares,
            you must provide both the index and the share value. If you are using
            Indexed Shares, the index is encoded within the share value.
          </p>
          <div class="w-48">
            <Button
              variant="secondary"
              size="md"
              onclick={() => copyAllToClipboard()}
            >
              Copy Report
            </Button>
          </div>
          <div class="w-48">
            <Button
              variant="secondary"
              size="md"
              onclick={() => console.log(sharesReport)}
            >
              Log Report
            </Button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Error Display -->
    {#if error}
      <div class="text-red-100 text-sm" role="alert">
        {error}
      </div>
    {/if}
  {/if}
</div>
