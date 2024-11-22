<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-gradient-to-b from-dark-200 to-dark-300">
  <!-- Navigation Bar -->
  <nav class="bg-dark-100 border-b border-gray-700 shadow-lg">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo / Home -->
        <div>
          <a href="/" class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-osu-pink">DailyPP</span>
          </a>
        </div>

        <!-- Navigation Links -->
        <div class="flex space-x-4">
          {#if $page.data.session?.user}
            <a 
              href="/profile" 
              class="text-gray-200 hover:text-osu-pink px-3 py-2 rounded-md transition-colors"
            >
              Profile
            </a>
            <a 
              href="/challenges" 
              class="text-gray-200 hover:text-osu-pink px-3 py-2 rounded-md transition-colors"
            >
              Challenges
            </a>
            <form action="/auth/signout" method="POST">
              <button 
                type="submit"
                class="text-gray-200 hover:text-osu-pink px-3 py-2 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </form>
          {:else}
            <form action="/auth/signin" method="POST">
              <button 
                type="submit"
                class="bg-osu-pink text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all transform hover:scale-105"
              >
                Sign In with osu!
              </button>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 py-8">
    <slot />
  </main>
</div> 