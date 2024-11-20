<script lang="ts">
  import type { BadgeColor, BadgeSize } from "$components/atoms";
  import { Badge, Input, RadioGroup } from "$components/atoms";
  import { ComponentTestFixture } from "$components/routes/test";

  // State management
  let label = $state("1");
  let color: BadgeColor = $state("green");
  let size: BadgeSize = $state("sm");

  // Options for RadioGroup components
  const colorOptions: BadgeColor[] = ["red", "green", "blue", "orange"];
  const sizeOptions: BadgeSize[] = ["sm", "md", "lg"];
</script>

<ComponentTestFixture testedComponent="atoms/Badge">
  {#snippet controls()}
    <div class="flex flex-col gap-4 w-full max-w-md">
      <!-- Label Input -->
      <Input
        label="Badge Label"
        bind:value={label}
        placeholder="Enter badge text"
      />

      <!-- Color Selection -->
      <RadioGroup
        label="Color"
        options={colorOptions}
        bind:value={color}
        letterWidthPx={12}
        maxOptionsPerColumn={2}
        transpose
      />

      <!-- Size Selection -->
      <RadioGroup
        label="Size"
        options={sizeOptions}
        bind:value={size}
        letterWidthPx={8}
        maxOptionsPerColumn={3}
      />
    </div>
  {/snippet}

  {#snippet component()}
    <Badge {color} {size} {label} />
  {/snippet}
</ComponentTestFixture>
