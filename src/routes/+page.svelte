<script lang="ts">
  import { Button } from "$components/atoms";
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
    "atoms/Badge",
    "molecules/WalletInput",
    "molecules/ShamirShareInput",
    "molecules/TabContainer",
    "molecules/ShamirSchemeSelector",
  ];

  let sharesReport = $state("");

  let loadFromSharesReport = $state(false);
</script>

<div class="p-8">
  <h1 class="text-3xl font-bold mb-6">Key Tool</h1>

  <TabContainer
    tabNames={["Generate Shares", "Recover Wallet", "Learn More", "UI Tests"]}
  >
    {#snippet tab0()}
      <div>
        <ShamirShareGenerator bind:sharesReport />
      </div>
    {/snippet}

    {#snippet tab1()}
      <div class="w-64">
        <Button
          variant="primary"
          size="md"
          disabled={!sharesReport}
          onclick={() => (loadFromSharesReport = true)}
        >
          Load Generated Shares
        </Button>
      </div>
      <div>
        <ShamirKeyRecovery {sharesReport} bind:loadFromSharesReport />
      </div>
    {/snippet}

    {#snippet tab2()}
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">About Shamir's Secret Sharing</h2>

        <div class="bg-yellow-50 p-4 rounded-lg mb-6">
          <p class="font-medium">🔑 Quick Summary:</p>
          <ul class="list-disc pl-5 mt-2">
            <li>Split your wallet into multiple shares</li>
            <li>Choose how many shares are needed for recovery</li>
            <li>Recover your wallet using those shares later</li>
          </ul>
        </div>

        <p class="text-black-80">
          Shamir's Secret Sharing is a cryptographic algorithm that allows you
          to split a secret (in this case, the entropy that encodes a
          cryptographic wallet) into multiple shares. The key feature is that
          you need a minimum number of shares to reconstruct the original
          secret, while any smaller number of shares provides no information
          about the secret.
        </p>

        <div class="bg-green-50 p-4 rounded-lg mt-4">
          <p class="font-medium">📋 Example Scenario:</p>
          <p class="mt-2">
            You split your wallet into 5 shares, requiring any 3 for recovery.
            You give one share each to five family members. If you lose access
            to your wallet:
          </p>
          <ul class="list-disc pl-5 mt-2">
            <li>Any 3 family members can help you recover it</li>
            <li>No group of 2 or fewer can access your wallet</li>
            <li>You can still recover if 2 shares are lost</li>
          </ul>
        </div>

        <h3 class="text-lg font-semibold mt-6 mb-2">
          Standard vs. Indexed Shares
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="border rounded-lg p-4">
            <div class="h-24">
              <h4 class="font-semibold mb-2">Standard Shares</h4>
              <p class="text-black-80 mb-4">
                Traditional implementation requiring both x and y coordinates
                for recovery. Like plotting points on a graph, each share needs
                two numbers to be useful.
              </p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="font-medium mb-2">
                To recover your secret key you will need:
              </p>
              <ul class="list-disc pl-5 space-y-2">
                <li>
                  Your recovery threshold "N" (how many shares are required)
                  <div class="text-sm text-gray-600 ml-2">
                    This sets the degree of the polynomial used in the math
                  </div>
                </li>
                <li>
                  N complete shares, each containing:
                  <ul class="list-disc pl-5 mt-1">
                    <li>An x-coordinate (index number)</li>
                    <li>A y-coordinate (16 or 32 byte value)</li>
                  </ul>
                </li>
                <li>
                  The y-coordinate can be provided as either:
                  <ul class="list-disc pl-5 mt-1">
                    <li>Hexadecimal string (e.g., "0x123abc...")</li>
                    <li>Mnemonic phrase (e.g., "word1 word2 word3...")</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          <div class="border rounded-lg p-4">
            <div class="h-24">
              <h4 class="font-semibold mb-2">Indexed Shares</h4>
              <p class="text-black-80 mb-4">
                Enhanced version that embeds the x-coordinate in the share
                value's least significant bits.
              </p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="font-medium mb-2">
                To recover your secret key you will need:
              </p>
              <ul class="list-disc pl-5 space-y-2">
                <li>
                  Your recovery threshold "N" (how many shares are required)
                  <div class="text-sm text-gray-600 ml-2">
                    This sets the degree of the polynomial used in the math
                  </div>
                </li>
                <li>
                  N share values, each being:
                  <ul class="list-disc pl-5 mt-1">
                    <li>
                      A self-contained 16 or 32 byte value that includes its own
                      position information
                    </li>
                  </ul>
                </li>
                <li>
                  Each share can be provided as either:
                  <ul class="list-disc pl-5 mt-1">
                    <li>Hexadecimal string (e.g., "0x123abc...")</li>
                    <li>Mnemonic phrase (e.g., "word1 word2 word3...")</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>

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

        <h3 class="text-lg font-semibold mt-6 mb-2">Technical Details</h3>
        <p class="text-black-80">
          The mathematics behind this uses polynomial interpolation in a finite
          field. Each share is a point on a polynomial curve, and the secret is
          encoded as the y-intercept (the value at x=0). This tool implements
          the algorithm using:
        </p>
        <ul class="list-disc pl-5 mt-2 space-y-1">
          <li>Prime field of 2<sup>256</sup> + 297 for 256-bit keys</li>
          <li>Prime field of 2<sup>128</sup> + 51 for 128-bit keys</li>
        </ul>

        <div class="bg-red-50 p-4 rounded-lg mt-6">
          <h4 class="font-semibold mb-2">⚠️ Important Security Notes</h4>
          <ul class="list-disc pl-5 space-y-2">
            <li>Store shares separately and securely</li>
            <li>Don't share with people you don't fully trust</li>
            <li>Consider keeping a backup of your recovery threshold</li>
          </ul>
        </div>

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
