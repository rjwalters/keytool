<script module lang="ts">
  export interface RadioGroupProps {
    label?: string | null;
    options: string[];
    value?: string | undefined;
    index?: number | undefined;
    required?: boolean;
    letterWidthPx?: number;
    maxOptionsPerColumn?: number;
    onChange?: (value: string, index: number) => void;
  }
</script>

<script lang="ts">
  import { toTitle } from "$utils/text";
  import { untrack } from "svelte";

  let {
    label = null,
    options = [],
    value = $bindable(undefined),
    index = $bindable(undefined),
    required = false,
    letterWidthPx = 10,
    maxOptionsPerColumn = 5,
    onChange = () => {},
  }: RadioGroupProps = $props();

  // Derived values using $derived rune
  const maxStringLength = $derived(Math.max(...options.map((o) => o?.length)));
  const columnWidth = $derived(letterWidthPx * (maxStringLength + 5));
  const groupName = $derived(options.join(""));
  const numColumns = $derived(Math.ceil(options.length / maxOptionsPerColumn));

  // Initialize index when value is provided
  $effect(() => {
    const currentValue = value;
    if (currentValue !== undefined && index === undefined) {
      const foundIndex = untrack(() => options.indexOf(currentValue));
      if (foundIndex !== -1) {
        index = foundIndex;
      }
    }
  });

  // Helper function for handling change events
  function handleChange(newValue: string, newIndex: number) {
    value = newValue;
    index = newIndex;
    onChange(newValue, newIndex);
  }
</script>

<div
  class="flex w-full flex-col"
  style="--column-width: {columnWidth}px; --num-columns: {numColumns};"
>
  {#if label}
    <div class="mb-1.5 leading-[160%] text-black-80" class:required>
      {label}
    </div>
  {/if}

  <div class="grid-container place-items-start gap-x-2 gap-y-1">
    {#each options as option, i}
      <div class="w-fit">
        <input
          type="radio"
          id={`${groupName}-${i}`}
          name={groupName}
          value={i}
          checked={index === i}
          onchange={() => handleChange(option, i)}
          class="m-1"
        />
        <label for={`${groupName}-${option}`}>
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

  .grid-container {
    display: grid;
    grid-template-columns: repeat(
      var(--num-columns),
      minmax(var(--column-width), 1fr)
    );
    grid-auto-flow: row;
    grid-auto-rows: min-content;
  }
</style>
