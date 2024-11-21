<script module lang="ts">
  export interface SharesReportShare {
    index: number;
    value: string; // a hex string
    isIndexed: boolean;
    mnemonic: string;
  }

  export interface SharesReport {
    entropy: string; // a hex string
    mnemonic: string;
    minimum: number;
    total: number;
    shares: SharesReportShare[];
  }
</script>

<script lang="ts">
  import { fade, scale } from "svelte/transition";

  import { Button } from "$components/atoms";
  import {
    ShamirSchemeSelector,
    ShamirShareInput,
    WalletInput,
  } from "$components/molecules";
  import {
    createIndexedShares,
    createShares,
    walletFromEntropy,
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

  let showGeneratingModal = $state(false);
  let error = $state("");

  // Generate shares when wallet or configuration changes
  async function generateShares(generateIndexedShares = false) {
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

      const makeShares: (
        wallet: Wallet,
        minimum: number,
        shares: number,
      ) => ShamirShare[] = generateIndexedShares
        ? createIndexedShares
        : createShares;

      if (generateIndexedShares && totalShares > 6) {
        showGeneratingModal = true;
        // Ensure modal has time to render before heavy computation
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Wrap the share generation in a Promise to ensure it's async
      generatedShares = makeShares(wallet, requiredShares, totalShares);

      const reportData: SharesReport = {
        entropy,
        mnemonic: walletFromEntropy(entropy).mnemonic,
        minimum: requiredShares,
        total: totalShares,
        shares: generatedShares.map((share) => ({
          index: share.index,
          value: share.entropyHex,
          isIndexed: share.isIndexed,
          mnemonic: walletFromEntropy(share.entropyHex).mnemonic,
        })),
      };

      sharesReport = JSON.stringify(reportData, null, 2);
      error = "";
      showGeneratingModal = false;
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
    console.log(`regenerating ${totalShares} shares on wallet change`);
    generateShares();
  }

  function handleSchemeChange(required: number, total: number) {
    const shouldRegenerate =
      required !== requiredShares || total > generatedShares.length;
    requiredShares = required;
    totalShares = total;
    if (shouldRegenerate) {
      console.log(`regenerating ${totalShares} shares on scheme change`);
      generateShares();
    }
  }

  // Simplify copyAllToClipboard() to use the derived state
  function copyAllToClipboard() {
    if (!wallet || generatedShares.length === 0) return;
    navigator.clipboard.writeText(sharesReport);
  }

  const isDevelopment = import.meta.env.DEV;
</script>

<!-- modal displayed when share generation is expected to take a long time-->
{#if showGeneratingModal}
  <div role="dialog" class="modal-external" transition:fade={{ duration: 200 }}>
    <div
      class="modal-popup"
      in:scale={{ duration: 350 }}
      out:fade={{ duration: 250 }}
    >
      <div class="z-[102] flex flex-col items-center justify-center gap-4 p-8">
        <div class="loading-spinner"></div>
        <div class="text-lg font-medium">
          Generating {totalShares} Indexed Shares
        </div>
        <div class="text-black-60">
          {requiredShares} required for recovery
        </div>
      </div>
    </div>
  </div>
{/if}

<div class="flex flex-col gap-6 p-4">
  <!-- Source Wallet Input -->
  <div class="w-full">
    <WalletInput
      {label}
      {entropy}
      showGenerationButtons
      onChange={handleWalletChange}
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
        <div class="space-beween flex gap-x-8">
          <h3 class="w-full text-lg font-medium">Generated Shares</h3>
          <div class="w-64">
            <Button
              variant="secondary"
              size="md"
              onclick={() => {
                console.log(
                  `generating ${totalShares} standard shares at user's request`,
                );
                generateShares();
              }}
            >
              Standard Shares
            </Button>
          </div>
          <div class="w-64">
            <Button
              variant="secondary"
              size="md"
              onclick={() => {
                console.log(
                  `generating ${totalShares} indexed shares at user's request`,
                );
                generateShares(true);
              }}
            >
              Indexed Shares
            </Button>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          {#each generatedShares.slice(0, totalShares) as share, i}
            <ShamirShareInput disabled={true} {share} />
          {/each}
        </div>

        <div class="space-beween flex gap-x-8">
          <div class="flex flex-col gap-3">
            <p class="small">
              Any {requiredShares} of these {generatedShares.length} shares can be
              used to reconstruct the original wallet.
            </p>
            <p class="small">
              If you are using Standard Shares, you must provide both index and
              share values. If you are using Indexed Shares, the index is
              encoded within the share value.
            </p>
          </div>
          <div class="w-48">
            <Button
              variant="secondary"
              size="md"
              onclick={() => copyAllToClipboard()}
            >
              Copy Report
            </Button>
          </div>
          {#if isDevelopment}
            <div class="w-48">
              <Button
                variant="secondary"
                size="md"
                onclick={() => console.log(sharesReport)}
              >
                Log Report
              </Button>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Error Display -->
    {#if error}
      <div class="text-sm text-red-100" role="alert">
        {error}
      </div>
    {/if}
  {/if}
</div>

<style lang="postcss">
  .modal-external {
    @apply fixed left-0 top-0 z-[100] flex h-[100svh] w-screen overflow-y-scroll;
    @apply items-start justify-center bg-black-100/40 py-[2svh] backdrop-blur-2xl md:items-center md:p-5 md:py-0;
  }
  .modal-popup {
    @apply z-[101] flex flex-col rounded-xl bg-white-100 drop-shadow-lg md:my-10 md:min-w-[440px] md:rounded-xl;
    @apply h-fit w-full overflow-visible md:w-fit md:max-w-[900px];
    scrollbar-width: none;
    max-height: calc(100vh - 10px);
  }
  .modal-popup::-webkit-scrollbar {
    display: none;
  }
  .loading-spinner {
    @apply h-12 w-12 rounded-full border-4 border-black-20;
    @apply border-t-black-60;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
