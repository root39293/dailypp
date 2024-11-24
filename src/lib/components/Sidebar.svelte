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

    <!-- 네뉴 -->
    <nav class="flex-1 px-3 py-6 space-y-1">
      <a
        href="/"
        class="flex items-center px-3 py-2 rounded-lg text-sm font-medium
               {currentPath === '/' ? 'bg-dark-200 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-200/50'}"
      >
        <i class="fas fa-home w-5 h-5"></i>
        <span class="ml-3">Dashboard</span>
      </a>

      <a
        href="/challenges"
        class="flex items-center px-3 py-2 rounded-lg text-sm font-medium
               {currentPath === '/challenges' ? 'bg-dark-200 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-200/50'}"
      >
        <i class="fas fa-trophy w-5 h-5"></i>
        <span class="ml-3">Challenges</span>
      </a>

      <a
        href="/stats"
        class="flex items-center px-3 py-2 rounded-lg text-sm font-medium
               {currentPath === '/stats' ? 'bg-dark-200 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-200/50'}"
      >
        <i class="fas fa-chart-line w-5 h-5"></i>
        <span class="ml-3">Stats & Progress</span>
      </a>
    </nav>

    <!-- 유저 프로필 -->
    <div class="p-4 border-t border-gray-800/50">
      <a href="/stats" class="flex items-center space-x-3 px-2 py-1.5 rounded-lg hover:bg-dark-200/50">
        <div class="relative w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center overflow-hidden">
          <img
            src={`https://a.ppy.sh/${user.id}`}
            alt="Avatar"
            class="w-full h-full object-cover"
            on:error={handleImageError}
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-white truncate">
            {user.name}
          </p>
          <p class="text-xs text-gray-400">
            {user.pp_raw.toFixed(0)}pp
          </p>
        </div>
      </a>

      <!-- 로그아웃 버튼 추가 -->
      <form action="/auth/signout" method="POST">
        <button 
          type="submit"
          class="w-full mt-2 px-2 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-dark-200/50 hover:text-red-400 transition-colors flex items-center gap-2"
        >
          <i class="fas fa-sign-out-alt"></i>
          로그아웃
        </button>
      </form>
    </div>
  </div>
</div> 