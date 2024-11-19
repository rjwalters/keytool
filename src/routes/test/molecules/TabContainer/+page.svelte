<script lang="ts">
  import { Input, RadioGroup } from "$components/atoms";
  import { TabContainer } from "$components/molecules";
  import { ComponentTestFixture } from "$components/routes/test";

  // State management
  let tabs = $state(["Tab 1", "Tab 2", "Tab 3"]);
  let numTabs = $state("3");

  // Derive tabs array based on number selection
  $effect(() => {
    const n = parseInt(numTabs);
    tabs = Array.from({ length: n }, (_, i) => `Tab ${i + 1}`);
  });
</script>

<ComponentTestFixture testedComponent="molecules/TabContainer">
  {#snippet controls()}
    <div class="flex flex-col gap-4 w-full max-w-md">
      <RadioGroup
        label="Number of Tabs"
        options={["2", "3", "4", "5"]}
        bind:value={numTabs}
        letterWidthPx={12}
        maxOptionsPerColumn={3}
      />

      {#each tabs as _, i}
        <Input
          label={`Tab ${i + 1} Label`}
          bind:value={tabs[i]}
          placeholder={`Enter label for tab ${i + 1}`}
        />
      {/each}
    </div>
  {/snippet}

  {#snippet component()}
    <TabContainer tabNames={tabs}>
      {#snippet tab0()}
        <div class="p-4 border border-black-20 rounded">
          <h3 class="text-lg font-medium mb-2">Content for {tabs[0]}</h3>
          <p class="text-black-60">This is the content area for tab 1.</p>
        </div>
      {/snippet}
      {#snippet tab1()}
        <div class="p-4 border border-black-20 rounded">
          <h3 class="text-lg font-medium mb-2">Content for {tabs[1]}</h3>
          <p class="text-black-60">This is the content area for tab 2.</p>
        </div>
      {/snippet}
      {#snippet tab2()}
        <div class="p-4 border border-black-20 rounded">
          <h3 class="text-lg font-medium mb-2">Content for {tabs[2]}</h3>
          <p class="text-black-60">This is the content area for tab 3.</p>
        </div>
      {/snippet}
      {#snippet tab3()}
        <div class="p-4 border border-black-20 rounded">
          <h3 class="text-lg font-medium mb-2">Content for {tabs[3]}</h3>
          <p class="text-black-60">This is the content area for tab 4.</p>
        </div>
      {/snippet}
      {#snippet tab4()}
        <div class="p-4 border border-black-20 rounded">
          <h3 class="text-lg font-medium mb-2">Content for {tabs[4]}</h3>
          <p class="text-black-60">This is the content area for tab 5.</p>
        </div>
      {/snippet}
    </TabContainer>
  {/snippet}
</ComponentTestFixture>
