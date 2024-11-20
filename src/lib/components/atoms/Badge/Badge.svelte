<script module lang="ts">
  export type BadgeColor = "red" | "green" | "blue" | "orange";
  export type BadgeSize = "sm" | "md" | "lg";

  export interface BadgeProps {
    color?: BadgeColor;
    size?: BadgeSize;
    label: string;
  }
</script>

<script lang="ts">
  let { color = "green", size = "sm", label = "?" }: BadgeProps = $props();

  const sizeClasses: Record<BadgeSize, string> = {
    sm: "w-min-10 text-xs rounded-md !h-6",
    md: "w-min-12 text-sm rounded-md !h-7",
    lg: "w-min-14 text-md rounded-md !h-9",
  };

  const colorClasses: Record<BadgeColor, string> = {
    red: "border-red-100 text-red-100",
    green: "border-green-100 text-green-100",
    blue: "border-blue-100 text-blue-100",
    orange: "border-orange-100 text-orange-100",
  };

  // Derive classes using $derived
  const classes = $derived(`
    flex  
    items-center
    justify-center
    border-2
    ${sizeClasses[size]}
    ${colorClasses[color]}
  `);
</script>

<div class={classes}>
  <span class="font-semibold px-2">{label}</span>
</div>
