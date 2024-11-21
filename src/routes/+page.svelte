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

  const isDevelopment = import.meta.env.DEV;

  // Create tabs array conditionally
  const tabNames = ["Generate Shares", "Recover Wallet", "Learn More"].concat(
    isDevelopment ? ["UI Tests"] : [],
  );
</script>

<div class="p-8">
  <h1 class="mb-6 text-3xl font-bold">Key Tool</h1>

  <TabContainer {tabNames}>
    {#snippet tab0()}
      <div>
        <ShamirShareGenerator bind:sharesReport />
      </div>
    {/snippet}

    {#snippet tab1()}
      <div class="w-full">
        <Button
          variant="secondary"
          size="md"
          disabled={!sharesReport}
          onclick={() => (loadFromSharesReport = true)}
        >
          Load From Generated Shares
        </Button>
      </div>
      <div>
        <ShamirKeyRecovery {sharesReport} bind:loadFromSharesReport />
      </div>
    {/snippet}

    {#snippet tab2()}
      <div class="space-y-4">
        <div class="flex w-full items-start justify-around">
          <div class="rounded-md border bg-yellow-10 p-4">
            <p class="mb-2 font-medium">🔑 Quick Summary:</p>
            <ul class="list-disc pl-5">
              <li>Split your wallet into multiple shares</li>
              <li>Choose how many shares are needed for recovery</li>
              <li>Test the recovery process before deploying</li>
              <li>Recover your wallet using those shares later</li>
            </ul>
          </div>

          <div class="rounded-md border bg-red-10 p-4">
            <h4 class="mb-2 font-medium">⚠️ Important Security Notes</h4>
            <ul class="list-disc pl-5">
              <li>Store shares separately and securely</li>
              <li>Don't share with people you don't fully trust</li>
              <li>Consider keeping a backup of your recovery threshold</li>
              <li>Never store all shares in one location</li>
            </ul>
          </div>
        </div>

        <div class="space-y-5">
          <h3 class="text-xl font-semibold">What is Key Tool?</h3>
          <p class="text-black-80">
            Key Tool implements Shamir's Secret Sharing, a cryptographic
            algorithm that enables secure key splitting and recovery. Unlike
            simple backups or multisig solutions, this approach provides:
          </p>
          <ul class="list-disc space-y-2 pl-5">
            <li>
              Mathematical guarantee that incomplete sets of shares reveal
              nothing about your key
            </li>
            <li>
              Flexibility in choosing how many shares are needed for recovery
            </li>
            <li>
              Compatibility with both digital and physical (paper) storage
            </li>
            <li>
              Support for both mnemonic phrases and raw hexadecimal formats
            </li>
          </ul>
        </div>

        <div class="mt-6 space-y-4 rounded-md bg-green-10 p-4">
          <h3 class="text-xl font-semibold">Examples</h3>

          <div>
            <h4 class="font-semibold">Family Recovery Plan (3 of 5)</h4>
            <p class="mt-1">
              Distribute to trusted family members, ensuring wallet recovery
              even if some shares are lost or family members become unavailable
            </p>
          </div>
          <div>
            <h4 class="font-semibold">Business Security (4 of 7)</h4>
            <p class="mt-1">
              Distribute among board members and executives, preventing single
              points of failure while maintaining corporate control
            </p>
          </div>
          <div>
            <h4 class="font-semibold">Personal Backup (2 of 3)</h4>
            <p class="mt-1">
              Store in different secure locations (home safe, bank vault,
              trusted friend), balancing accessibility with security
            </p>
          </div>
        </div>

        <h3 class="mb-2 mt-6 text-lg font-semibold">Share Types</h3>
        <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-md border p-4">
            <div>
              <h4 class="mb-2 font-semibold">Standard Shares</h4>
              <p class="mb-4 text-black-80">
                Traditional implementation requiring both x and y coordinates
                for recovery. Like plotting points on a graph, each share needs
                two numbers to be useful.
              </p>
            </div>
            <div class="rounded bg-black-10 p-3">
              <p class="mb-2 font-medium">Recovery Requirements:</p>
              <ul class="list-disc space-y-2 pl-5">
                <li>
                  Your recovery threshold "N" (i.e. how many shares are required
                  to reconstruct the secret)
                </li>
                <li>
                  N complete shares, each containing:
                  <ul class="mt-1 list-disc pl-5">
                    <li>An x-coordinate (index number)</li>
                    <li>A y-coordinate (16 or 32 byte value)</li>
                  </ul>
                </li>
                <li>
                  The y-coordinate can be provided as either:
                  <ul class="mt-1 list-disc pl-5">
                    <li>Hexadecimal string (e.g., "0x123abc...")</li>
                    <li>Mnemonic phrase (e.g., "word1 word2 word3...")</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          <div class="rounded-lg border p-4">
            <div>
              <h4 class="mb-2 font-semibold">Indexed Shares</h4>
              <p class="mb-4 text-black-80">
                Enhanced version that uses points on the polynomial that happen
                to be self-encoding (by chance) such that the x-coordinate
                appears as the share value's least significant bits.
              </p>
            </div>
            <div class="rounded bg-black-10 p-3">
              <p class="mb-2 font-medium">Recovery Requirements:</p>
              <ul class="list-disc space-y-2 pl-5">
                <li>
                  Your recovery threshold "N" (i.e. how many shares are required
                  to reconstruct the secret)
                </li>
                <li>
                  N share values, each being:
                  <ul class="mt-1 list-disc pl-5">
                    <li>
                      A self-contained 16 or 32 byte value that includes its own
                      position information
                    </li>
                  </ul>
                </li>
                <li>
                  Each share can be provided as either:
                  <ul class="mt-1 list-disc pl-5">
                    <li>Hexadecimal string (e.g., "0x123abc...")</li>
                    <li>Mnemonic phrase (e.g., "word1 word2 word3...")</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="flex gap-y-4 space-x-4">
          <div class="w-1/2">
            <h3 class="mb-2 text-lg font-semibold">Technical Implementation</h3>

            <p class="text-black-80">
              Key Tool implements Shamir's Secret Sharing using polynomial
              interpolation in finite fields sized according to key length:
            </p>
            <ul class="list-disc space-y-2 pl-5">
              <li>For 256-bit keys: Prime field of 2<sup>256</sup> + 297</li>
              <li>For 128-bit keys: Prime field of 2<sup>128</sup> + 51</li>
              <li>
                Calculations are performed modulo these primes to ensure perfect
                secrecy
              </li>
              <li>
                These field sizes guarantee information-theoretic security for
                their respective key lengths
              </li>
            </ul>
          </div>
          <div class="flex w-1/2 justify-center">
            <div class="mt-4 rounded-md bg-blue-50 p-4">
              <h4 class="mb-2 font-medium">🔒 Security Features:</h4>
              <ul class="list-disc space-y-1 pl-5">
                <li>
                  Information-theoretic security (no computational assumptions)
                </li>
                <li>Secure against quantum computing attacks</li>
                <li>Protection against invalid share inputs</li>
                <li>Optional checksum verification</li>
                <li>BIP39 mnemonic compatibility with checksum bits</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-6 space-y-4">
          <h3 class="text-lg font-semibold">Additional Resources</h3>
          <div class="space-y-2">
            <a
              href="https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing"
              target="_blank"
              rel="noopener noreferrer"
              class="block text-blue-100 hover:underline"
            >
              Shamir's Secret Sharing on Wikipedia →
            </a>
            <a
              href="https://github.com/rjwalters/keytool"
              target="_blank"
              rel="noopener noreferrer"
              class="block text-blue-100 hover:underline"
            >
              View Source Code on GitHub →
            </a>
          </div>
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
