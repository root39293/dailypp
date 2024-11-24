<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { writable } from 'svelte/store';

  const isSidebarOpen = writable(true);

  function toggleSidebar() {
    isSidebarOpen.update(value => !value);
  }

  // 키보드 단축키로 사이드바 토글
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

      <!-- Footer -->
      <footer class="bg-dark-100/60 backdrop-blur-xl border-t border-gray-800/50">
        <div class="max-w-7xl mx-auto py-8 px-6">
          <div class="grid grid-cols-2 gap-8">
            <!-- 로고 & 설명 -->
            <div class="space-y-3">
              <h3 class="text-xl font-bold text-white">
                Daily<span class="text-osu-pink">PP</span>
              </h3>
              <p class="text-sm text-gray-400">
                매일 새로운 도전과제로 osu! 실력을 향상시켜보세요.
              </p>
            </div>

            <!-- 링크 -->
            <div class="flex items-center justify-end space-x-6">
              <a 
                href="https://osu.ppy.sh" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <i class="fas fa-circle text-osu-pink"></i>
                <span class="ml-2">osu!</span>
              </a>
              <a 
                href="https://github.com/n1et/dailypp" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <i class="fab fa-github"></i>
                <span class="ml-2">GitHub</span>
              </a>
              <a 
                href="https://www.buymeacoffee.com/faith6" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <i class="fas fa-mug-hot"></i>
                <span class="ml-2">Donate</span>
              </a>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-800/50 text-center text-sm text-gray-400">
            <p>© 2024 DailyPP.</p>
          </div>
        </div>
      </footer>
    </div>
  {:else}
    <main class="flex-1">
      <slot />
    </main>
  {/if}
</div> 