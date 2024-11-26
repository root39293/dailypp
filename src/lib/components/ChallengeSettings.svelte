<script lang="ts">
  import type { UserSettings, Difficulty, OsuRank } from '$lib/types';
  import Toast from './Toast.svelte';
  
  const RANKS: OsuRank[] = ['ANY', 'C', 'B', 'A', 'S', 'SH'];
  const DIFFICULTIES: Difficulty[] = ['EASY', 'NORMAL', 'HARD'];
  
  export let settings: UserSettings;
  export let onClose: () => void;
  
  let loading = false;
  let showToast = false;
  let toastMessage = '';
  let toastType: 'info' | 'warning' = 'info';

  const difficultyColors = {
    EASY: 'text-green-400',
    NORMAL: 'text-yellow-400',
    HARD: 'text-red-400'
  };

  async function updateSettings() {
    if (loading) return;
    
    loading = true;
    try {
      const response = await fetch('/api/challenges/setting-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '설정 저장에 실패했습니다');
      }

      toastMessage = '설정이 성공적으로 저장되었습니다';
      toastType = 'info';
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      toastMessage = error instanceof Error ? error.message : '설정 저장 중 오류가 발생했습니다';
      toastType = 'warning';
    } finally {
      loading = false;
      showToast = true;
      setTimeout(() => {
        showToast = false;
      }, 3000);
    }
  }
</script>

<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <div class="bg-dark-100 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
    <!-- 헤더 -->
    <div class="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
      <h3 class="text-lg font-medium text-white">목표 설정</h3>
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button 
        class="text-gray-400 hover:text-white transition-colors"
        on:click={onClose}
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="p-6 space-y-6">
      <p class="text-sm text-gray-400">각 난이도별로 목표 랭크를 설정하세요</p>
      
      <div class="space-y-4">
        {#each DIFFICULTIES as difficulty}
          <div class="bg-dark-200/50 rounded-lg p-4 border border-gray-800/50">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-current {difficultyColors[difficulty]}"></div>
                <span class="font-medium {difficultyColors[difficulty]}">{difficulty}</span>
              </div>
              <select
                bind:value={settings.targetRanks[difficulty]}
                class="bg-dark-300 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm
                       focus:border-osu-pink focus:ring-1 focus:ring-osu-pink outline-none
                       transition-colors"
                disabled={loading}
              >
                {#each RANKS as rank}
                  <option value={rank}>
                    {rank === 'ANY' ? '클리어만' : `${rank} 랭크 이상`}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- 푸터 -->
    <div class="px-6 py-4 bg-dark-200/30 border-t border-gray-800">
      <div class="flex gap-3">
        <button
          class="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg
                 hover:bg-gray-600 transition-colors"
          on:click={onClose}
          disabled={loading}
        >
          취소
        </button>
        <button
          class="flex-1 px-4 py-2 bg-osu-pink text-white rounded-lg relative
                 hover:bg-opacity-90 transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
          on:click={updateSettings}
          disabled={loading}
        >
          {#if loading}
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <span class="opacity-0">저장</span>
          {:else}
            저장
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>

{#if showToast}
  <Toast 
    message={toastMessage}
    type={toastType}
  />
{/if} 