<script lang="ts">
  const components = [
    "atoms/Button",
    "atoms/CheckBox",
    "atoms/Input",
    "atoms/RadioGroup",
    "molecules/EntropyInput",
  ];
</script>

<div class="p-8">
  <h1 class="text-3xl font-bold mb-6">Component Tests</h1>

  <div class="mt-4">
    <ul class="space-y-2">
      {#each components as component}
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
</div>
