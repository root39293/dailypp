<script lang="ts">
  export let user: {
    id: string;
    name: string;
    pp_raw: number;
  };

  let imageError = false;

  function handleImageError() {
    imageError = true;
  }
</script>

<div class="min-h-screen bg-dark-100 p-6 pt-24">
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- 헤더 섹션 -->
    <div class="flex flex-col md:flex-row gap-6">
      <!-- 환영 메시지 & 프로필 -->
      <div class="flex-1 bg-dark-200/50 rounded-2xl p-8 border border-white/5">
        <div class="flex items-center gap-6">
          {#if !imageError}
            <img 
              src={`https://a.ppy.sh/${user.id}`}
              alt={user.name}
              class="w-16 h-16 rounded-full object-cover border-2 border-osu-pink"
              on:error={handleImageError}
            />
          {:else}
            <div class="w-16 h-16 rounded-full bg-dark-300 flex items-center justify-center border-2 border-osu-pink">
              <span class="text-2xl font-bold text-white">{user.name[0].toUpperCase()}</span>
            </div>
          {/if}
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-white">
              Welcome back, <span class="text-osu-pink">{user.name}</span>
            </h1>
            <p class="text-gray-400 mt-2">Let's achieve your goals today!</p>
          </div>
        </div>
      </div>

      <!-- PP 카드 -->
      <div class="w-full md:w-80 bg-dark-200/50 rounded-2xl p-8 border border-white/5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center">
            <i class="fas fa-chart-line text-xl text-osu-pink"></i>
          </div>
          <div>
            <p class="text-gray-400 text-sm">Current PP</p>
            <p class="text-2xl font-bold text-white">{user.pp_raw.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 메인 콘텐츠 그리드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 오늘의 진행상황 -->
      <div class="bg-dark-200/50 rounded-2xl p-8 border border-white/5">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-xl font-bold text-white">Today's Progress</h2>
            <p class="text-gray-400 text-sm mt-1">Track your daily achievements</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-dark-300 flex items-center justify-center">
            <i class="fas fa-clock text-osu-pink"></i>
          </div>
        </div>
        <div class="space-y-6">
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-gray-400">Daily Challenges</span>
              <span class="text-white font-medium">0/3</span>
            </div>
            <div class="h-2 bg-dark-300 rounded-full overflow-hidden">
              <div class="h-full bg-osu-pink rounded-full" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 추천 맵 -->
      <div class="bg-dark-200/50 rounded-2xl p-8 border border-white/5">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-xl font-bold text-white">Recommended Maps</h2>
            <p class="text-gray-400 text-sm mt-1">Personalized for your skill level</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-dark-300 flex items-center justify-center">
            <i class="fas fa-star text-osu-pink"></i>
          </div>
        </div>
        <div class="space-y-4">
          <p class="text-gray-400">Maps based on your {user.pp_raw.toFixed(0)} PP</p>
          <a 
            href="/challenges" 
            class="inline-flex items-center px-4 py-2 rounded-xl bg-osu-pink text-white font-medium hover:bg-opacity-90 transition-opacity"
          >
            View Recommendations
            <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- 통계 카드 그리드 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 주간 도전과제 -->
      <div class="bg-dark-200/50 rounded-2xl p-6 border border-white/5 hover:bg-dark-200/70 transition-colors">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center">
            <i class="fas fa-trophy text-xl text-osu-pink"></i>
          </div>
          <div>
            <p class="text-gray-400 text-sm">Weekly Challenges</p>
            <p class="text-xl font-bold text-white mt-1">0/21</p>
          </div>
        </div>
      </div>

      <!-- 현재 스트릭 -->
      <div class="bg-dark-200/50 rounded-2xl p-6 border border-white/5 hover:bg-dark-200/70 transition-colors">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center">
            <i class="fas fa-fire text-xl text-osu-pink"></i>
          </div>
          <div>
            <p class="text-gray-400 text-sm">Current Streak</p>
            <p class="text-xl font-bold text-white mt-1">0 days</p>
          </div>
        </div>
      </div>

      <!-- PP 성장 -->
      <div class="bg-dark-200/50 rounded-2xl p-6 border border-white/5 hover:bg-dark-200/70 transition-colors">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center">
            <i class="fas fa-arrow-trend-up text-xl text-osu-pink"></i>
          </div>
          <div>
            <p class="text-gray-400 text-sm">PP Growth</p>
            <p class="text-xl font-bold text-white mt-1">+0</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 