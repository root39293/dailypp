<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { writable } from 'svelte/store';

  const isSidebarOpen = writable(true);

  function toggleSidebar() {
    isSidebarOpen.update(value => !value);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === '\\' && (event.ctrlKey || event.metaKey)) {
      toggleSidebar();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="flex min-h-screen bg-dark-300">
  {#if $page.data.user}
    <Sidebar user={$page.data.user} isOpen={$isSidebarOpen} />
    
    <!-- 메인 컨텐츠 -->
    <div class="flex-1 transition-all duration-300 ease-in-out
                {$isSidebarOpen ? 'ml-[280px]' : 'ml-0'} 
                flex flex-col min-h-screen">
      <!-- 토글 버튼 -->
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button 
        class="fixed top-6 {$isSidebarOpen ? 'left-[300px]' : 'left-6'} z-50 p-2 bg-dark-200 rounded-full text-gray-400 hover:text-white
               transition-all duration-300 ease-in-out"
        on:click={toggleSidebar}
      >
        <i class="fas fa-{$isSidebarOpen ? 'chevron-left' : 'chevron-right'}"></i>
      </button>

      <main class="flex-grow">
        <slot />
      </main>

      <Footer />
    </div>
  {:else}
    <main class="flex-1">
      <slot />
    </main>
  {/if}
</div> 