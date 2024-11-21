<script lang="ts">
  import { Button, CheckBox, Input } from "$components/atoms";
  import { ShamirShareInput } from "$components/molecules";
  import { ComponentTestFixture } from "$components/routes/test";
  import { ShamirShare } from "$utils/wallet";

  // State management

  let label = $state("Test Share");
  let disabled = $state(false);
  let required = $state(false);
  let generateIndexed = $state(false);

  let share: ShamirShare | undefined = $state(new ShamirShare());

  // Message display
  let changeMessage = $state("");

  function handleChange(newShare: ShamirShare | undefined) {
    if (newShare) {
      changeMessage = `Changed share to: ${share}`;
    } else {
      changeMessage = "Share cleared or invalid";
    }
  }

  // Generate sample share
  function generateSample(bits: number) {
    // Generate a random value with the specified number of bits
    const valueBytes = new Uint8Array(bits / 8);
    crypto.getRandomValues(valueBytes);

    const shareEntropy =
      "0x" +
      Array.from(valueBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    const shareIndex = generateIndexed ? 0 : Math.floor(Math.random() * 10) + 1;

    share = ShamirShare.create(shareIndex, shareEntropy, generateIndexed);
  }

  // Display the formatted share value
  function formatShareValue(value: string): string {
    if (!value || !value.startsWith("0x")) return value;
    const byteLength = (value.length - 2) / 2;
    return `${value} (${byteLength} bytes)`;
  }
</script>

<ComponentTestFixture testedComponent="molecules/ShamirShareInput">
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
        <CheckBox bind:value={generateIndexed} label="Generate Indexed" />
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
        <Button
          variant="secondary"
          size="sm"
          onclick={() => (share = undefined)}
        >
          Clear
        </Button>
      </div>

      <!-- Message Display -->
      <div class="flex flex-col gap-2 text-sm">
        <p class="h-[1.5rem]">{changeMessage || "\u00A0"}</p>
      </div>

      <!-- Current Share Display -->
      {#if share}
        <div class="flex w-full flex-col gap-1">
          <div class="w-full rounded bg-black-05 p-2 text-sm">
            <div class="flex gap-2">
              <span class="w-24 text-black-60">Index:</span>
              <span class="font-mono">{share.index}</span>
            </div>
            <div class="flex gap-2">
              <span class="w-24 text-black-60">entropyHex:</span>
              <span class="font-mono">{share.entropyHex}</span>
            </div>
            <div class="flex gap-2">
              <span class="w-24 text-black-60">isIndexed:</span>
              <span class="font-mono">{share.isIndexed}</span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/snippet}

  {#snippet component()}
    <ShamirShareInput
      bind:share
      {label}
      {disabled}
      {required}
      onChange={handleChange}
    />
  {/snippet}
</ComponentTestFixture>
