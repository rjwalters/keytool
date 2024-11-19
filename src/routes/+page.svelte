<script lang="ts">
  import { TabContainer } from "$components/molecules";
  import { ShamirShareGenerator } from "$components/organisms";

  const testComponents = [
    "atoms/Button",
    "atoms/CheckBox",
    "atoms/Input",
    "atoms/RadioGroup",
    "molecules/WalletInput",
    "molecules/ShamirShareInput",
    "molecules/TabContainer",
  ];
</script>

<div class="p-8">
  <h1 class="text-3xl font-bold mb-6">Key Shares Tool</h1>

  <TabContainer tabNames={["Generate Shares", "Recover Wallet", "UI Tests"]}>
    {#snippet tab0()}
      <div>
        <ShamirShareGenerator label="" />
      </div>
    {/snippet}

    {#snippet tab1()}
      <div>
        <p class="text-black-60">Wallet Recovery Coming Soon</p>
      </div>
    {/snippet}

    {#snippet tab2()}
      <div class="mt-4">
        <ul class="space-y-2">
          {#each testComponents as component}
            <li>
              <a
                href={`test/${component}`}
                class="text-black-80 hover:text-blue-100 hover:underline"
              >
                {component}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/snippet}
  </TabContainer>
</div>
