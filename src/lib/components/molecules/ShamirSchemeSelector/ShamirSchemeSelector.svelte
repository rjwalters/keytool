<script lang="ts">
  import { RadioGroup } from "$components/atoms";

  export interface ShamirSchemeSelectorProps {
    onChange?: (requiredShares: number, totalShares: number) => void;
  }

  let {
    onChange = (_requiredShares, _totalShares) => {},
  }: ShamirSchemeSelectorProps = $props();

  let requiredShares = $state("3");
  let totalShares = $state("5");
  const requiredSharesOptions = ["2", "3", "4", "5"];
  const totalSharesOptions = ["3", "4", "5", "6", "7", "8"];

  let requiredSharesIndex = $state(1);
  let totalSharesIndex = $state(2);

  function handleRequiredSharesChange(newRequiredShares: string) {
    requiredShares = newRequiredShares;
    requiredSharesIndex = requiredSharesOptions.indexOf(requiredShares);

    // If new required shares would exceed total shares, adjust total shares up
    if (parseInt(requiredShares) > parseInt(totalShares)) {
      totalShares = requiredShares;
      totalSharesIndex = totalSharesOptions.indexOf(totalShares);
    }

    onChange(parseInt(requiredShares), parseInt(totalShares));
  }

  function handleTotalSharesChange(newTotalShares: string) {
    totalShares = newTotalShares;
    totalSharesIndex = totalSharesOptions.indexOf(totalShares);

    // If new total shares would be less than required shares, adjust required shares down
    if (parseInt(totalShares) < parseInt(requiredShares)) {
      requiredShares = totalShares;
      requiredSharesIndex = requiredSharesOptions.indexOf(requiredShares);
    }

    onChange(parseInt(requiredShares), parseInt(totalShares));
  }
</script>

<div class="flex gap-8 items-center">
  <div class="flex-1 border border-black-20 p-3">
    <p class="medium pb-4">Required Shares</p>
    <RadioGroup
      options={requiredSharesOptions}
      index={requiredSharesIndex}
      maxOptionsPerColumn={2}
      transpose
      onChange={(value, _index) => handleRequiredSharesChange(value)}
    />
  </div>
  <div>of</div>
  <div class="flex-1 border border-black-20 p-3">
    <p class="medium pb-4">Total Shares</p>
    <RadioGroup
      options={totalSharesOptions}
      index={totalSharesIndex}
      maxOptionsPerColumn={2}
      transpose
      onChange={(value, _index) => handleTotalSharesChange(value)}
    />
  </div>
</div>
