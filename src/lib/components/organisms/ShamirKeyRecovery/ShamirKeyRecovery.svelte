<script lang="ts">
  import { Button, RadioGroup } from "$components/atoms";
  import { ShamirShareInput, WalletInput } from "$components/molecules";
  import type { SharesReport } from "$components/organisms";
  import {
    recoverWalletFromShares,
    ShamirShare,
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

  let targetEntropy = $state("");
  let recoveredWallet = $state<Wallet | null>(null);
  let error = $state("");

  const requiredSharesOptions = ["2", "3", "4", "5"];
  let requiredShares: number | undefined = $state(undefined);
  let shares: ShamirShare[] = $state([]);

  function processShareReport() {
    try {
      const reportData = JSON.parse(sharesReport) as SharesReport;

      requiredShares = reportData.minimum;
      targetEntropy = reportData.entropy;

      const reportShares = reportData.shares;
      const selectedShares = reportShares
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, requiredShares);

      shares = selectedShares.map((reportShare) => {
        return ShamirShare.create(
          reportShare.index,
          reportShare.value,
          reportShare.isIndexed
        );
      });

      error = "";
    } catch (err) {
      console.error("Error parsing shares report:", err);
      error = "Invalid shares report format";
    }
  }

  function recoverWallet() {
    try {
      console.log(`recovering wallet from ${requiredShares} shares...`);
      shares.forEach((s) => {
        console.log(s);
      });
      if (!requiredShares) {
        throw new Error("required shares has not been set");
      }

      recoveredWallet = recoverWalletFromShares(
        requiredShares,
        shares.slice(0, requiredShares)
      );

      const matchesTargetEntropy = recoveredWallet.entropy == targetEntropy;

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
      console.log(`updated share ${index} to ${share}`);
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
          value={requiredShares ? requiredShares?.toString() : undefined}
          maxOptionsPerColumn={2}
          transpose
          onChange={(value, _) => {
            console.log(`changed required shares to ${value}`);
            requiredShares = parseInt(value);
            while (shares.length < requiredShares) {
              shares.push(new ShamirShare());
            }
          }}
        />
      </div>
    </div>

    {#each shares.slice(0, requiredShares) as share, index}
      <div class="flex gap-4 items-center">
        <div class="flex-grow">
          {#if share}
            <ShamirShareInput
              {share}
              disabled={false}
              showCopyButton={false}
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
          <WalletInput
            entropy={recoveredWallet.entropy}
            label={`RECOVERED WALLET ${
              recoveredWallet.entropy === targetEntropy
                ? "MATCHES"
                : "DOES NOT MATCH "
            } GENERATED SHARES TAB CONTENT`}
            disabled
          />
        </div>
      </div>
    </div>
  {/if}
</div>
