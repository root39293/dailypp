<script lang="ts">
  export let message: string;
</script>

<div class="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 flex items-center gap-3">
  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
  <span class="text-sm">{message}</span>
</div> 