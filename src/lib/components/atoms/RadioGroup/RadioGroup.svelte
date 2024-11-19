<script module lang="ts">
  export interface RadioGroupProps {
    label?: string | null;
    options: string[];
    value?: string | undefined;
    index?: number | undefined;
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
    index = undefined,
    required = false,
    letterWidthPx = 10,
    maxOptionsPerColumn = 5,
    transpose = false,
    onChange = (_value, _index) => {},
  }: RadioGroupProps = $props();

  let selectedIndex = $state(index ?? undefined);

  // Keep internal state in sync with external index
  $effect(() => {
    if (selectedIndex != index) {
      selectedIndex = index;
    }
  });

  const maxStringLength = $derived(Math.max(...options.map((o) => o?.length)));
  const columnWidth = $derived(letterWidthPx * (maxStringLength + 5));
  const groupName = $derived(options.join(""));

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
          checked={selectedIndex === optionIndex}
          onchange={() => {
            selectedIndex = optionIndex;
            onChange(option, optionIndex);
          }}
          class="m-1"
        />
        <label for={`${groupName}-${optionIndex}`}>
          {toTitle(option)}
        </label>
      </div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .required {
    @apply after:ml-0.5 after:text-red-100 after:content-['*'];
  }
</style>
