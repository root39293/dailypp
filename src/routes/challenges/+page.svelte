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
  let completing: string | null = null;

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

  async function completeChallenge(beatmapId: string) {
    if (completing) return; // 이미 처리 중인 경우 중복 방지
    
    completing = beatmapId;
    try {
      const response = await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ beatmap_id: beatmapId })
      });

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      // 성공시 챌린지 목록 새로고침
      await fetchChallenges();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to complete challenge';
    } finally {
      completing = null;
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
    <div class="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg p-4 mb-4">
      {error}
    </div>
  {:else}
    <div class="grid gap-6">
      {#each challenges as challenge}
        <div class="bg-dark-100 rounded-lg p-6 shadow-lg border border-gray-700 relative overflow-hidden">
          <!-- 난이도 배지 -->
          <div class="absolute top-0 right-0 w-20 h-20">
            <div class="absolute transform rotate-45 bg-opacity-10 text-sm font-bold py-1 text-center w-28 top-5 right-[-8.5rem]
              {challenge.difficulty === 'EASY' ? 'bg-green-500 text-green-400' : 
               challenge.difficulty === 'NORMAL' ? 'bg-yellow-500 text-yellow-400' : 
               'bg-red-500 text-red-400'}">
              {challenge.difficulty}
            </div>
          </div>

          {#if challenge.beatmap}
            <div class="space-y-4">
              <h2 class="text-xl font-semibold text-white pr-16">
                {challenge.beatmap.title} [{challenge.beatmap.version}]
              </h2>
              <div class="text-gray-400 text-sm space-y-2">
                <p>Mapped by {challenge.beatmap.creator}</p>
                <div class="flex flex-wrap gap-4">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {challenge.beatmap.difficulty_rating.toFixed(2)}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {challenge.beatmap.bpm} BPM
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(challenge.beatmap.total_length)}
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-between items-center">
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

              {#if challenge.completed}
                <span class="text-green-400 flex items-center">
                  <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                  {#if challenge.completed_at}
                    <span class="text-sm ml-2">
                      at {new Date(challenge.completed_at).toLocaleTimeString()}
                    </span>
                  {/if}
                </span>
              {:else}
                <button 
                  class="bg-osu-pink hover:bg-opacity-90 text-white px-6 py-2 rounded-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  on:click={() => completeChallenge(challenge.beatmap_id)}
                  disabled={completing === challenge.beatmap_id}
                >
                  {#if completing === challenge.beatmap_id}
                    <span class="flex items-center">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Completing...
                    </span>
                  {:else}
                    Complete
                  {/if}
                </button>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div> 