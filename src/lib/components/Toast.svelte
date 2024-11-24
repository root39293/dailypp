<script lang="ts">
  import { fly } from 'svelte/transition';
  export let message: string;
  export let type: 'info' | 'warning' = 'info';
</script>

<div
  class="fixed bottom-4 right-4 z-50"
  in:fly={{ y: 50, duration: 300 }}
  out:fly={{ y: 50, duration: 200 }}
>
  <div class="flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg backdrop-blur-md border
              {type === 'info' 
                ? 'bg-osu-pink/90 text-white border-white/10' 
                : 'bg-yellow-500/90 text-white border-white/10'}">
    <i class="fas {type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle'} text-xl"></i>
    <p class="text-sm font-medium">{message}</p>
  </div>
</div> 