<script lang="ts">
  import {
    CheckBox,
    Input,
    RadioGroup,
    type CheckBoxVariant,
  } from "$components/atoms";
  import { ComponentTestFixture } from "$components/routes/test";

  // State with explicit typing
  let changeMessage = $state("");
  let value = $state(false);
  let isDisabled = $state(false);
  let selectedVariant = $state<CheckBoxVariant>("default");
  let selectedVariantIndex = $state(0);
  let customLabel = $state("My CheckBox");

  // Variant options array for type safety
  const variants: CheckBoxVariant[] = ["default", "indicator"];

  function handleChange(newValue: boolean) {
    changeMessage = `Changed to ${newValue}`;
    setTimeout(() => {
      changeMessage = "";
    }, 2000);
  }
</script>

<ComponentTestFixture testedComponent="atoms/CheckBox">
  {#snippet controls()}
    <div class="flex flex-col gap-4 w-full max-w-md">
      <!-- Variant Selection -->
      <RadioGroup
        label="Variant"
        options={variants}
        bind:value={selectedVariant}
        bind:index={selectedVariantIndex}
        letterWidthPx={12}
        maxOptionsPerColumn={2}
      />

      <!-- Label Input -->
      <Input
        label="Checkbox Label"
        bind:value={customLabel}
        placeholder="Enter checkbox label"
      />

      <!-- Disabled Toggle -->
      <CheckBox
        label="Disabled State"
        bind:value={isDisabled}
        variant="default"
      />

      <!-- Test Value Toggle -->
      <CheckBox bind:value label="Toggle Value" variant="default" />

      <!-- Message Display -->
      <div class="flex flex-col gap-2 text-sm">
        <p class="h-[1.5rem]">{changeMessage || "\u00A0"}</p>
      </div>
    </div>
  {/snippet}

  {#snippet component()}
    <CheckBox
      bind:value
      variant={selectedVariant}
      label={customLabel}
      disabled={isDisabled}
      onchange={handleChange}
    />
  {/snippet}
</ComponentTestFixture>
