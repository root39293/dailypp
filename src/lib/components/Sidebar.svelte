<script lang="ts">
  import { page } from '$app/stores';
  
  export let user: {
    id: string;
    name: string;
    pp_raw: number;
  };
  export let isOpen: boolean;

  function handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    const parent = target.parentElement;
    if (parent) {
      target.remove();
      const icon = document.createElement('i');
      icon.className = 'fas fa-user text-osu-pink';
      parent.appendChild(icon);
    }
  }

  $: currentPath = $page.url.pathname;
</script>

<!-- 사이드바 -->
<div 
  class="fixed left-0 top-0 h-full bg-dark-100/95 backdrop-blur-xl border-r border-gray-800/50 z-50
         transition-all duration-300 ease-in-out overflow-hidden
         {isOpen ? 'w-[280px]' : 'w-0'}"
>
  <div class="relative flex flex-col h-full" style="width: 280px">
    <!-- 로고 영역 -->
    <div class="h-[70px] flex items-center px-6 border-b border-gray-800/50">
      <h2 class="text-2xl font-bold text-white">
        Daily<span class="text-osu-pink">PP</span>
      </h2>
    </div>

    <!-- 네비게이션 메뉴 -->
    <nav class="flex-1 py-6">
      <ul class="space-y-1">
        <li>
          <a 
            href="/dashboard" 
            class="flex items-center h-[50px] px-6 transition-colors
                   {currentPath === '/dashboard' ? 
                     'text-osu-pink bg-dark-200/50' : 
                     'text-gray-400 hover:text-white hover:bg-dark-200/30'}"
          >
            <i class="fas fa-home w-5"></i>
            <span class="ml-4">Dashboard</span>
          </a>
        </li>
        <li>
          <a 
            href="/challenges" 
            class="flex items-center h-[50px] px-6 transition-colors
                   {currentPath === '/challenges' ? 
                     'text-osu-pink bg-dark-200/50' : 
                     'text-gray-400 hover:text-white hover:bg-dark-200/30'}"
          >
            <i class="fas fa-trophy w-5"></i>
            <span class="ml-4">Challenges</span>
          </a>
        </li>
        <li>
          <a 
            href="/leaderboard"
            class="flex items-center h-[50px] px-6 transition-colors
                   {currentPath === '/leaderboard' ? 
                     'text-osu-pink bg-dark-200/50' : 
                     'text-gray-400 hover:text-white hover:bg-dark-200/30'}"
          >
            <i class="fas fa-ranking-star w-5"></i>
            <span class="ml-4">Leaderboard</span>
          </a>
        </li>
        <li>
          <a 
            href="/profile"
            class="flex items-center h-[50px] px-6 transition-colors
                   {currentPath === '/profile' ? 
                     'text-osu-pink bg-dark-200/50' : 
                     'text-gray-400 hover:text-white hover:bg-dark-200/30'}"
          >
            <i class="fas fa-chart-line w-5"></i>
            <span class="ml-4">Stats & Progress</span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- 유저 프로필 -->
    <div class="p-6 border-t border-gray-800/50">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-osu-pink/20 overflow-hidden flex items-center justify-center">
          <img
            src={`https://a.ppy.sh/${user.id}`}
            alt="Profile"
            class="w-full h-full object-cover"
            on:error={handleImageError}
          />
        </div>
        <div class="flex-1 min-w-0 ml-3">
          <p class="text-sm font-medium text-white truncate">{user.name}</p>
          <p class="text-xs text-gray-400 truncate">{user.pp_raw.toFixed(2)}pp</p>
        </div>
        <form action="/auth/signout" method="POST">
          <button type="submit" class="text-gray-400 hover:text-white ml-2">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</div> 