<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import ChallengeCard from '$lib/components/ChallengeCard.svelte';
  import Toast from '$lib/components/Toast.svelte';

  const demoUser = {
    name: "게스트",
    pp_raw: 3500
  };

  const demoChallenges = [
    {
      beatmap: {
        title: "Hatsune Miku - Ai no Sukima",
        version: "Emotions",
        cover_url: "https://assets.ppy.sh/beatmaps/952409/covers/cover.jpg",
        creator: "Log Off Now",
        difficulty_rating: 4.42,
        bpm: 150,
        total_length: 229,
      },
      difficulty: 'EASY',
      beatmap_id: "1988753",
      completed: false
    },
    {
      beatmap: {
        title: "Reol - No title",
        version: "jieusieu's Insane",
        cover_url: "https://assets.ppy.sh/beatmaps/320118/covers/cover.jpg",
        creator: "Flower",
        difficulty_rating: 4.89,
        bpm: 200,
        total_length: 161,
      },
      difficulty: 'NORMAL',
      beatmap_id: "766475",
      completed: false
    },
    {
      beatmap: {
        title: "RADWIMPS - Zenzenzense (movie ver.)",
        version: "Smoke's Extra",
        cover_url: "https://assets.ppy.sh/beatmaps/513590/covers/cover.jpg",
        creator: "Monstrata",
        difficulty_rating: 5.48,
        bpm: 190,
        total_length: 128,
      },
      difficulty: 'HARD',
      beatmap_id: "1091249",
      completed: true,
      completed_at: "2024-01-20T12:00:00Z",
      score: {
        score: 847392,
        accuracy: 0.945,
        max_combo: 378,
        rank: "S",
        created_at: "2024-01-20T12:00:00Z",
        pp: 168
      }
    }
  ] as const;

  let showToast = false;
  
  const handleComplete = async (beatmapId: string) => {
    if (!showToast) {
      showToast = true;
      setTimeout(() => {
        showToast = false;
      }, 3000);
    }
    throw new Error('DEMO_MODE');
  };

  const features = [
    {
      icon: 'fa-chart-line',
      title: 'PP 기반 추천',
      description: '자신의 실력에 맞는 비트맵을 추천받으세요'
    },
    {
      icon: 'fa-calendar-check',
      title: '일일 도전과제',
      description: '매일 새로운 도전과제로 실력을 향상시켜보세요'
    },
    {
      icon: 'fa-trophy',
      title: '진행 현황',
      description: '도전과제 달성도와 PP 변화를 추적하세요'
    }
  ];

  const isDemo = true;
</script>

<div class="min-h-screen bg-dark-300">
  <!-- 배경 효과 - 투명도 낮추고 blur 증가 -->
  <div class="absolute inset-0 overflow-hidden opacity-10">
    <div class="absolute w-[500px] h-[500px] bg-osu-pink rounded-full blur-[160px] animate-float top-0 -left-64"></div>
    <div class="absolute w-[500px] h-[500px] bg-osu-purple rounded-full blur-[160px] animate-float-delayed -bottom-64 right-0"></div>
  </div>

  <!-- 상단 알림 배너 - 배경색 더 진하게 -->
  <div class="sticky top-0 z-50 bg-dark-200/95 backdrop-blur-md border-b border-gray-800/50">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <p class="text-gray-400">
            <span class="font-medium text-white">데모 모드</span>에서 둘러보고 계십니다
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="relative">
    <!-- 헤더 섹션 - 배경색 더 진하게 -->
    <div class="bg-dark-200/80 border-b border-gray-800/50 py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-5xl font-black text-white mb-6">
            오늘의 <span class="text-osu-pink">도전과제</span>
          </h1>
          <p class="text-xl text-gray-400 mb-12">
            매일 새로운 비트맵으로 자신의 실력을 시험해보세요.
            당신의 PP에 맞춤화된 도전과제가 기다리고 있습니다.
          </p>

          <!-- 기능 하이라이트 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {#each features as feature}
              <div 
                class="bg-dark-100/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
                in:fly={{ y: 20, duration: 600 }}
              >
                <div class="w-12 h-12 rounded-xl bg-osu-pink/20 flex items-center justify-center mx-auto mb-4">
                  <i class={`fas ${feature.icon} text-2xl text-osu-pink`}></i>
                </div>
                <h3 class="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p class="text-gray-400 text-sm">{feature.description}</p>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- 챌린지 카드 섹션 - 배경에 그라데이션 추가 -->
    <div class="relative">
      <!-- 배경 그라데이션 -->
      <div class="absolute inset-0 bg-gradient-to-b from-dark-200/50 to-transparent"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 py-12">
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

        <!-- 챌린지 카드 그리드 - 카드 배경색 더 진하게 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each demoChallenges as challenge, i}
            <div 
              class="transform hover:scale-[1.02] transition-all"
              in:fly={{ y: 20, duration: 600, delay: i * 100 }}
            >
              <div class="bg-dark-100/95 backdrop-blur-md rounded-xl border border-gray-800/50 shadow-lg">
                <ChallengeCard 
                  {challenge}
                  onComplete={handleComplete}
                  completing={null}
                  {isDemo}
                />
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- 하단 CTA 섹션 - 배경색 더 진하게 -->
    <div class="bg-dark-200/80 border-t border-gray-800/50 py-16">
      <div class="max-w-2xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">더 많은 기능을 사용하고 싶으신가요?</h2>
        <p class="text-gray-400 mb-8">
          로그인하시면 실제 PP에 맞는 맵 추천과 진행 상황 추적 등<br>
          더 많은 기능을 이용하실 수 있습니다.
        </p>
        <form action="/auth/signin" method="POST">
          <button
            type="submit"
            class="px-8 py-4 bg-osu-pink text-white rounded-lg text-lg font-medium 
                   transition-all hover:bg-opacity-90 hover:translate-y-[-2px] hover:shadow-lg 
                   hover:shadow-osu-pink/20 group"
          >
            <i class="fas fa-sign-in-alt mr-2 transition-transform group-hover:translate-x-1"></i>
            osu!로 시작하기
          </button>
        </form>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes float {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-10px); }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite alternate;
  }

  .animate-float-delayed {
    animation: float 6s ease-in-out infinite alternate-reverse;
  }
</style> 

{#if showToast}
  <Toast 
    message="데모 모드에서는 도전과제를 완료할 수 없습니다. 로그인하시면 실제로 도전과제를 클리어할 수 있습니다!" 
    type="info"
  />
{/if} 