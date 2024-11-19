<script lang="ts">
  import { TabContainer } from "$components/molecules";
  import {
    ShamirKeyRecovery,
    ShamirShareGenerator,
  } from "$components/organisms";

  const testComponents = [
    "atoms/Button",
    "atoms/CheckBox",
    "atoms/Input",
    "atoms/RadioGroup",
    "molecules/WalletInput",
    "molecules/ShamirShareInput",
    "molecules/TabContainer",
    "molecules/ShamirSchemeSelector",
  ];
</script>

<div class="p-8">
  <h1 class="text-3xl font-bold mb-6">Key Shares Tool</h1>

  <TabContainer
    tabNames={["Generate Shares", "Recover Wallet", "Learn More", "UI Tests"]}
  >
    {#snippet tab0()}
      <div>
        <ShamirShareGenerator />
      </div>
    {/snippet}

    {#snippet tab1()}
      <div>
        <ShamirKeyRecovery />
      </div>
    {/snippet}

    {#snippet tab2()}
      <div class="max-w-2xl space-y-4">
        <h2 class="text-xl font-semibold">About Shamir's Secret Sharing</h2>

        <p class="text-black-80">
          Shamir's Secret Sharing is a cryptographic algorithm that allows you
          to split a secret (in this case, the entropy that encodes a
          cryptographic wallet) into multiple shares. The key feature is that
          you need a minimum number of shares to reconstruct the original
          secret, while any smaller number of shares provides no information
          about the secret.
        </p>

        <p class="text-black-80">
          For example, you might split a wallet into 5 shares with a minimum of
          3 required for recovery. This means you could give one share each to
          five trusted friends or family members, and any three of them could
          help you recover your wallet if needed. However, if two or fewer
          shares are combined, they reveal nothing about your wallet.
        </p>

        <p class="text-black-80">
          The mathematics behind this uses polynomial interpolation in a finite
          field. Each share is a point on a polynomial curve, and the secret is
          encoded as the y-intercept (the value at x=0). This tool implements
          the algorithm using a prime field of 2<sup>256</sup> + 297 to ensure security
          for cryptographic keys.
        </p>

        <div class="mt-6">
          <a
            href="https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Learn more about Shamir's Secret Sharing on Wikipedia →
          </a>
        </div>
      </div>
    {/snippet}

    {#snippet tab3()}
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
