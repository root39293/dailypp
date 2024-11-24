<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import PPChart from '$lib/components/PPChart.svelte';
  import StatsCard from '$lib/components/StatsCard.svelte';

  type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

  interface ChallengeStats {
    total: number;
    completed: number;
    byDifficulty: {
      EASY: { total: number; completed: number };
      NORMAL: { total: number; completed: number };
      HARD: { total: number; completed: number };
    };
  }

  interface ChallengeHistory {
    date: string;
    challenges: {
      beatmap_id: string;
      difficulty: Difficulty;
      completed: boolean;
      completed_at?: string;
      beatmap?: {
        title: string;
        version: string;
      };
    }[];
  }

  let stats: ChallengeStats | null = null;
  let history: ChallengeHistory[] = [];
  let loading = true;
  let error: string | null = null;
  let ppHistory: { pp: number; recorded_at: string; }[] = [];

  const DIFFICULTIES: Difficulty[] = ['EASY', 'NORMAL', 'HARD'];

  onMount(async () => {
    if (!$page.data.user) {
      error = 'Not logged in';
      loading = false;
      return;
    }

    try {
      const [statsResponse, historyResponse, ppHistoryResponse] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/user/history'),
        fetch('/api/user/pp-history')
      ]);

      if (!statsResponse.ok || !historyResponse.ok || !ppHistoryResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      stats = await statsResponse.json();
      history = await historyResponse.json();
      ppHistory = await ppHistoryResponse.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading = false;
    }
  });

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://osu.ppy.sh/images/layout/avatar-guest.png';
  }
</script>

<div class="min-h-screen bg-dark-300">
  <div class="absolute inset-0 overflow-hidden opacity-20">
    <div class="absolute w-[500px] h-[500px] bg-osu-pink rounded-full blur-[128px] animate-float top-0 -left-64"></div>
    <div class="absolute w-[500px] h-[500px] bg-osu-purple rounded-full blur-[128px] animate-float-delayed -bottom-64 right-0"></div>
  </div>

  {#if $page.data.user}
    <div class="bg-gradient-to-br from-osu-pink/10 via-dark-200 to-dark-100 border-b border-gray-800/50">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <div class="flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="text-center md:text-left">
            <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
              Stats & <span class="text-osu-pink">Progress</span>
            </h1>
            <p class="text-xl text-gray-400 max-w-2xl">
              일일 도전과제 달성률과 PP 성장을 한눈에 확인하세요.
              매일매일의 작은 성장이 큰 발전으로 이어집니다.
            </p>
          </div>
          <div class="bg-dark-300/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
            <div class="text-sm text-gray-400 mb-2">현재 퍼포먼스</div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-osu-pink/20 flex items-center justify-center">
                <i class="fas fa-chart-line text-2xl text-osu-pink"></i>
              </div>
              <div>
                <div class="text-3xl font-bold text-white">
                  {$page.data.user.pp_raw.toFixed(0)}<span class="text-osu-pink">pp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="relative max-w-6xl mx-auto px-4 py-8 space-y-8">
      {#if loading}
        <LoadingSpinner />
      {:else if error}
        <ErrorAlert message={error} />
      {:else if stats}
        {#if ppHistory.length > 0}
          <div class="bg-dark-100/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
            <div class="flex items-center justify-between mb-6">
              <div class="space-y-1">
                <h2 class="text-xl font-bold text-white">PP Progress</h2>
                <p class="text-sm text-gray-400">Your performance points growth over time</p>
              </div>
              <div class="px-3 py-1 rounded-full bg-dark-200 text-sm text-gray-400">
                Last 30 days
              </div>
            </div>
            <PPChart data={ppHistory} />
          </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {#each DIFFICULTIES as difficulty}
            <StatsCard
              title={difficulty}
              value={`${stats.byDifficulty[difficulty].completed}/${stats.byDifficulty[difficulty].total}`}
              percentage={(stats.byDifficulty[difficulty].completed / stats.byDifficulty[difficulty].total) * 100}
              color={difficulty === 'EASY' ? 'bg-green-500' : 
                     difficulty === 'NORMAL' ? 'bg-yellow-500' : 
                     'bg-red-500'}
            />
          {/each}
        </div>

        <div class="bg-dark-100/50 backdrop-blur-sm rounded-2xl border border-gray-800/50">
          <div class="p-6 border-b border-gray-800/50">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-white">Challenge History</h2>
              <p class="text-sm text-gray-400">Your recent challenge completions</p>
            </div>
          </div>
          <div class="divide-y divide-gray-700/50">
            {#each history as day}
              <div class="p-6">
                <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                  <i class="fas fa-calendar-day text-osu-pink mr-2"></i>
                  {formatDate(day.date)}
                </h3>
                <div class="grid gap-4">
                  {#each day.challenges as challenge}
                    <div class="bg-dark-200 rounded-xl p-4 hover:bg-dark-200/80 transition-colors">
                      <div class="flex items-center justify-between">
                        <div class="space-y-1">
                          {#if challenge.beatmap}
                            <p class="text-white font-medium line-clamp-1">
                              {challenge.beatmap.title}
                            </p>
                            <p class="text-gray-400 text-sm">
                              [{challenge.beatmap.version}]
                            </p>
                          {/if}
                          <span class="inline-block text-xs font-semibold px-3 py-1 rounded-full
                            {challenge.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' : 
                             challenge.difficulty === 'NORMAL' ? 'bg-yellow-500/20 text-yellow-400' : 
                             'bg-red-500/20 text-red-400'}">
                            {challenge.difficulty}
                          </span>
                        </div>
                        <div class="flex items-center">
                          {#if challenge.completed}
                            <div class="flex items-center text-sm text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg">
                              <i class="fas fa-check mr-2"></i>
                              <span class="hidden sm:inline">Completed</span>
                              {#if challenge.completed_at}
                                <span class="hidden lg:inline ml-2 text-gray-400">
                                  at {new Date(challenge.completed_at).toLocaleTimeString()}
                                </span>
                              {/if}
                            </div>
                          {:else}
                            <span class="text-sm text-gray-500 bg-gray-500/10 px-3 py-1.5 rounded-lg">
                              <i class="fas fa-clock mr-2"></i>
                              <span class="hidden sm:inline">Pending</span>
                            </span>
                          {/if}
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center p-8">
        <div class="w-24 h-24 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-user text-3xl text-gray-600"></i>
        </div>
        <h2 class="text-2xl font-bold text-white mb-4">Not Signed In</h2>
        <p class="text-gray-400 mb-8">Please sign in to view your stats</p>
        <a
          href="/"
          class="inline-flex items-center px-6 py-3 rounded-xl bg-osu-pink text-white font-medium hover:bg-opacity-90 transition-all"
        >
          <i class="fas fa-home mr-2"></i>
          Go to Home
        </a>
      </div>
    </div>
  {/if}
</div> 