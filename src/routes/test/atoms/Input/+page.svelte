<script lang="ts">
  import {
    Button,
    CheckBox,
    Input,
    type InputVariant,
    RadioGroup,
  } from "$components/atoms";
  import { ComponentTestFixture } from "$components/routes/test";

  // State management
  let value = $state("");
  let label = $state("Input Label");
  let placeholderText = $state("Enter text...");
  let error = $state("");
  let disabled = $state(false);
  let required = $state(false);
  let variant = $state<InputVariant>("text");

  // Input variants
  const variants = ["text", "number"] satisfies InputVariant[];

  // Derive placeholder based on variant
  const placeholder = $derived(
    variant === "number" ? "Enter a number..." : placeholderText
  );

  // Event message handling
  let eventMessage = $state("");
  let messageTimeout: ReturnType<typeof setTimeout>;

  function showMessage(message: string) {
    clearTimeout(messageTimeout);
    eventMessage = message;
    messageTimeout = setTimeout(() => {
      eventMessage = "";
    }, 2000);
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    showMessage(`Input event: ${target.value}`);
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    showMessage(`Change event: ${target.value}`);
  }

  function handleFocus() {
    showMessage("Focus event");
  }

  function handleBlur() {
    showMessage("Blur event");
  }

  // Reset value when switching variants
  $effect(() => {
    value = variant === "number" ? "" : value;
  });
</script>

<ComponentTestFixture testedComponent="atoms/Input">
  {#snippet controls()}
    <div class="flex flex-col gap-4 w-full max-w-md">
      <!-- Variant Selection -->
      <RadioGroup
        label="Variant"
        options={variants}
        bind:value={variant}
        letterWidthPx={12}
        maxOptionsPerColumn={2}
      />

      <!-- Label Control -->
      <Input
        label="Label Text"
        bind:value={label}
        placeholder="Enter label text"
      />

      <!-- Placeholder Control -->
      <Input
        label="Placeholder Text"
        bind:value={placeholderText}
        placeholder="Enter placeholder text"
        disabled={variant === "number"}
      />
      {#if variant === "number"}
        <p class="text-sm text-black-60">
          Placeholder is fixed for number variant
        </p>
      {/if}

      <!-- Toggle Controls -->
      <div class="flex gap-4">
        <CheckBox bind:value={disabled} label="Disabled" />
        <CheckBox bind:value={required} label="Required" />
      </div>

      <!-- Error Toggle -->
      <Button
        variant="outline"
        size="sm"
        onclick={() => (error = error ? "" : "This is an error message")}
      >
        Toggle Error
      </Button>

      <!-- Message Display -->
      <div class="flex flex-col gap-2 text-sm">
        <p class="h-[1.5rem]">{eventMessage || "\u00A0"}</p>
      </div>
    </div>
  {/snippet}

  {#snippet component()}
    <Input
      bind:value
      {variant}
      {label}
      {placeholder}
      {error}
      {disabled}
      {required}
      oninput={handleInput}
      onchange={handleChange}
      onfocus={handleFocus}
      onblur={handleBlur}
    />
  {/snippet}
</ComponentTestFixture>
