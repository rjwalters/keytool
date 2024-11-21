<script lang="ts">
  import * as navigation from "$app/navigation";
  import { Button } from "$components/atoms";

  const {
    class: className = "",
    testedComponent,
    controls,
    component,
  } = $props();

  // Grid configuration
  const cols_lg = Array(12).fill("basis-1/12");
  const cols_sm = Array(6).fill("basis-1/6");

  // Responsive state
  let innerWidth = $state(0);

  function mediaSize(w: number) {
    if (w >= 1536) return "2xl";
    if (w >= 1280) return "xl";
    if (w >= 1024) return "lg";
    if (w >= 768) return "md";
    if (w >= 640) return "sm";
    return "";
  }

  const currentMediaSize = $derived(mediaSize(innerWidth));
  const isLargeScreen = $derived(innerWidth >= 640);
  const columns = $derived(isLargeScreen ? cols_lg : cols_sm);
  const gridHeight = $derived(isLargeScreen ? "h-[800px]" : "h-[2000px]");
</script>

<svelte:window bind:innerWidth />

<div class="max-w-screen-xl">
  <!-- Header section -->
  <div class="my-4 flex w-full justify-between p-4 {className}">
    <div class="flex w-1/6 flex-col pl-4">
      <div>{innerWidth} px</div>
      <div>{currentMediaSize}</div>
    </div>
    <div>
      <Button
        onclick={async () => await navigation.goto("/")}
        variant="secondary"
        size="md"
      >
        Go to Homepage
      </Button>
    </div>
    <div>
      <p class="medium">Testing {testedComponent}</p>
    </div>
  </div>

  <!-- background columns -->
  <div class="flex flex-row">
    {#each columns as basis, i}
      <div class="{gridHeight} flex-none border-l border-red-10 {basis}">
        <div class="text-center text-sm text-red-40">#{i + 1}</div>
      </div>
    {/each}
  </div>

  <!-- testing section -->
  <div class="absolute top-[140px] w-full">
    {#if controls}
      <div class="my-4 w-full border border-green-100 bg-green-10">
        <h4 class="title-medium text-green-100">Controls</h4>
        <div class="w-full p-4">
          <div class="w-full bg-white-100">
            {@render controls()}
          </div>
        </div>
      </div>
    {/if}

    {#if component}
      <div class="my-4 w-full border border-blue-100 bg-blue-10">
        <h4 class="title-medium text-blue-100">Component</h4>
        <div class="w-full p-4">
          <div class="w-full bg-white-100">
            {@render component()}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
