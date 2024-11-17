<script module lang="ts">
  export type CheckBoxVariant = "default" | "indicator";
  export interface CheckBoxProps {
    value: boolean;
    variant?: CheckBoxVariant;
    name?: string;
    label?: string;
    onchange?: (value: boolean) => void;
    disabled?: boolean;
  }

  interface CheckboxSnippetProps {
    containerClasses: string;
    inputClasses: string;
    labelClasses?: string;
  }
</script>

<script lang="ts">
  import { isAriaIntent } from "$utils/aria";

  let {
    value = $bindable(false),
    variant = "default",
    name = "option",
    label = "",
    onchange = (_value: boolean) => {},
    disabled = false,
  }: CheckBoxProps = $props();

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.checked;
    onchange(value);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (isAriaIntent(e)) {
      value = !value;
      onchange(value);
    }
  }
</script>

{#snippet CheckBoxInput(
  containerClasses: string,
  inputClasses: string,
  labelClasses = ""
)}
  <div class={`flex content-center items-center ${containerClasses}`}>
    <input
      type="checkbox"
      id="{name}_{variant}"
      bind:checked={value}
      onchange={handleChange}
      onkeydown={handleKeyDown}
      class={`transition-all ${inputClasses}`}
      disabled={variant === "indicator" || disabled}
    />
    {#if label}
      <label for="{name}_{variant}" class={` ${labelClasses}`}>
        {label || name}
      </label>
    {/if}
  </div>
{/snippet}

{#if variant === "default"}
  {@render CheckBoxInput(
    `gap-4 p-2 ${disabled ? "cursor-not-allowed" : ""}`,
    `h-6 w-6 border-2 border-purple-100 text-purple-100 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`,
    disabled ? "cursor-not-allowed" : "cursor-pointer"
  )}
{:else}
  {@render CheckBoxInput(
    "",
    "appearance-none h-4 w-4 rounded-full bg-red-100 checked:bg-green-100",
    "ml-2"
  )}
{/if}
