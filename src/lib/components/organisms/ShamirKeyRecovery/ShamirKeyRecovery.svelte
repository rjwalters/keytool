<script lang="ts">
  import { Button } from "$components/atoms";
  import { ShamirShareInput } from "$components/molecules";
  import {
    recoverWalletFromShares,
    type ShamirShare,
    type Wallet,
  } from "$utils/wallet";
  import { ethers } from "ethers";

  // Initialize array of 8 potential shares
  let shares = $state<string[]>(Array(8).fill(""));
  let recoveredWallet = $state<Wallet | null>(null);
  let error = $state("");

  function validateShare(entropy: string): boolean {
    return entropy.trim() !== "" && entropy.startsWith("0x");
  }

  function recoverWallet() {
    try {
      // Filter out empty shares and convert to ShamirShare format
      const validShares: ShamirShare[] = shares
        .map((entropy, index) => ({
          entropy,
          index: index + 1,
        }))
        .filter((share) => validateShare(share.entropy))
        .map((share) => [BigInt(share.index), ethers.toBigInt(share.entropy)]);

      if (validShares.length < 2) {
        throw new Error("At least 2 valid shares are required");
      }

      recoveredWallet = recoverWalletFromShares(validShares);
      error = "";
    } catch (err) {
      console.error("Error recovering wallet:", err);
      error = err instanceof Error ? err.message : "Failed to recover wallet";
      recoveredWallet = null;
    }
  }

  function handleShareChange(index: number, value: string) {
    shares[index] = value;
    shares = [...shares]; // Trigger reactivity
    error = ""; // Clear error when input changes
    recoveredWallet = null; // Clear recovered wallet when input changes
  }
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-col gap-4">
    <h3 class="text-lg font-medium">Enter Key Shares</h3>
    <p class="text-sm text-black-60">
      Enter at least 2 valid shares to recover your wallet. Share indices are
      assigned automatically (1-8).
    </p>

    {#each shares as share, i}
      <div class="flex gap-4 items-center">
        <div class="flex-grow">
          <ShamirShareInput
            disabled={false}
            shareIndex={(i + 1).toString()}
            shareEntropy={share}
            onchange={() => {
              console.log("TODO");
            }}
          />
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
    <Button
      variant="primary"
      size="lg"
      onclick={recoverWallet}
      disabled={shares.filter(validateShare).length < 2}
    >
      Recover Wallet
    </Button>
  </div>

  {#if recoveredWallet}
    <div class="mt-4 p-4 bg-green-10 rounded-md">
      <h4 class="font-medium text-green-100 mb-2">
        Wallet Successfully Recovered!
      </h4>
      <div class="space-y-2">
        <p class="text-sm">
          <span class="font-medium">Mnemonic:</span>
          <span class="ml-2 font-mono break-all"
            >{recoveredWallet.mnemonic}</span
          >
        </p>
        <p class="text-sm">
          <span class="font-medium">Primary Address:</span>
          <span class="ml-2 font-mono">{recoveredWallet.addresses[0]}</span>
        </p>
      </div>
    </div>
  {/if}
</div>
