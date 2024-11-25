<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  export let user: {
    id: string;
    name: string;
    pp_raw: number;
  };

  let dashboardStats = {
    weekly_completed: 0,
    current_streak: 0,
    pp_growth: 0,
    today_completed: 0
  };

  async function fetchDashboardStats() {
    try {
      const response = await fetch('/api/user/dashboard');
      if (response.ok) {
        dashboardStats = await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  }

  let updateInterval: ReturnType<typeof setInterval>;

  onMount(async () => {
    await fetchDashboardStats();
    
    updateInterval = setInterval(fetchDashboardStats, 30000);
  });

  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
</script>

<div class="min-h-screen bg-dark-100">
  <!-- 히어로 섹션 -->
  <div class="bg-gradient-to-br from-osu-pink/10 via-dark-200 to-dark-100 border-b border-gray-800/50">
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div class="flex flex-col md:flex-row items-center justify-between gap-8">
        <!-- 왼쪽: 환영 메시지 -->
        <div class="text-center md:text-left">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to <span class="text-osu-pink">Daily</span>PP
          </h1>
          <p class="text-xl text-gray-400 max-w-2xl">
            매일 새로운 비트맵으로 자신의 실력을 향상시켜보세요.
            당신의 PP에 맞춤화된 도전과제가 기다리고 있습니다.
          </p>
        </div>
        <!-- 오른쪽: PP 배지 -->
        <div class="bg-dark-300/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
          <div class="text-sm text-gray-400 mb-2">Your Performance</div>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-osu-pink/20 flex items-center justify-center">
              <i class="fas fa-chart-line text-2xl text-osu-pink"></i>
            </div>
            <div>
              <div class="text-3xl font-bold text-white">
                {user.pp_raw.toFixed(0)}<span class="text-osu-pink">pp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 기존 대시보드 콘텐츠 -->
  <div class="max-w-7xl mx-auto px-6 py-8">
    <div class="space-y-6">
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
                <span class="text-white font-medium">{dashboardStats.today_completed}/3</span>
              </div>
              <div class="h-2 bg-dark-300 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-osu-pink rounded-full transition-all duration-500" 
                  style="width: {(dashboardStats.today_completed / 3) * 100}%"
                ></div>
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
              <p class="text-xl font-bold text-white mt-1">{dashboardStats.weekly_completed}/21</p>
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
              <p class="text-xl font-bold text-white mt-1">{dashboardStats.current_streak} days</p>
            </div>
          </div>
        </div>

        <!-- PP 성장 (나중에 구현) -->
        <div class="bg-dark-200/50 rounded-2xl p-6 border border-white/5 hover:bg-dark-200/70 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center">
              <i class="fas fa-arrow-trend-up text-xl text-osu-pink"></i>
            </div>
            <div>
              <p class="text-gray-400 text-sm">PP Growth</p>
              <p class="text-xl font-bold text-white mt-1">+{dashboardStats.pp_growth}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 