<script lang="ts">
  import { CheckBox, Input, RadioGroup } from "$components/atoms";
  import { ComponentTestFixture } from "$components/routes/test";

  // State with explicit typing
  let changeMessage = $state(" ");
  let value = $state("");
  let selectedValue: string | undefined = $state(undefined);
  let customLabel = $state("Test Radio Group");
  let isRequired = $state(false);
  let letterWidth = $state(10);
  let maxPerColumn = $state(5);
  let isTransposed = $state(false);
  const options = [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Option 5",
    "Option 6",
    "Option 7",
    "Option 8",
    "Option 9",
    "Option 10",
  ];

  function handleChange(newValue: string, index: number) {
    value = newValue;
    changeMessage = `changed to "${value}" (index: ${index})`;
    setTimeout(() => {
      changeMessage = " ";
    }, 1000);
  }
</script>

<ComponentTestFixture testedComponent="atoms/RadioGroup">
  {#snippet controls()}
    <div class="flex flex-col gap-4 w-full max-w-md">
      <!-- Label Input -->
      <Input
        label="Group Label"
        bind:value={customLabel}
        placeholder="Enter radio group label"
      />

      <!-- Letter Width Control -->
      <Input
        label="Letter Width (px)"
        variant="number"
        bind:value={letterWidth}
        placeholder="Enter width in pixels"
        required
      />

      <!-- Max Options Per Column Control -->
      <Input
        label="Max Options Per Column"
        variant="number"
        bind:value={maxPerColumn}
        placeholder="Enter max options"
        required
      />

      <!-- Value Input -->
      <Input
        label="Selected Value"
        bind:value
        onchange={() => {
          console.log(value);
          selectedValue = value;
        }}
      />

      <div class="flex gap-4">
        <!-- Required Toggle -->
        <CheckBox label="Required" bind:value={isRequired} variant="default" />

        <!-- Transpose Toggle -->
        <CheckBox
          label="Transpose"
          bind:value={isTransposed}
          variant="default"
        />
      </div>

      <!-- Message Display -->
      <div class="flex flex-col gap-2 text-sm">
        <p>Value: {selectedValue ?? "undefined"}</p>
        <p class="h-[1.5rem]">{changeMessage || "\u00A0"}</p>
      </div>
    </div>
  {/snippet}

  {#snippet component()}
    <RadioGroup
      label={customLabel}
      {options}
      bind:value={selectedValue}
      required={isRequired}
      letterWidthPx={letterWidth}
      maxOptionsPerColumn={maxPerColumn}
      transpose={isTransposed}
      onChange={handleChange}
    />
  {/snippet}
</ComponentTestFixture>
