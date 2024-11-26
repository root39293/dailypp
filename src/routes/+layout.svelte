<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import Footer from '$lib/components/Footer.svelte';
  import { writable } from 'svelte/store';
  import { slide, fade } from 'svelte/transition';

  const isMenuOpen = writable(false);
  const isProfileOpen = writable(false);

  // clickOutside 디렉티브 추가
  function clickOutside(node: HTMLElement, callback: () => void) {
    const handleClick = (event: MouseEvent) => {
      if (!node.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('click', handleClick, true);

    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  function toggleMenu() {
    isMenuOpen.update(value => !value);
  }

  // 모바일 메뉴가 열려있을 때 스크롤 방지
  $: if (typeof window !== 'undefined') {
    if ($isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  // 현재 경로가 루트 경로인지 확인하는 함수
  $: isLandingPage = $page.url.pathname === '/';
</script>

<div class="min-h-screen bg-dark-300">
  {#if $page.data.user && !isLandingPage}
    <!-- 네비게이션 바 -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-dark-100/95 backdrop-blur-xl border-b border-gray-800/50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- 로고 -->
          <div class="flex items-center">
            <a href="/" class="text-2xl font-bold text-white hover:opacity-80 transition-opacity">
              Daily<span class="text-osu-pink">PP</span>
            </a>
          </div>

          <!-- 데스크톱 메뉴 -->
          <div class="hidden md:flex items-center space-x-4">
            <a
              href="/dashboard"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
                     {$page.url.pathname === '/' ? 'bg-dark-200 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-200/50'}"
            >
              <i class="fas fa-home w-5 h-5"></i>
              <span class="ml-2">Dashboard</span>
            </a>

            <a
              href="/challenges"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
                     {$page.url.pathname === '/challenges' ? 'bg-dark-200 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-200/50'}"
            >
              <i class="fas fa-trophy w-5 h-5"></i>
              <span class="ml-2">Challenges</span>
            </a>

            <a
              href="/stats"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
                     {$page.url.pathname === '/stats' ? 'bg-dark-200 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-200/50'}"
            >
              <i class="fas fa-chart-line w-5 h-5"></i>
              <span class="ml-2">Stats & Progress</span>
            </a>

            <!-- 유저 프로필 드롭다운 -->
            <div class="relative ml-4">
              <button 
                class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-dark-200/50 transition-colors"
                aria-label="사용자 프로필 메뉴"
                on:click={() => isProfileOpen.update(v => !v)}
              >
                <div class="relative w-8 h-8 rounded-full bg-dark-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://a.ppy.sh/${$page.data.user.id}`}
                    alt="Avatar"
                    class="w-full h-full object-cover"
                    on:error={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.remove();
                      const icon = document.createElement('i');
                      icon.className = 'fas fa-user text-osu-pink';
                      target.parentElement?.appendChild(icon);
                    }}
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-white truncate">
                    {$page.data.user.name}
                  </p>
                  <p class="text-xs text-gray-400">
                    {$page.data.user.pp_raw.toFixed(0)}pp
                  </p>
                </div>
              </button>

              {#if $isProfileOpen}
                <div 
                  class="absolute right-0 mt-2 w-48 rounded-lg bg-dark-100 border border-gray-800/50 shadow-lg backdrop-blur-xl z-[60]"
                  transition:slide={{ duration: 200 }}
                  use:clickOutside={() => isProfileOpen.set(false)}
                >
                  <div class="py-1">
                    <form action="/auth/signout" method="POST">
                      <button 
                        type="submit"
                        class="w-full px-4 py-2 text-sm text-left text-gray-400 hover:bg-dark-200/50 hover:text-red-400 
                               transition-colors flex items-center gap-2"
                      >
                        <i class="fas fa-sign-out-alt"></i>
                        로그아웃
                      </button>
                    </form>
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- 모바일 메뉴 버튼 -->
          <!-- svelte-ignore a11y_consider_explicit_label -->
          <button 
            class="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-200/50 transition-colors"
            on:click={toggleMenu}
          >
            <i class="fas fa-{$isMenuOpen ? 'times' : 'bars'} w-6 h-6"></i>
          </button>
        </div>
      </div>

      <!-- 모바일 메뉴 -->
      {#if $isMenuOpen}
        <div 
          class="fixed inset-0 z-40 bg-dark-100/95 backdrop-blur-xl md:hidden"
          transition:slide={{ duration: 300, axis: 'y' }}
        >
          <div class="flex flex-col h-full pt-20 px-4">
            <a
              href="/dashboard"
              class="flex items-center px-3 py-4 rounded-lg text-sm font-medium transition-colors
                     {$page.url.pathname === '/' ? 'bg-dark-200 text-white' : 'text-gray-400'}"
              on:click={toggleMenu}
            >
              <i class="fas fa-home w-5 h-5"></i>
              <span class="ml-3">Dashboard</span>
            </a>

            <a
              href="/challenges"
              class="flex items-center px-3 py-4 rounded-lg text-sm font-medium transition-colors
                     {$page.url.pathname === '/challenges' ? 'bg-dark-200 text-white' : 'text-gray-400'}"
              on:click={toggleMenu}
            >
              <i class="fas fa-trophy w-5 h-5"></i>
              <span class="ml-3">Challenges</span>
            </a>

            <a
              href="/stats"
              class="flex items-center px-3 py-4 rounded-lg text-sm font-medium transition-colors
                     {$page.url.pathname === '/stats' ? 'bg-dark-200 text-white' : 'text-gray-400'}"
              on:click={toggleMenu}
            >
              <i class="fas fa-chart-line w-5 h-5"></i>
              <span class="ml-3">Stats & Progress</span>
            </a>

            <div class="mt-auto pb-8">
              <div class="flex items-center space-x-3 px-3 py-4">
                <div class="relative w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://a.ppy.sh/${$page.data.user.id}`}
                    alt="Avatar"
                    class="w-full h-full object-cover"
                    on:error={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.remove();
                      const icon = document.createElement('i');
                      icon.className = 'fas fa-user text-osu-pink';
                      target.parentElement?.appendChild(icon);
                    }}
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-white">
                    {$page.data.user.name}
                  </p>
                  <p class="text-xs text-gray-400">
                    {$page.data.user.pp_raw.toFixed(0)}pp
                  </p>
                </div>
              </div>

              <form action="/auth/signout" method="POST" class="px-3">
                <button 
                  type="submit"
                  class="w-full px-4 py-3 text-left text-gray-400 hover:bg-dark-200/50 hover:text-red-400 
                         transition-colors rounded-lg flex items-center gap-2"
                >
                  <i class="fas fa-sign-out-alt"></i>
                  로그아웃
                </button>
              </form>
            </div>
          </div>
        </div>
      {/if}
    </nav>

    <!-- 메인 컨텐츠 -->
    <div class="flex-1 pt-16 flex flex-col min-h-screen">
      <main class="flex-grow">
        <slot />
      </main>
      <Footer />
    </div>
  {:else}
    <div class="flex flex-col min-h-screen">
      <main class="flex-grow">
        <slot />
      </main>
      <Footer />
    </div>
  {/if}
</div> 