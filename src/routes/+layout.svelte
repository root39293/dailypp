<script lang="ts">
  import '../app.css';
</script>

<div class="flex flex-col min-h-screen">
  <main class="flex-grow">
    <slot />
  </main>

  <footer class="bg-dark-100 border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- 로고 -->
        <div class="text-center md:text-left">
          <h3 class="text-xl font-bold text-white">
            Daily<span class="text-osu-pink">PP</span>
          </h3>
        </div>

        <!-- 링크 -->
        <div class="flex items-center gap-6">
          <a 
            href="https://osu.ppy.sh" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-osu-pink transition-colors text-sm"
          >
            osu! 공식 사이트
          </a>
          <a 
            href="https://github.com/your-repo" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-osu-pink transition-colors text-sm"
          >
            GitHub
          </a>
          <a 
            href="https://qr.kakaopay.com/your-code" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-osu-pink transition-colors text-sm flex items-center gap-1"
          >
            <span>후원하기</span>
            <span class="text-osu-pink">♥</span>
          </a>
        </div>
      </div>

      <!-- 저작권 표시 -->
      <div class="mt-4 text-center text-gray-500 text-xs">
        © {new Date().getFullYear()} DailyPP
      </div>
    </div>
  </footer>
</div> 