<script lang="ts">
  import { page } from '$app/stores';

  interface Beatmap {
    id: string;
    title: string;
    version: string;
    difficulty_rating: number;
    bpm: number;
    total_length: number;
    creator: string;
  }

  interface Challenge {
    beatmap_id: string;
    difficulty: 'EASY' | 'NORMAL' | 'HARD';
    completed: boolean;
    completed_at?: Date;
    beatmap?: Beatmap;
  }

  let challenges: Challenge[] = [];
  let loading = true;
  let error: string | null = null;

  async function fetchChallenges() {
    try {
      const response = await fetch('/api/challenges');
      if (!response.ok) throw new Error('Failed to fetch challenges');
      const data = await response.json();
      challenges = data.challenges;
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading = false;
    }
  }

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // 페이지 로드시 챌린지 데이터 가져오기
  fetchChallenges();
</script>

<div class="max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold text-white mb-8">Today's Challenges</h1>

  {#if loading}
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-osu-pink mx-auto"></div>
    </div>
  {:else if error}
    <div class="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg p-4">
      {error}
    </div>
  {:else}
    <div class="grid gap-6">
      {#each challenges as challenge}
        <div class="bg-dark-100 rounded-lg p-6 shadow-lg border border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-sm font-semibold px-3 py-1 rounded-full
                {challenge.difficulty === 'EASY' ? 'bg-green-500 bg-opacity-20 text-green-400' : 
                 challenge.difficulty === 'NORMAL' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' : 
                 'bg-red-500 bg-opacity-20 text-red-400'}">
                {challenge.difficulty}
              </span>
            </div>
            <div>
              {#if challenge.completed}
                <span class="text-green-400 flex items-center">
                  <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </span>
              {:else}
                <button 
                  class="bg-osu-pink hover:bg-opacity-90 text-white px-4 py-2 rounded-md transition-all transform hover:scale-105"
                  on:click={() => {/* TODO: 챌린지 완료 처리 */}}
                >
                  Complete
                </button>
              {/if}
            </div>
          </div>
          
          {#if challenge.beatmap}
            <div class="space-y-2">
              <h2 class="text-xl font-semibold text-white">
                {challenge.beatmap.title} [{challenge.beatmap.version}]
              </h2>
              <div class="text-gray-400 text-sm space-y-1">
                <p>Mapped by {challenge.beatmap.creator}</p>
                <div class="flex space-x-4">
                  <span>★ {challenge.beatmap.difficulty_rating.toFixed(2)}</span>
                  <span>BPM {challenge.beatmap.bpm}</span>
                  <span>Length {formatTime(challenge.beatmap.total_length)}</span>
                </div>
              </div>
            </div>
          {/if}
          
          <div class="mt-4">
            <a 
              href={`https://osu.ppy.sh/beatmaps/${challenge.beatmap_id}`}
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-300 hover:text-osu-pink transition-colors inline-flex items-center"
            >
              View Beatmap
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div> 