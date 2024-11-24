<script lang="ts">
  export let challenge: {
    beatmap: {
      title: string;
      version: string;
      cover_url: string;
      creator: string;
      difficulty_rating: number;
      bpm: number;
      total_length: number;
    };
    difficulty: 'EASY' | 'NORMAL' | 'HARD';
    beatmap_id: string;
    completed: boolean;
    completed_at?: string;
  };
  export let onComplete: (beatmapId: string) => Promise<void>;
  export let completing: string | null;

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://osu.ppy.sh/images/layout/beatmaps/default-bg@2x.jpg';
  }
</script>

<div class="relative bg-dark-300 rounded-2xl overflow-hidden">
  <!-- 커버 이미지 -->
  <div class="relative h-48">
    <img 
      src={challenge.beatmap.cover_url}
      alt={challenge.beatmap.title}
      class="absolute inset-0 w-full h-full object-cover"
      on:error={handleImageError}
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40"></div>
    
    <!-- 난이도 배지 -->
    <div class="absolute top-4 right-4 z-20">
      <div class="px-4 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm
        {challenge.difficulty === 'EASY' ? 'bg-green-500/80 text-white' : 
         challenge.difficulty === 'NORMAL' ? 'bg-yellow-500/80 text-white' : 
         'bg-red-500/80 text-white'}">
        {challenge.difficulty}
      </div>
    </div>

    <!-- 제목과 버전 -->
    <div class="absolute bottom-4 left-4 right-4 z-20">
      <h2 class="text-xl font-bold text-white drop-shadow-lg">
        {challenge.beatmap.title}
      </h2>
      <div class="text-base text-gray-300 mt-1 drop-shadow-lg">
        [{challenge.beatmap.version}]
      </div>
    </div>
  </div>

  <div class="relative p-6">
    <!-- 매퍼 정보 -->
    <div class="flex items-center space-x-2 mb-4">
      <div class="w-8 h-8 rounded-full bg-dark-200 flex items-center justify-center">
        <svg class="w-4 h-4 text-osu-pink" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
        </svg>
      </div>
      <span class="text-gray-400 text-sm">
        mapped by <span class="text-white">{challenge.beatmap.creator}</span>
      </span>
    </div>

    <!-- 비트맵 스탯 -->
    <div class="grid grid-cols-3 gap-2 bg-dark-400/50 rounded-xl p-3 mb-4">
      <div class="text-center">
        <div class="text-yellow-400 text-lg font-bold">
          {challenge.beatmap.difficulty_rating.toFixed(2)}★
        </div>
        <div class="text-xs text-gray-400">SR</div>
      </div>
      <div class="text-center">
        <div class="text-blue-400 text-lg font-bold">
          {challenge.beatmap.bpm}
        </div>
        <div class="text-xs text-gray-400">BPM</div>
      </div>
      <div class="text-center">
        <div class="text-purple-400 text-lg font-bold">
          {formatTime(challenge.beatmap.total_length)}
        </div>
        <div class="text-xs text-gray-400">Length</div>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="flex items-center justify-between gap-3">
      <a 
        href={`https://osu.ppy.sh/beatmaps/${challenge.beatmap_id}`}
        target="_blank"
        rel="noopener noreferrer"
        class="px-4 py-1.5 rounded-lg bg-dark-400 text-white font-medium text-sm
               hover:bg-dark-500 flex items-center space-x-2"
      >
        <span>View Map</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {#if challenge.completed}
        <div class="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-sm flex-grow justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span>Completed</span>
          {#if challenge.completed_at}
            <span class="text-xs text-green-300/70">
              {new Date(challenge.completed_at).toLocaleTimeString()}
            </span>
          {/if}
        </div>
      {:else}
        <button 
          class="flex-grow relative overflow-hidden px-4 py-1.5 rounded-lg bg-osu-pink text-white font-medium text-sm
                 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          on:click={() => onComplete(challenge.beatmap_id)}
          disabled={completing === challenge.beatmap_id}
        >
          {#if completing === challenge.beatmap_id}
            <span class="flex items-center justify-center space-x-2">
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </span>
          {:else}
            Complete
          {/if}
        </button>
      {/if}
    </div>
  </div>
</div> 