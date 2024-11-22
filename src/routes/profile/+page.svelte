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

  type SessionUser = {
    id: string;
    name: string;
    pp_raw?: number;
  };

  let stats: ChallengeStats | null = null;
  let history: ChallengeHistory[] = [];
  let loading = true;
  let error: string | null = null;

  $: user = $page.data.session?.user as SessionUser | null;

  onMount(async () => {
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
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
  {#if user}
    <div class="bg-dark-100 rounded-lg p-6 shadow-lg border border-gray-700 mb-8">
      <div class="flex items-center space-x-4">
        <img
          src={`https://a.ppy.sh/${user.id}`}
          alt="Profile"
          class="w-20 h-20 rounded-full border-2 border-osu-pink"
        />
        <div>
          <h1 class="text-2xl font-bold text-white">
            {user.name}
          </h1>
          {#if user.pp_raw !== undefined}
            <p class="text-gray-400 flex items-center">
              <span class="font-semibold text-osu-pink">{user.pp_raw.toFixed(2)}</span>
              <span class="ml-1">PP</span>
            </p>
          {/if}
        </div>
      </div>
    </div>

    {#if loading}
      <LoadingSpinner />
    {:else if error}
      <ErrorAlert message={error} />
    {:else if stats}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Overall Completion"
          value={`${stats.completed}/${stats.total}`}
          percentage={calculateCompletionRate(stats.completed, stats.total)}
        />
        {#each Object.entries(stats.byDifficulty) as [difficulty, data]}
          <StatsCard
            title={`${difficulty} Maps`}
            value={`${data.completed}/${data.total}`}
            percentage={calculateCompletionRate(data.completed, data.total)}
            color={difficulty === 'EASY' ? 'bg-green-500' : 
                   difficulty === 'NORMAL' ? 'bg-yellow-500' : 
                   'bg-red-500'}
          />
        {/each}
      </div>

      <div class="bg-dark-100 rounded-lg p-6 shadow-lg border border-gray-700">
        <h2 class="text-xl font-bold text-white mb-6">Challenge History</h2>
        <div class="space-y-6">
          {#each history as day}
            <div class="border-b border-gray-700 pb-6 last:border-0 last:pb-0">
              <h3 class="text-lg font-semibold text-white mb-4">{formatDate(day.date)}</h3>
              <div class="grid gap-4">
                {#each day.challenges as challenge}
                  <div class="flex items-center justify-between bg-dark-200 rounded-lg p-4">
                    <div>
                      {#if challenge.beatmap}
                        <p class="text-white font-medium">
                          {challenge.beatmap.title} [{challenge.beatmap.version}]
                        </p>
                      {/if}
                      <span class="text-sm font-semibold px-2 py-0.5 rounded-full
                        {challenge.difficulty === 'EASY' ? 'bg-green-500 bg-opacity-20 text-green-400' : 
                         challenge.difficulty === 'NORMAL' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' : 
                         'bg-red-500 bg-opacity-20 text-red-400'}">
                        {challenge.difficulty}
                      </span>
                    </div>
                    {#if challenge.completed}
                      <span class="text-green-400 flex items-center text-sm">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {#if challenge.completed_at}
                          Completed at {new Date(challenge.completed_at).toLocaleTimeString()}
                        {:else}
                          Completed
                        {/if}
                      </span>
                    {:else}
                      <span class="text-gray-500 text-sm">Not completed</span>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center py-16">
      <h2 class="text-2xl font-bold text-white mb-4">Not Signed In</h2>
      <p class="text-gray-400 mb-8">Please sign in to view your profile</p>
      <a
        href="/"
        class="inline-block bg-osu-pink text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all"
      >
        Go to Home
      </a>
    </div>
  {/if}
</div> 