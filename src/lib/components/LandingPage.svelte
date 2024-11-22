<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  export let isLoaded: boolean;

  const features = [
    { title: '랜덤 비트맵', desc: 'PP 기반 난이도별 비트맵 추천' },
    { title: '일일 도전과제', desc: '매일 3개 신규 비트맵 과제 갱신' },
    { title: '진행 현황', desc: '과제 달성도 및 PP 변화 기록' }
  ];

  const demoMaps = [
    { 
      title: "Reol - No title [Lust's Insane]",
      difficulty: "5.42★",
      pp: "183pp",
      status: "도전 가능"
    },
    { 
      title: "JP - Boku ni Invitation [Special Blend]",
      difficulty: "5.38★",
      pp: "185pp",
      status: "완료"
    },
    { 
      title: "Sawai Miku - Colorful [Prismatic]",
      difficulty: "5.45★",
      pp: "185pp",
      status: "도전 가능"
    }
  ];

  let activeDemoIndex = 0;
  
  function cycleDemoMaps() {
    activeDemoIndex = (activeDemoIndex + 1) % demoMaps.length;
  }

  if (typeof window !== 'undefined') {
    setInterval(cycleDemoMaps, 3000);
  }

  function handleImageError(index: number) {
    console.log(`Image ${index} load failed`);
  }
</script>

<div class="relative min-h-screen bg-dark-300">
  <!-- 배경 효과 -->
  <div class="absolute inset-0 overflow-hidden opacity-20">
    <div class="absolute w-[500px] h-[500px] bg-osu-pink rounded-full blur-[128px] animate-float top-0 -left-64"></div>
    <div class="absolute w-[500px] h-[500px] bg-osu-purple rounded-full blur-[128px] animate-float-delayed -bottom-64 right-0"></div>
  </div>

  <div class="relative min-h-screen flex items-center px-8">
    <div class="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.2fr,1.8fr] gap-12 items-center">
      <!-- 왼쪽 콘텐츠 섹션 -->
      <div class="space-y-16 lg:pl-8">
        {#if isLoaded}
          <div class="space-y-8">
            <div 
              class="inline-block px-4 py-1 bg-dark-100 rounded-full"
              in:fly={{ y: 20, duration: 800 }}
            >
              <span class="text-osu-pink text-sm font-bold tracking-wider">BETA</span>
            </div>

            <div class="space-y-4">
              <h1 
                class="text-7xl font-black text-white tracking-tight"
                in:fly={{ y: 50, duration: 1000, delay: 200 }}
              >
                Daily<span class="text-osu-pink">PP</span>
              </h1>

              <p 
                class="text-2xl text-gray-300 font-medium"
                in:fly={{ y: 50, duration: 1000, delay: 400 }}
              >
                일일 osu! 맵 추천
              </p>
            </div>
          </div>

          <!-- 특징 목록 -->
          <div 
            class="space-y-6"
            in:fly={{ y: 50, duration: 1000, delay: 600 }}
          >
            {#each features as feature}
              <div class="flex items-start space-x-4 p-4 rounded-lg hover:bg-dark-100 transition-colors">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-white mb-1">{feature.title}</h3>
                  <p class="text-gray-400 text-lg">{feature.desc}</p>
                </div>
              </div>
            {/each}
          </div>

          <div 
            class="pt-4"
            in:fly={{ y: 50, duration: 1000, delay: 800 }}
          >
            <form action="/auth/signin" method="POST">
              <button
                type="submit"
                class="group relative px-8 py-4 bg-osu-pink text-white rounded-lg text-lg font-medium 
                       transition-all hover:bg-opacity-90 hover:translate-y-[-2px] hover:shadow-lg 
                       hover:shadow-osu-pink/20"
              >
                osu!로 시작하기
              </button>
            </form>
          </div>
        {/if}
      </div>

      <!-- 오른쪽 데모 섹션 -->
      {#if isLoaded}
        <div 
          class="relative h-[700px] w-full lg:pr-8"
          in:fly={{ x: 50, duration: 1000, delay: 1000 }}
        >
          <!-- 메인 컨테이너 -->
          <div class="absolute inset-0 rounded-xl bg-dark-100/30 backdrop-blur-sm border border-gray-800/30 overflow-hidden">
            <!-- 장식용 이미지들 -->
            <div class="absolute inset-0 z-0">
              <!-- 메인 이미지 -->
              <div class="absolute -top-20 -right-20 w-[700px] rotate-3">
                <img 
                  src="/images/1.jpg" 
                  alt="osu! 일러스트 1" 
                  class="w-full h-auto"
                />
              </div>

              <!-- 우측 하단 이미지 -->
              <div class="absolute bottom-0 right-0 w-[500px] -rotate-6 translate-y-20 translate-x-32">
                <img 
                  src="/images/2.jpg" 
                  alt="osu! 일러스트 2" 
                  class="w-full h-auto"
                />
              </div>

              <!-- 좌측 하단 이미지 -->
              <div class="absolute bottom-0 left-0 w-[400px] rotate-6 translate-y-16 translate-x-8">
                <img 
                  src="/images/3.jpg" 
                  alt="osu! 일러스트 3" 
                  class="w-full h-auto"
                />
              </div>
            </div>

            <!-- UI 컨테이너 -->
            <div class="relative z-10 h-full flex flex-col justify-center p-10">
              <!-- 데모 카드 -->
              <div class="max-w-2xl w-full bg-dark-100/95 rounded-xl p-8 border border-gray-800/50 backdrop-blur-md shadow-2xl">
                <div class="flex items-center justify-between mb-8">
                  <h3 class="text-xl font-bold text-white">오늘의 도전과제</h3>
                </div>
                
                {#key activeDemoIndex}
                  <div 
                    class="bg-dark-200/80 rounded-lg p-6 transition-all hover:bg-dark-200/90"
                    in:fade={{ duration: 300 }}
                  >
                    <div class="flex items-center justify-between gap-4">
                      <div class="text-left flex-1">
                        <div class="text-white font-medium text-lg">{demoMaps[activeDemoIndex].title}</div>
                        <div class="text-sm text-gray-400 mt-1">
                          난이도: {demoMaps[activeDemoIndex].difficulty} | 예상 PP: {demoMaps[activeDemoIndex].pp}
                        </div>
                      </div>
                      <div class={`px-4 py-2 rounded-full text-sm font-medium ${
                        demoMaps[activeDemoIndex].status === '완료' 
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-osu-pink/10 text-osu-pink'
                      }`}>
                        {demoMaps[activeDemoIndex].status}
                      </div>
                    </div>
                  </div>
                {/key}

                <!-- 진행률 표시 -->
                <div class="mt-8 flex items-center justify-between">
                  <div class="flex-1 mr-8">
                    <div class="h-2 bg-dark-300 rounded-full overflow-hidden">
                      <div class="h-full w-1/3 bg-osu-pink rounded-full"></div>
                    </div>
                    <div class="mt-3 flex justify-between text-sm">
                      <span class="text-gray-400">오늘의 진행률</span>
                      <span class="text-osu-pink font-medium">1/3</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-400">획득 가능</div>
                    <div class="text-3xl font-bold text-osu-pink">
                      +187pp
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 추가 그라데이션 효과 -->
            <div class="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-transparent to-transparent"></div>
          </div>
        </div>
      {/if}
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