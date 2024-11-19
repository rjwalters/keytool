<script lang="ts">
  import { ShamirSchemeSelector } from "$components/molecules";
  import { ComponentTestFixture } from "$components/routes/test";

  // Display the last change
  let lastChange = $state("");

  function handleChange(requiredShares: number, totalShares: number) {
    lastChange = `changed to ${requiredShares} of ${totalShares}`;
  }
</script>

<ComponentTestFixture testedComponent="molecules/ShamirSchemeSelector">
  {#snippet controls()}
    <div class="flex flex-col gap-4 w-full">
      <div class="text-sm text-blue-100">
        {lastChange || " "}
      </div>
    </div>
  {/snippet}

  {#snippet component()}
    <ShamirSchemeSelector onChange={handleChange} />
  {/snippet}
</ComponentTestFixture>
