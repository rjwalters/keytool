<script lang="ts">
  import { RadioGroup } from "$components/atoms";

  export interface ShamirSchemeSelectorProps {
    requiredShares: number;
    totalShares: number;
    onChange?: (requiredShares: number, totalShares: number) => void;
  }

  let {
    requiredShares,
    totalShares,
    onChange = (_requiredShares, _totalShares) => {},
  }: ShamirSchemeSelectorProps = $props();

  const requiredSharesOptions = ["2", "3", "4", "5"];
  const totalSharesOptions = ["3", "4", "5", "6", "7", "8"];

  function handleRequiredSharesChange(newRequiredSharesIndex: number) {
    requiredShares = parseInt(requiredSharesOptions[newRequiredSharesIndex]);

    // If new required shares would exceed total shares, adjust total shares up
    if (requiredShares > totalShares) {
      totalShares = requiredShares;
    }
    onChange(requiredShares, totalShares);
  }

  function handleTotalSharesChange(newTotalSharesIndex: number) {
    totalShares = parseInt(totalSharesOptions[newTotalSharesIndex]);

    // If new total shares would be less than required shares, adjust required shares down
    if (totalShares < requiredShares) {
      requiredShares = totalShares;
    }
    onChange(requiredShares, totalShares);
  }
</script>

<div class="flex gap-8 items-center">
  <div class="flex-1 border border-black-20 p-3">
    <p class="medium pb-4">Required Shares</p>
    <RadioGroup
      options={requiredSharesOptions}
      value={requiredShares.toString()}
      maxOptionsPerColumn={2}
      transpose
      onChange={(_, index) => handleRequiredSharesChange(index)}
    />
  </div>
  <div>of</div>
  <div class="flex-1 border border-black-20 p-3">
    <p class="medium pb-4">Total Shares</p>
    <RadioGroup
      options={totalSharesOptions}
      value={totalShares.toString()}
      maxOptionsPerColumn={2}
      transpose
      onChange={(_, index) => handleTotalSharesChange(index)}
    />
  </div>
</div>
