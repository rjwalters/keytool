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

        <h3 class="text-lg font-semibold mt-6 mb-2">
          Standard vs. Indexed Shares
        </h3>

        <p class="text-black-80">
          This tool offers two types of shares: standard and indexed. Standard
          shares require both coordinates (x and y values) for recovery, similar
          to points on a graph.
        </p>

        <p class="text-black-80">
          Indexed shares are an enhanced version that cleverly encode their
          position (x coordinate) within the least significant bits of the share
          value itself. This means during recovery, you only need to provide the
          share values and the tool can automatically extract the required
          positions. This makes the recovery process more user-friendly and
          reduces the chance of errors from mismatched coordinates.
        </p>

        <div class="bg-blue-20 p-4 rounded-lg mt-4">
          <h4 class="font-semibold mb-2">Why use Indexed Shares?</h4>
          <ul class="list-disc pl-5 space-y-2">
            <li>Simpler recovery process - only one number needed per share</li>
            <li>Reduced risk of coordinate mixing errors</li>
            <li>
              Self-contained shares that maintain their position information
            </li>
            <li>Same security guarantees as standard shares</li>
          </ul>
        </div>

        <p class="text-black-80">
          The mathematics behind this uses polynomial interpolation in a finite
          field. Each share is a point on a polynomial curve, and the secret is
          encoded as the y-intercept (the value at x=0). This tool implements
          the algorithm using a prime field of 2<sup>256</sup>+297 (for 256-bit
          keys) or 2<sup>128</sup>+51 (for 128-bit keys).
        </p>

        <div class="mt-6">
          <a
            href="https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-100 hover:underline"
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
