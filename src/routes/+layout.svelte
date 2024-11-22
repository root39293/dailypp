<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  onMount(() => {
    console.log('Layout Mount - Session:', $page.data.session);
  });

  $: {
    console.log('Layout Reactive - Session:', $page.data.session);
  }
</script>

<slot /> 