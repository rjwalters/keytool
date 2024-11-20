<script lang="ts">
  import { Button, RadioGroup } from "$components/atoms";
  import { ShamirShareInput } from "$components/molecules";
  import type { SharesReport } from "$components/organisms";
  import {
    recoverWalletFromShares,
    shareValueToEntropyHex,
    type ShamirShare,
    type Wallet,
  } from "$utils/wallet";

  export interface ShamirShareRecoveryProps {
    sharesReport?: string;
    loadFromSharesReport?: boolean;
  }

  let {
    sharesReport = "",
    loadFromSharesReport = $bindable(false),
  }: ShamirShareRecoveryProps = $props();

  // watch for load shares report signal and reset
  $effect(() => {
    if (loadFromSharesReport) {
      // console.log(`detected request to load shares report`);
      processShareReport();
      loadFromSharesReport = false;
    }
  });

  const MAX_SHARES = 5;

  // Initialize array of up to 5 potential shares
  let shares = $state<ShamirShare[]>(Array(MAX_SHARES));

  let recoveredWallet = $state<Wallet | null>(null);
  let error = $state("");
  let minimum = $state("3");

  const requiredSharesOptions = ["2", "3", "4", "5"];
  let requiredShares = $state(3);

  let targetEntropy = $state("");

  function processShareReport() {
    try {
      const reportData = JSON.parse(sharesReport) as SharesReport;

      requiredShares = reportData.minimum;
      targetEntropy = reportData.entropy;

      const reportShares = reportData.shares;
      const selectedShares = reportShares
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, requiredShares);

      shares = selectedShares.map((share) => {
        let value = BigInt(share.value);

        if (share.isIndexed) {
          // recover share index from lowest 8 bits
          return [value & 0xffn, value];
        } else {
          return [BigInt(parseInt(share.index)), value];
        }
      });

      error = "";
    } catch (err) {
      console.error("Error parsing shares report:", err);
      error = "Invalid shares report format";
    }
  }

  function recoverWallet() {
    try {
      console.log("recovering wallet");
      shares.forEach((s) => {
        console.log(s[0].toString(10), shareValueToEntropyHex(s[1]));
      });
      recoveredWallet = recoverWalletFromShares(parseInt(minimum), shares);
      let matchesTargetEntropy = recoveredWallet.entropy == targetEntropy;
      console.log(
        `recovered entropy: ${recoveredWallet.entropy} ${matchesTargetEntropy ? "(matches target)" : "DOES NOT MATCH TARGET!"}`
      );
      error = "";
    } catch (err) {
      console.error("Error recovering wallet:", err);
      error = err instanceof Error ? err.message : "Failed to recover wallet";
      recoveredWallet = null;
    }
  }

  function handleShareChange(index: number, share: ShamirShare | undefined) {
    if (share) {
      console.log(
        `updated share ${index} to [${share[0].toString(10)},${shareValueToEntropyHex(share[1])}]`
      );
      shares[index] = share;
    }
  }
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-col gap-4">
    <div class="flex gap-8 items-center">
      <div class="flex-1 border border-black-20 p-3">
        <p class="medium pb-4">Required Shares</p>
        <RadioGroup
          options={requiredSharesOptions}
          value={requiredShares.toString()}
          maxOptionsPerColumn={2}
          transpose
          onChange={(value, _) => {
            requiredShares = parseInt(value);
          }}
        />
      </div>
    </div>

    {#each shares.slice(0, requiredShares) as share, index}
      <div class="flex gap-4 items-center">
        <div class="flex-grow">
          {#if share}
            <ShamirShareInput
              disabled={false}
              showCopyButton={false}
              shareIndex={parseInt(share[0].toString(10))}
              shareEntropy={shareValueToEntropyHex(share[1])}
              onChange={(share) => handleShareChange(index, share)}
            />
          {/if}
        </div>
      </div>
    {/each}
  </div>

  {#if error}
    <div class="text-red-100 text-sm" role="alert">
      {error}
    </div>
  {/if}

  <div class="flex justify-between items-center">
    <Button variant="primary" size="lg" onclick={recoverWallet}>
      Recover Wallet
    </Button>
  </div>

  {#if recoveredWallet}
    <div
      class="mt-4 p-4 rounded-md"
      class:bg-green-10={recoveredWallet.entropy === targetEntropy}
      class:bg-black-10={recoveredWallet.entropy !== targetEntropy}
    >
      <div class="flex flex-col gap-2">
        <div class="flex">
          <div class="w-5/6">
            <span class="ml-2 font-mono break-all"
              >{recoveredWallet.mnemonic}</span
            >
          </div>
          <div class="w-1/6">
            {#if recoveredWallet.entropy === targetEntropy}
              (matches generated shares)
            {:else}
              DOES NOT MATCH GENERATED SHARES
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
