<script lang="ts">
  import { fade } from 'svelte/transition';
  
  export let show = false;
  export let onSubmit: (feedback: {
    pattern_type: 'STREAM' | 'JUMP' | 'TECHNICAL' | 'SIMPLE_RHYTHM',
    difficulty_feel: 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD'
  }) => void;
  export let onClose: () => void;

  let selectedPattern: 'STREAM' | 'JUMP' | 'TECHNICAL' | 'SIMPLE_RHYTHM' | null = null;
  let selectedDifficulty: 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD' | null = null;
  
  const patternTypes = [
    {
      type: 'STREAM' as const,
      label: '스트림',
      description: '연속된 서클을 빠르게 클릭하는 패턴입니다.',
      example: '예시: 1/4박자의 연속된 노트'
    },
    {
      type: 'JUMP' as const,
      label: '점프',
      description: '서클 간 거리가 멀어 마우스를 크게 움직여야 하는 패턴입니다.',
      example: '예시: 화면 양쪽을 번갈아 클릭'
    },
    {
      type: 'TECHNICAL' as const,
      label: '테크니컬',
      description: '복잡한 리듬과 움직임이 필요한 고난도 패턴입니다.',
      example: '예시: 변칙적인 리듬, 스트림과 점프의 혼합'
    },
    {
      type: 'SIMPLE_RHYTHM' as const,
      label: '단순 리듬',
      description: '기본적인 리듬으로 구성된 패턴입니다.',
      example: '예시: 1/1, 1/2박자의 기본적인 노트 배치'
    }
  ];

  function handleSubmit() {
    if (selectedPattern && selectedDifficulty) {
      onSubmit({
        pattern_type: selectedPattern,
        difficulty_feel: selectedDifficulty
      });
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
       transition:fade
       on:click|self={onClose}
  >
    <div class="bg-dark-100 rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-800/50">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-white">비트맵 피드백</h3>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button 
          class="text-gray-400 hover:text-white"
          on:click={onClose}
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- 패턴 타입 선택 -->
      <div class="mb-6">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="block text-sm font-medium text-gray-400 mb-3">
          이 맵의 주요 패턴 타입은 무엇인가요?
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          {#each patternTypes as pattern}
            <div 
              class="relative group"
              on:mouseenter={() => {
                const tooltip = document.getElementById(`tooltip-${pattern.type}`);
                if (tooltip) tooltip.style.display = 'block';
              }}
              on:mouseleave={() => {
                const tooltip = document.getElementById(`tooltip-${pattern.type}`);
                if (tooltip) tooltip.style.display = 'none';
              }}
            >
              <button
                class="w-full px-4 py-3 rounded-lg border text-left
                  {selectedPattern === pattern.type
                    ? 'bg-osu-pink/20 border-osu-pink text-white'
                    : 'bg-dark-200/50 border-gray-800/50 text-gray-400 hover:bg-dark-200'}"
                on:click={() => selectedPattern = pattern.type}
              >
                {pattern.label}
              </button>
              
              <!-- 툴팁 -->
              <div
                id="tooltip-{pattern.type}"
                class="hidden absolute left-full ml-2 top-0 z-10 w-64 p-3 bg-dark-300 rounded-lg border border-gray-800/50 shadow-xl"
                style="display: none;"
              >
                <p class="text-white text-sm mb-2">{pattern.description}</p>
                <p class="text-gray-400 text-xs">{pattern.example}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 난이도 체감 선택 -->
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-400 mb-3">
          난이도는 어떻게 느끼셨나요?
        </label>
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-3 rounded-lg border
              {selectedDifficulty === 'TOO_EASY'
                ? 'bg-green-500/20 border-green-500 text-white'
                : 'bg-dark-200/50 border-gray-800/50 text-gray-400 hover:bg-dark-200'}"
            on:click={() => selectedDifficulty = 'TOO_EASY'}
          >
            쉬움
          </button>
          <button
            class="flex-1 px-4 py-3 rounded-lg border
              {selectedDifficulty === 'JUST_RIGHT'
                ? 'bg-blue-500/20 border-blue-500 text-white'
                : 'bg-dark-200/50 border-gray-800/50 text-gray-400 hover:bg-dark-200'}"
            on:click={() => selectedDifficulty = 'JUST_RIGHT'}
          >
            적당함
          </button>
          <button
            class="flex-1 px-4 py-3 rounded-lg border
              {selectedDifficulty === 'TOO_HARD'
                ? 'bg-red-500/20 border-red-500 text-white'
                : 'bg-dark-200/50 border-gray-800/50 text-gray-400 hover:bg-dark-200'}"
            on:click={() => selectedDifficulty = 'TOO_HARD'}
          >
            어려움
          </button>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 rounded-lg text-gray-400 hover:text-white"
          on:click={onClose}
        >
          취소
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-osu-pink text-white font-medium
                 disabled:opacity-50 disabled:cursor-not-allowed
                 hover:bg-opacity-90"
          disabled={!selectedPattern || !selectedDifficulty}
          on:click={handleSubmit}
        >
          제출하기
        </button>
      </div>
    </div>
  </div>
{/if} 