<script lang="ts">
  import type { ButtonSize, ButtonVariant } from "$components/atoms";
  import { Button, CheckBox, Input, RadioGroup } from "$components/atoms";
  import { ComponentTestFixture } from "$components/routes/test";

  // State management
  let loading = $state(false);
  let disabled = $state(false);
  let label = $state("Click me");
  let variant: ButtonVariant = $state("primary");
  let size: ButtonSize = $state("md");

  // Status messages
  let clickMessage = $state("");
  let timeRemaining = $state("");
  let timerInterval: ReturnType<typeof setInterval>;

  // Options for RadioGroup components
  const variantOptions: ButtonVariant[] = ["primary", "secondary", "outline"];
  const sizeOptions: ButtonSize[] = ["sm", "md", "lg"];

  function handleClick() {
    clickMessage = `Clicked on "${label}"`;
    loading = true;

    const startTime = Date.now();
    const duration = 1000; // 1 second

    // Clear any existing interval
    if (timerInterval) clearInterval(timerInterval);

    // Update time remaining every 20ms
    timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      timeRemaining = remaining > 0 ? `(${remaining}ms remaining)` : "";

      if (remaining <= 0) {
        clearInterval(timerInterval);
        loading = false;
        clickMessage = "";
      }
    }, 20);
  }
</script>

<ComponentTestFixture testedComponent="atoms/Button">
  {#snippet controls()}
    <div class="flex flex-col gap-4 w-full max-w-md">
      <!-- Label Input -->
      <Input
        label="Button Label"
        bind:value={label}
        placeholder="Enter button text"
      />

      <!-- Variant Selection -->
      <RadioGroup
        label="Variant"
        options={variantOptions}
        bind:value={variant}
        letterWidthPx={12}
        maxOptionsPerColumn={3}
      />

      <!-- Size Selection -->
      <RadioGroup
        label="Size"
        options={sizeOptions}
        bind:value={size}
        letterWidthPx={8}
        maxOptionsPerColumn={3}
      />

      <!-- Disabled State -->
      <CheckBox label="Disabled" bind:value={disabled} variant="default" />

      <!-- on click -->
      <div class="flex flex-col gap-2 text-sm">
        <p class="h-[1.5rem]">{clickMessage || "\u00A0"}</p>
      </div>
    </div>
  {/snippet}

  {#snippet component()}
    <Button {variant} {size} {disabled} {loading} onclick={handleClick}>
      {label}
    </Button>
  {/snippet}
</ComponentTestFixture>
