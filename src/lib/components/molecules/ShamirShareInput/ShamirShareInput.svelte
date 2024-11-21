<script lang="ts">
  import { Badge, Input } from "$components/atoms";
  import { WalletInput } from "$components/molecules";
  import { ShamirShare } from "$utils/wallet";

  export interface ShareInputProps {
    share: ShamirShare | undefined;
    disabled?: boolean;
    required?: boolean;
    showCopyButton?: boolean;
    onChange?: (share: ShamirShare | undefined) => void;
    label?: string;
  }

  let {
    share = $bindable(undefined),
    disabled = false,
    required = false,
    showCopyButton = true,
    onChange = () => {},
    label = "",
  }: ShareInputProps = $props();

  let shareIndex = $state(share?.index ?? undefined);
  let shareEntropy = $state(share?.entropyHex ?? undefined);
  let isIndexed = $state(share?.isIndexed ?? false);

  // Update internal state when a bound share prop is changed
  $effect(() => {
    if (share) {
      // console.log(`parent set share to ${share}`);
      shareIndex = share.index;
      shareEntropy = share.entropyHex;
      isIndexed = share.isIndexed;
      errorMessage = "";
    } else {
      // console.log(`parent set share to undefined`);
      shareIndex = undefined;
      shareEntropy = undefined;
      isIndexed = false;
      errorMessage = "";
    }
  });

  let errorMessage = $state("");

  function handleIndexChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newIndex = parseInt(target.value);
    if (newIndex < 1) {
      errorMessage = "Share index must be >=1";
    } else {
      errorMessage = "";
      share = ShamirShare.create(newIndex, share?.entropyHex, false);
    }
    onChange(share);
  }
</script>

<div class="flex flex-col gap-2 border border-black-10">
  <div class="flex pl-2">
    <!-- Index -->
    <div class="flex flex-col justify-around">
      <div class="flex flex-col items-center gap-2 w-20">
        <Badge
          label={isIndexed ? "Indexed" : "Standard"}
          color={isIndexed ? "blue" : "black"}
          {disabled}
          onClick={(_e) => {
            share = ShamirShare.create(
              share?.index,
              share?.entropyHex,
              !isIndexed
            );
            onChange(share);
          }}
        />
        <Input
          value={shareIndex}
          disabled={isIndexed || disabled}
          variant="number"
          onchange={handleIndexChange}
        />
      </div>
    </div>

    <!-- Value Input (reusing WalletInput for hex handling) -->
    <div class="flex-1">
      <WalletInput
        entropy={shareEntropy}
        {label}
        {required}
        {disabled}
        {showCopyButton}
        hiddenModes={["addresses"]}
        onChange={(wallet) => {
          share = ShamirShare.create(share?.index, wallet.entropy, !isIndexed);
          onChange(share);
        }}
      />
    </div>
  </div>

  {#if errorMessage}
    <p class="text-sm text-red-100" role="alert">{errorMessage}</p>
  {/if}
</div>
