<script lang="ts">
  import { ShamirSchemeSelector } from "$components/molecules";
  import { ComponentTestFixture } from "$components/routes/test";

  // Display the last change
  let lastChange = $state("");
  const requiredShares = $state(2);
  const totalShares = $state(5);

  function handleSchemeChange(requiredShares: number, totalShares: number) {
    lastChange = `changed to ${requiredShares} of ${totalShares}`;
  }
</script>

<ComponentTestFixture testedComponent="molecules/ShamirSchemeSelector">
  {#snippet controls()}
    <div class="flex w-full flex-col gap-4">
      <div class="text-sm text-blue-100">
        {lastChange || " "}
      </div>
    </div>
  {/snippet}

  {#snippet component()}
    <ShamirSchemeSelector
      {requiredShares}
      {totalShares}
      onChange={handleSchemeChange}
    />
  {/snippet}
</ComponentTestFixture>
