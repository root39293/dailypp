<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import LandingPage from '$lib/components/LandingPage.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';

  let isLoaded = false;
  onMount(() => {
    isLoaded = true;
  });
</script>

<LandingPage {isLoaded} user={$page.data.user} />
