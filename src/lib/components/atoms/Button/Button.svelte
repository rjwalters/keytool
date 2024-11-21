<script module lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  export type ButtonVariant = "primary" | "secondary" | "outline";
  export type ButtonSize = "sm" | "md" | "lg";

  export interface ButtonProps extends Omit<HTMLButtonAttributes, "size"> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    children?: Snippet;
  }
</script>

<script lang="ts">
  const {
    variant = "primary",
    size = "md",
    loading = false,
    children,
    ...others
  }: ButtonProps = $props();

  // Size and variant mappings
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm rounded-md !h-8",
    md: "px-4 py-2 text-base rounded-md !h-10",
    lg: "px-6 py-3 text-lg rounded-md !h-12",
  };

  const spinnerSizes: Record<ButtonSize, string> = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-blue-50 hover:bg-blue-60 disabled:bg-black-20",
    secondary: "bg-black-20 hover:bg-black-30 disabled:bg-black-5",
    outline:
      "border border-black-30 hover:bg-black-10 disabled:border-black-20",
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: "[&:not(:disabled)]:text-black-90 disabled:text-black-40",
    secondary: "[&:not(:disabled)]:text-black-70 disabled:text-black-40",
    outline: "[&:not(:disabled)]:text-black-100 disabled:text-black-40",
  };

  // Derive classes using $derived
  const classes = $derived(`
    w-full
    items-center
    justify-center
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${loading ? "cursor-wait" : "cursor-pointer"}
    disabled:cursor-not-allowed
    ${textColors[variant]}
  `);
</script>

<button type="button" class={classes} {...others}>
  {#if loading}
    <div
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <svg
        class={`animate-spin ${spinnerSizes[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  {/if}
  <span class={loading ? "invisible" : "visible"}>
    {@render children?.()}
  </span>
</button>

<style lang="postcss">
  /* hack to fix tailwind blue rings */
  button:focus,
  button:focus-visible {
    outline: 0px !important;
  }
</style>
