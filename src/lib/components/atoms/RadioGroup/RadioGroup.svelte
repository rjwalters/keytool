<script module lang="ts">
  export interface RadioGroupProps {
    label?: string | null;
    options: string[];
    value?: string;
    required?: boolean;
    letterWidthPx?: number;
    maxOptionsPerColumn?: number;
    transpose?: boolean;
    onChange?: (value: string, index: number) => void;
  }
</script>

<script lang="ts">
  import { toTitle } from "$utils/text";

  let {
    label = null,
    options = [],
    value = $bindable(undefined),
    required = false,
    letterWidthPx = 10,
    maxOptionsPerColumn = 5,
    transpose = false,
    onChange = (_value, _index) => {},
  }: RadioGroupProps = $props();

  // Helper function to safely get index
  const getIndex = (value: string | undefined): number => {
    if (value === undefined) return -1;
    return options.indexOf(value);
  };

  let selectedIndex: number = $state(getIndex(value));

  // Keep internal state in sync with external change
  $effect(() => {
    const index = getIndex(value);
    if (selectedIndex != index) {
      // console.log(`detected external change to index ${index}`);
      selectedIndex = index;
    }
  });

  // Handle selection change
  const handleChange = (newValue: string, index: number) => {
    selectedIndex = index;
    value = newValue;
    onChange(newValue, index);
  };

  const maxStringLength = $derived(Math.max(...options.map((o) => o?.length)));
  const columnWidth = $derived(letterWidthPx * (maxStringLength + 5));
  const groupName = $derived(
    `radio-group-${options.map((o) => o.replace(/[^a-z0-9]/gi, "")).join("-")}`
  );

  // Calculate optimal rows and columns based on transpose mode
  function gridDimensions(): { cols: number; rows: number } {
    if (transpose) {
      // When transposed, we want to fill rows first
      const optimalRowCount = Math.ceil(Math.sqrt(options.length));
      const rows = Math.min(optimalRowCount, maxOptionsPerColumn);
      const cols = Math.ceil(options.length / rows);
      return { rows, cols };
    } else {
      // Normal mode: limit by maxOptionsPerColumn
      const rows = Math.min(options.length, maxOptionsPerColumn);
      const cols = Math.ceil(options.length / maxOptionsPerColumn);
      return { rows, cols };
    }
  }

  const error = $derived.by(() => {
    const seen = new Set<string>();
    for (const option of options) {
      if (seen.has(option)) {
        return `Duplicate option "${option}" found...`;
      }
      seen.add(option);
    }
    return null;
  });
</script>

<div class="flex w-full flex-col">
  {#if label}
    <div class="mb-1.5 leading-[160%] text-black-80" class:required>
      {label}
    </div>
  {/if}

  <div
    class="grid place-items-start gap-x-2 gap-y-1"
    style="
     grid-template-columns: repeat({gridDimensions()
      .cols}, minmax({columnWidth}px, 1fr));
      grid-template-rows: repeat({gridDimensions().rows}, min-content);
      grid-auto-flow: {transpose ? 'column' : 'row'};
    "
  >
    {#each options as option, optionIndex}
      <div class="w-fit">
        <input
          type="radio"
          id={`${groupName}-${optionIndex}`}
          name={groupName}
          value={optionIndex}
          checked={optionIndex == selectedIndex}
          onchange={() => {
            handleChange(option, optionIndex);
          }}
          class="m-1"
        />
        <label for={`${groupName}-${optionIndex}`}>
          {toTitle(option)}
        </label>
      </div>
    {/each}
  </div>

  {#if error}
    <div class="text-red-100 text-sm my-2">
      {error}
    </div>
  {/if}
</div>

<style lang="postcss">
  .required {
    @apply after:ml-0.5 after:text-red-100 after:content-['*'];
  }
</style>
