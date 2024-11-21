<script module lang="ts">
  export type BadgeColor =
    | "black"
    | "red"
    | "green"
    | "blue"
    | "orange"
    | "yellow"
    | "purple";
  export type BadgeSize = "sm" | "md" | "lg";

  export interface BadgeProps {
    color?: BadgeColor;
    size?: BadgeSize;
    label: string;
    disabled?: boolean;
    onClick?: (event: MouseEvent | KeyboardEvent) => void;
  }
</script>

<script lang="ts">
  import { isAriaIntent } from "$utils/aria";

  const {
    color = "green",
    size = "sm",
    label = "?",
    disabled = false,
    onClick = (_e) => {},
  }: BadgeProps = $props();

  const sizeClasses: Record<BadgeSize, string> = {
    sm: "w-min-10 text-xs rounded-md !h-6",
    md: "w-min-12 text-sm rounded-md !h-7",
    lg: "w-min-14 text-md rounded-md !h-9",
  };

  const colorClasses: Record<BadgeColor, string> = {
    black: "border-black-100 text-black-100",
    red: "border-red-100 text-red-100",
    green: "border-green-100 text-green-100",
    blue: "border-blue-100 text-blue-100",
    orange: "border-orange-100 text-orange-100",
    yellow: "border-yellow-100 text-yellow-100",
    purple: "border-purple-100 text-purple-100",
  };

  // Derive classes using $derived
  const classes = $derived(`
    flex  
    items-center
    justify-center
    border-2
    ${sizeClasses[size]}   
    ${colorClasses[color]}
    ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:opacity-80"}
    transition-opacity duration-200
  `);

  function handleKeyDown(e: KeyboardEvent) {
    if (!disabled && isAriaIntent(e)) {
      onClick(e);
    }
  }

  function handleClick(e: MouseEvent) {
    if (!disabled) {
      onClick(e);
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  aria-label={label}
  aria-disabled={disabled}
  class={classes}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  <span class="px-2 font-semibold">{label}</span>
</div>
