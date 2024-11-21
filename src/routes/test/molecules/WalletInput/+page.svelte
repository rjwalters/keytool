<script lang="ts">
  import { Button, CheckBox, Input } from "$components/atoms";
  import {
    WalletInput,
    type WalletInputDisplayMode,
  } from "$components/molecules";
  import { ComponentTestFixture } from "$components/routes/test";
  import { generateWallet, type Wallet } from "$utils/wallet";

  // State management
  let entropy = $state("");
  let label = $state("Test Wallet");
  let disabled = $state(false);
  let required = $state(false);
  let showGenerationButtons = $state(false);
  let showCopyButton = $state(false);
  let hiddenModes = $state<WalletInputDisplayMode[]>([]);

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
    entropy = wallet.entropy;
  }

  // Mode visibility controls
  const availableModes: Array<{
    id: WalletInputDisplayMode;
    label: string;
  }> = [
    { id: "entropy", label: "Hex" },
    { id: "mnemonic", label: "Words" },
    { id: "grid", label: "Grid" },
    { id: "addresses", label: "Addresses" },
  ];

  function toggleMode(mode: WalletInputDisplayMode) {
    if (hiddenModes.includes(mode)) {
      hiddenModes = hiddenModes.filter((m) => m !== mode);
    } else {
      hiddenModes = [...hiddenModes, mode];
    }
  }
</script>

<ComponentTestFixture testedComponent="molecules/WalletInput">
  {#snippet controls()}
    <div class="flex w-full flex-col gap-4">
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
        <CheckBox
          bind:value={showGenerationButtons}
          label="Generation Buttons"
        />
        <CheckBox bind:value={showCopyButton} label="Copy Button" />
      </div>

      <!-- Display Mode Controls -->
      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium text-black-80">Hidden Modes</p>
        <div class="flex flex-wrap gap-2">
          {#each availableModes as mode}
            <CheckBox
              value={hiddenModes.includes(mode.id)}
              label={mode.label}
              onchange={() => toggleMode(mode.id)}
            />
          {/each}
        </div>
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
      bind:entropy
      {label}
      {disabled}
      {required}
      {hiddenModes}
      {showGenerationButtons}
      {showCopyButton}
      onChange={handleChange}
    />
  {/snippet}
</ComponentTestFixture>
