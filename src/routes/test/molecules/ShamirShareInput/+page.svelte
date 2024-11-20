<script lang="ts">
  import { Button, CheckBox, Input } from "$components/atoms";
  import { ShamirShareInput } from "$components/molecules";
  import { ComponentTestFixture } from "$components/routes/test";
  import { recoverShareIndex, type ShamirShare } from "$utils/wallet";

  // State management
  let shareIndex: number | undefined = $state(undefined);
  let shareEntropy = $state("");
  let label = $state("Test Share");
  let disabled = $state(false);
  let required = $state(false);
  let isIndexed = $state(false);

  let share: ShamirShare = $derived([
    BigInt(shareIndex || 0),
    BigInt(shareEntropy),
  ]);

  // Message display
  let changeMessage = $state("");

  function handleChange(newShare: ShamirShare | undefined) {
    if (newShare) {
      changeMessage = `Changed share to: [${newShare[0]}, ${newShare[1]}]`;
    } else {
      changeMessage = "Share cleared or invalid";
    }
    setTimeout(() => {
      changeMessage = "";
    }, 5000);
  }

  // Generate sample share
  function generateSample(bits: number) {
    // Generate a random value with the specified number of bits
    const valueBytes = new Uint8Array(bits / 8);
    crypto.getRandomValues(valueBytes);

    shareEntropy =
      "0x" +
      Array.from(valueBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    if (!isIndexed) {
      // Generate a random index between 1 and 10
      shareIndex = Math.floor(Math.random() * 10) + 1;
    } else {
      shareIndex = Number(recoverShareIndex(share));
    }
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
    <div class="flex flex-col gap-4 w-full">
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
        <CheckBox bind:value={isIndexed} label="Indexed Share" />
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

      <!-- Current Share Display -->
      {#if shareIndex || shareEntropy}
        <div class="w-full flex flex-col gap-1">
          <div class="w-full text-sm bg-black-05 p-2 rounded">
            <div class="flex gap-2">
              <span class="text-black-60 w-16">Index:</span>
              <span class="font-mono">{shareIndex || "empty"}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-black-60 w-16">Value:</span>
              <span class="font-mono"
                >{formatShareValue(shareEntropy) || "empty"}</span
              >
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/snippet}

  {#snippet component()}
    <ShamirShareInput
      bind:isIndexed
      bind:shareIndex
      bind:shareEntropy
      {label}
      {disabled}
      {required}
      onChange={handleChange}
    />
  {/snippet}
</ComponentTestFixture>
