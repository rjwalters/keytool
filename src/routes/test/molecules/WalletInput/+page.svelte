<script lang="ts">
  import { Button, CheckBox, Input } from "$components/atoms";
  import { WalletInput } from "$components/molecules";
  import { ComponentTestFixture } from "$components/routes/test";
  import { generateWallet, type Wallet } from "$utils/wallet";

  // State management
  let value = $state("");
  let label = $state("Test Wallet");
  let disabled = $state(false);
  let required = $state(false);

  // Message display
  let changeMessage = $state("");

  function handleChange(wallet: Wallet) {
    changeMessage = `Changed entropy to: ${wallet.entropy}`;
    setTimeout(() => {
      changeMessage = "";
    }, 5000);
  }

  // Generate sample wallet
  function generateSample(bits: number) {
    const wallet = generateWallet(bits);
    value = wallet.entropy;
  }
</script>

<ComponentTestFixture testedComponent="molecules/WalletInput">
  {#snippet controls()}
    <div class="flex flex-col gap-4 w-full max-w-md">
      <!-- Label Input -->
      <Input
        label="Label Text"
        bind:value={label}
        placeholder="Enter label text"
      />

      <!-- Toggle Controls -->
      <div class="flex gap-4">
        <CheckBox bind:value={disabled} label="Disabled" />
        <CheckBox bind:value={required} label="Required" />
      </div>

      <!-- Sample Generator -->
      <div class="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onclick={() => generateSample(128)}
        >
          Generate 128-bit
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onclick={() => generateSample(256)}
        >
          Generate 256-bit
        </Button>
      </div>

      <!-- Message Display -->
      <div class="flex flex-col gap-2 text-sm">
        <p class="h-[1.5rem]">{changeMessage || "\u00A0"}</p>
      </div>
    </div>
  {/snippet}

  {#snippet component()}
    <WalletInput
      bind:value
      {label}
      {disabled}
      {required}
      onchange={handleChange}
    />
  {/snippet}
</ComponentTestFixture>
