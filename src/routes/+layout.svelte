<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  type SessionUser = {
    id: string;
    name: string;
    pp_raw?: number;
  };

  let user = $page.data.session?.user as SessionUser | null;
  let userPP: number | undefined = undefined;

  onMount(async () => {
    if (user?.id) {
      try {
        const response = await fetch(`/api/user/stats/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          userPP = data.pp_raw;
        }
      } catch (error) {
        console.error('Failed to fetch user PP:', error);
      }
    }
  });
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
        <div class="hidden md:flex items-center space-x-8">
          {#if user}
            <a
              href="/challenges"
              class="text-gray-300 hover:text-white transition-colors"
              class:text-osu-pink={$page.url.pathname === '/challenges'}
            >
              Challenges
            </a>
            <a
              href="/profile"
              class="text-gray-300 hover:text-white transition-colors"
              class:text-osu-pink={$page.url.pathname === '/profile'}
            >
              Profile
            </a>
          {/if}
        </div>

        <!-- Auth Button / User Menu -->
        <div class="flex items-center space-x-4">
          {#if user}
            <div class="flex items-center space-x-3">
              <img
                src={`https://a.ppy.sh/${user.id}`}
                alt="Profile"
                class="w-8 h-8 rounded-full border border-gray-700"
              />
              <div class="hidden md:block">
                <p class="text-sm font-medium text-white">{user?.name}</p>
                {#if userPP !== undefined}
                  <p class="text-xs text-gray-400">{userPP.toFixed(2)}pp</p>
                {/if}
              </div>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  class="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          {:else}
            <form action="/auth/signin" method="POST">
              <button
                type="submit"
                class="bg-osu-pink text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all text-sm"
              >
                Sign In with osu!
              </button>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </nav>

  <!-- Page Content -->
  <main class="container mx-auto px-4">
    <slot />
  </main>
</div> 