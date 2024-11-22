<script lang="ts">
  export let user: {
    name: string;
    pp_raw: number;
  };
</script>

<div class="min-h-screen bg-dark-300 py-12 px-4">
  <div class="max-w-7xl mx-auto">
    <!-- 환영 메시지 및 상단 카드 -->
    <div class="bg-dark-100 rounded-2xl p-8 mb-8 border border-gray-800">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">
            Welcome back, <span class="text-osu-pink">{user.name}</span>
          </h1>
          <p class="text-gray-400">
            Your current PP: <span class="text-osu-pink font-semibold">{user.pp_raw.toFixed(2)}</span>
          </p>
        </div>
        <form action="/auth/signout" method="POST">
          <button type="submit" class="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Sign Out
          </button>
        </form>
      </div>
    </div>

    <!-- 메인 액션 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <a 
        href="/challenges"
        class="group bg-dark-100 rounded-2xl p-8 border border-gray-800 transition-all hover:border-osu-pink"
      >
        <h2 class="text-2xl font-bold text-white mb-4">Today's Challenges</h2>
        <p class="text-gray-400 mb-6">Ready to take on today's personalized beatmap challenges?</p>
        <span class="text-osu-pink group-hover:translate-x-2 transition-transform inline-block">
          Start Playing →
        </span>
      </a>
      <a 
        href="/profile"
        class="group bg-dark-100 rounded-2xl p-8 border border-gray-800 transition-all hover:border-osu-pink"
      >
        <h2 class="text-2xl font-bold text-white mb-4">Your Profile</h2>
        <p class="text-gray-400 mb-6">View your progress and challenge history.</p>
        <span class="text-osu-pink group-hover:translate-x-2 transition-transform inline-block">
          View Stats →
        </span>
      </a>
    </div>

    <!-- 통계 섹션 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-dark-100 rounded-xl p-6 border border-gray-800">
        <h3 class="text-lg font-semibold text-white mb-2">Challenges Completed</h3>
        <p class="text-3xl font-bold text-osu-pink">0</p>
      </div>
      <div class="bg-dark-100 rounded-xl p-6 border border-gray-800">
        <h3 class="text-lg font-semibold text-white mb-2">Current Streak</h3>
        <p class="text-3xl font-bold text-osu-pink">0 days</p>
      </div>
      <div class="bg-dark-100 rounded-xl p-6 border border-gray-800">
        <h3 class="text-lg font-semibold text-white mb-2">PP Gained</h3>
        <p class="text-3xl font-bold text-osu-pink">0</p>
      </div>
    </div>
  </div>
</div> 