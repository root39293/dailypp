<script lang="ts">
  export let user: {
    id: string;
    name: string;
    pp_raw: number;
  };
</script>

<div class="p-8">
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- 환영 메시지 & 퀵 스탯 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-dark-100/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-osu-pink bg-clip-text text-transparent mb-4">
          Welcome back, {user.name}
        </h1>
        <p class="text-gray-400">Your daily challenges are ready!</p>
      </div>
      <div class="bg-dark-100/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50">
        <div class="text-center">
          <i class="fas fa-chart-line text-2xl text-osu-pink mb-2"></i>
          <p class="text-gray-400 text-sm">Current PP</p>
          <p class="text-3xl font-bold text-white mt-2">{user.pp_raw.toFixed(2)}</p>
        </div>
      </div>
    </div>

    <!-- 최근 활동 & 추천 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-gradient-to-br from-osu-pink/10 to-dark-100/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white">Today's Progress</h2>
          <div class="w-12 h-12 rounded-full bg-osu-pink/20 flex items-center justify-center">
            <i class="fas fa-clock text-osu-pink"></i>
          </div>
        </div>
        <!-- 오늘의 진행상황 표시 -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-400">Challenges Completed</span>
            <span class="text-white font-bold">0/3</span>
          </div>
          <div class="w-full bg-dark-200 rounded-full h-2">
            <div class="bg-osu-pink h-2 rounded-full" style="width: 0%"></div>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-osu-pink/10 to-dark-100/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white">Recommended Maps</h2>
          <div class="w-12 h-12 rounded-full bg-osu-pink/20 flex items-center justify-center">
            <i class="fas fa-star text-osu-pink"></i>
          </div>
        </div>
        <!-- 추천 맵 목록 -->
        <div class="space-y-3">
          <p class="text-gray-400">Based on your current PP</p>
          <a href="/challenges" class="inline-flex items-center text-osu-pink hover:text-white transition-colors">
            View Recommendations <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- 통계 섹션 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-dark-100/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
        <div class="flex flex-col items-center text-center">
          <i class="fas fa-trophy text-2xl text-osu-pink mb-2"></i>
          <h3 class="text-sm font-medium text-gray-400">Weekly Challenges</h3>
          <p class="text-3xl font-bold text-white mt-2">0/21</p>
        </div>
      </div>
      
      <div class="bg-dark-100/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
        <div class="flex flex-col items-center text-center">
          <i class="fas fa-fire text-2xl text-osu-pink mb-2"></i>
          <h3 class="text-sm font-medium text-gray-400">Current Streak</h3>
          <p class="text-3xl font-bold text-white mt-2">0 days</p>
        </div>
      </div>
      
      <div class="bg-dark-100/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
        <div class="flex flex-col items-center text-center">
          <i class="fas fa-arrow-trend-up text-2xl text-osu-pink mb-2"></i>
          <h3 class="text-sm font-medium text-gray-400">PP Growth</h3>
          <p class="text-3xl font-bold text-white mt-2">+0</p>
        </div>
      </div>
    </div>
  </div>
</div> 