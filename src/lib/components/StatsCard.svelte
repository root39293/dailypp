<script lang="ts">
  export let title: string;
  export let value: string;
  export let percentage: number;
  export let color: string = 'bg-osu-pink';

  $: formattedPercentage = percentage.toFixed(1);
  $: bgColor = color.replace('bg-', '');
</script>

<div class="bg-dark-100/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl {color.replace('500', '500/20')} flex items-center justify-center">
        <i class="fas fa-star text-lg {color.replace('bg-', 'text-')}"></i>
      </div>
      <span class="text-lg font-bold {color.replace('bg-', 'text-')}">{title}</span>
    </div>
    <div class="text-2xl font-bold text-white">{value}</div>
  </div>

  <div class="space-y-2">
    <div class="flex justify-between items-center">
      <span class="text-sm text-gray-400">Completion Rate</span>
      <span class="text-sm font-medium {color.replace('bg-', 'text-')}">{formattedPercentage}%</span>
    </div>
    <div class="h-2 bg-dark-200 rounded-full overflow-hidden">
      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <div
        class="h-full transition-all duration-500 {color}"
        style="width: {percentage}%"
      />
    </div>
  </div>
</div> 