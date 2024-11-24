<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import ChallengeCard from '$lib/components/ChallengeCard.svelte';

  let challenges: any[] = [];
  let loading = true;
  let error: string | null = null;
  let completing: string | null = null;

  async function fetchChallenges() {
    if (!$page.data.user) {
      error = 'Not logged in';
      loading = false;
      return;
    }

    try {
      const response = await fetch('/api/challenges');
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      const data = await response.json();
      challenges = data.challenges;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch challenges';
    } finally {
      loading = false;
    }
  }

  async function completeChallenge(beatmapId: string) {
    if (completing) return;
    
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

      await fetchChallenges();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to complete challenge';
    } finally {
      completing = null;
    }
  }

  fetchChallenges();
</script>

<div class="min-h-screen bg-gradient-to-b from-dark-200 to-dark-100">
  <!-- 상단 히어로 섹션 -->
  <div class="bg-gradient-to-br from-osu-pink/10 via-dark-200 to-dark-100 border-b border-gray-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl sm:text-5xl font-bold text-white">
            <span class="text-osu-pink">Daily</span> Challenges
          </h1>
          <p class="mt-3 text-lg text-gray-400 max-w-2xl">
            매일 새로운 비트맵으로 자신의 실력을 시험해보세요. 난이도별 3개의 도전과제가 기다리고 있습니다.
          </p>
        </div>
        
        <!-- 진행 상황 표시 -->
        {#if !loading && !error && challenges.length > 0}
          <div class="bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
            <div class="text-sm text-gray-400 mb-2">오늘의 진행상황</div>
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2">
                {#each challenges as challenge}
                  <div class="w-8 h-8 rounded-full border-2 border-dark-300 flex items-center justify-center
                    {challenge.completed ? 
                      'bg-green-500 text-white' : 
                      'bg-dark-200 text-gray-500'}"
                  >
                    <i class="fas fa-check text-xs"></i>
                  </div>
                {/each}
              </div>
              <div class="text-lg font-bold text-white">
                {challenges.filter(c => c.completed).length}/{challenges.length}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- 메인 컨텐츠 영역 -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    {#if loading}
      <div class="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    {:else if error}
      <div class="max-w-lg mx-auto">
        <ErrorAlert message={error} />
      </div>
    {:else}
      <!-- 난이도 필터 -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex gap-2">
          <div class="px-4 py-1.5 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
            Easy
          </div>
          <div class="px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400">
            Normal
          </div>
          <div class="px-4 py-1.5 rounded-full text-sm font-medium bg-red-500/20 text-red-400">
            Hard
          </div>
        </div>
        <div class="text-sm text-gray-400">
          매일 00:00 KST에 갱신
        </div>
      </div>

      <!-- 챌린지 카드 그리드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each challenges as challenge}
          <ChallengeCard 
            {challenge}
            onComplete={completeChallenge}
            {completing}
          />
        {/each}
      </div>
    {/if}
  </div>
</div> 