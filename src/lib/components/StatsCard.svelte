<script lang="ts">
  export let title: string;
  export let value: string;
  export let percentage: number;
  export let color: string = 'bg-osu-pink';

  $: formattedPercentage = percentage.toFixed(1);
</script>

<div class="bg-dark-100 rounded-lg p-6 shadow-lg border border-gray-700">
  <h3 class="text-lg font-semibold text-white mb-2">{title}</h3>
  <div class="text-2xl font-bold text-white mb-4">{value}</div>
  <div class="relative pt-1">
    <div class="flex mb-2 items-center justify-between">
      <div class="text-right">
        <span class="text-xs font-semibold inline-block text-white">
          {formattedPercentage}%
        </span>
      </div>
    </div>
    <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <div
        style="width: {percentage}%"
        class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center {color}"
      />
    </div>
  </div>
</div> 