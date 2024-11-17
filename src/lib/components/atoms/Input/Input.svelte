<script module lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  export type InputVariant = "text" | "number";

  export interface InputProps
    extends Omit<HTMLInputAttributes, "size" | "type"> {
    value: string | number;
    variant?: InputVariant;
    label?: string;
    error?: string;
  }
</script>

<script lang="ts">
  let {
    value = $bindable(""),
    variant = "text",
    label,
    placeholder = "",
    error,
    disabled = false,
    required = false,
    ...others
  }: InputProps = $props();

  const id = $derived(`input-${crypto.randomUUID()}`);
</script>

<div class="flex flex-col items-start justify-between w-full">
  {#if label}
    <label for={id} class="mb-1 text-sm font-medium text-black-80">
      {label}
      {#if required}
        <span class="text-red-100">*</span>
      {/if}
    </label>
  {/if}

  <input
    {id}
    bind:value
    type={variant}
    {placeholder}
    {disabled}
    {required}
    class={[
      "w-full",
      "px-3",
      "py-2",
      "border",
      "rounded-md",
      "bg-white",
      "transition-all",
      "duration-200",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-black-80",
      "disabled:bg-black-50",
      "disabled:cursor-not-allowed",
      error ? "border-red-40" : "border-black-40",
    ].join(" ")}
    {...others}
  />

  {#if error}
    <p class="mt-1 text-sm text-red-100" role="alert">{error}</p>
  {/if}
</div>
