<script lang="ts">
  import type { Snippet } from "svelte";

  export interface TabContainerProps {
    tabNames: string[];
    tab0?: Snippet;
    tab1?: Snippet;
    tab2?: Snippet;
    tab3?: Snippet;
    tab4?: Snippet;
  }

  const {
    tabNames = [],
    tab0,
    tab1,
    tab2,
    tab3,
    tab4,
  }: TabContainerProps = $props();

  let activeTab = $state(0);
</script>

<div class="w-full">
  <div class="border-b border-black-20">
    <nav class="flex space-x-4" aria-label="Tabs">
      {#each tabNames as tabName, i}
        <button
          onclick={() => (activeTab = i)}
          class="px-4 py-2 text-sm font-medium border-b-2 {activeTab === i
            ? 'border-blue-100 text-blue-100'
            : 'border-transparent text-black-60 hover:text-black-80 hover:border-black-20'}"
          aria-current={activeTab === i ? "page" : undefined}
        >
          {tabName}
        </button>
      {/each}
    </nav>
  </div>

  <div class="mt-8">
    {#if tab0}
      <div class:hidden={activeTab !== 0}>
        {@render tab0()}
      </div>
    {/if}
    {#if tab1}
      <div class:hidden={activeTab !== 1}>
        {@render tab1()}
      </div>
    {/if}
    {#if tab2}
      <div class:hidden={activeTab !== 2}>
        {@render tab2()}
      </div>
    {/if}
    {#if tab3}
      <div class:hidden={activeTab !== 3}>
        {@render tab3()}
      </div>
    {/if}
    {#if tab4}
      <div class:hidden={activeTab !== 4}>
        {@render tab4()}
      </div>
    {/if}
  </div>
</div>
