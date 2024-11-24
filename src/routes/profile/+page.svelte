<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import StatsCard from '$lib/components/StatsCard.svelte';

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
      difficulty: 'EASY' | 'NORMAL' | 'HARD';
      completed: boolean;
      completed_at?: string;
      beatmap?: {
        title: string;
        version: string;
      };
    }[];
  }

  interface DifficultyData {
    total: number;
    completed: number;
  }

  let stats: ChallengeStats | null = null;
  let history: ChallengeHistory[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    if (!$page.data.user) {
      error = 'Not logged in';
      loading = false;
      return;
    }

    try {
      const [statsResponse, historyResponse] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/user/history')
      ]);

      if (!statsResponse.ok || !historyResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      stats = await statsResponse.json();
      history = await historyResponse.json();
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

  function calculateCompletionRate(completed: number, total: number): number {
    return total === 0 ? 0 : (completed / total) * 100;
  }

  function handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://osu.ppy.sh/images/layout/avatar-guest.png';
  }
</script>

<div class="min-h-screen bg-dark-300">
  {#if $page.data.user}
    <div class="bg-gradient-to-b from-dark-100 to-dark-200 py-12">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-osu-pink to-osu-purple rounded-full blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
            <img
              src={`https://a.ppy.sh/${$page.data.user.id}`}
              alt="Profile"
              class="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dark-100"
              on:error={handleImageError}
            />
          </div>
          <div class="text-center md:text-left">
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
              {$page.data.user.name}
            </h1>
            <div class="flex items-center justify-center md:justify-start gap-4 mb-4">
              <div class="bg-dark-100 rounded-lg px-4 py-2">
                <span class="text-gray-400 text-sm">Performance</span>
                <p class="text-xl font-bold text-osu-pink">{$page.data.user.pp_raw.toFixed(0)}pp</p>
              </div>
              {#if stats}
                <div class="bg-dark-100 rounded-lg px-4 py-2">
                  <span class="text-gray-400 text-sm">Completion Rate</span>
                  <p class="text-xl font-bold text-green-400">{((stats.completed / stats.total) * 100).toFixed(1)}%</p>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8">
      {#if loading}
        <LoadingSpinner />
      {:else if error}
        <ErrorAlert message={error} />
      {:else if stats}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {#each Object.entries(stats.byDifficulty) as [difficulty, data]}
            <div class="bg-dark-100 rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all">
              <div class="flex items-center justify-between mb-4">
                <span class="text-lg font-semibold
                  {difficulty === 'EASY' ? 'text-green-400' : 
                   difficulty === 'NORMAL' ? 'text-yellow-400' : 
                   'text-red-400'}">
                  {difficulty}
                </span>
                <div class="w-8 h-8 rounded-lg flex items-center justify-center
                  {difficulty === 'EASY' ? 'bg-green-500/20' : 
                   difficulty === 'NORMAL' ? 'bg-yellow-500/20' : 
                   'bg-red-500/20'}">
                  <i class="fas fa-star text-sm
                    {difficulty === 'EASY' ? 'text-green-400' : 
                     difficulty === 'NORMAL' ? 'text-yellow-400' : 
                     'text-red-400'}"></i>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm text-gray-400">
                  <span>Completed</span>
                  <span>{(data as DifficultyData).completed}/{(data as DifficultyData).total}</span>
                </div>
                <div class="h-2 bg-dark-200 rounded-full overflow-hidden">
                  <div class="h-full transition-all duration-500
                    {difficulty === 'EASY' ? 'bg-green-500' : 
                     difficulty === 'NORMAL' ? 'bg-yellow-500' : 
                     'bg-red-500'}"
                    style="width: {calculateCompletionRate((data as DifficultyData).completed, (data as DifficultyData).total)}%">
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <div class="bg-dark-100 rounded-2xl border border-gray-700/50">
          <div class="p-6 border-b border-gray-700/50">
            <h2 class="text-xl font-bold text-white">Challenge History</h2>
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
        <p class="text-gray-400 mb-8">Please sign in to view your profile</p>
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