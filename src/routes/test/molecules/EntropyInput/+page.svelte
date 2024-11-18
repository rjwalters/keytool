<script lang="ts">
  import { Button, CheckBox, Input } from "$components/atoms";
  import { EntropyInput } from "$components/molecules";
  import { ComponentTestFixture } from "$components/routes/test";
  import { generateWallet } from "$utils/wallet";

  // State management
  let value = $state("");
  let label = $state("Entropy");
  let error = $state("");
  let disabled = $state(false);
  let required = $state(false);

  // Message display
  let changeMessage = $state("");

  function handleChange(newValue: string) {
    changeMessage = `Changed to: ${newValue.slice(0, 20)}...`;
    setTimeout(() => {
      changeMessage = "";
    }, 2000);
  }

  // Generate sample wallet
  function generateSample(bits: number) {
    const wallet = generateWallet(bits);
    value = wallet.entropy;
  }
</script>

<ComponentTestFixture testedComponent="molecules/EntropyInput">
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

      <!-- Error Toggle -->
      <Button
        variant="outline"
        size="sm"
        onclick={() => (error = error ? "" : "This is an error message")}
      >
        Toggle Error
      </Button>

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
    <EntropyInput
      bind:value
      {label}
      {error}
      {disabled}
      {required}
      onchange={handleChange}
    />
  {/snippet}
</ComponentTestFixture>
