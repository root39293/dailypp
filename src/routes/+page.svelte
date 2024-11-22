<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  onMount(() => {
    console.log('Page Mount - Session Data:', $page.data.session);
  });

  $: {
    console.log('Page Reactive - Session Data:', $page.data.session);
  }
</script>

<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center">
  <div class="text-center max-w-2xl px-4">
    <h1 class="text-5xl font-bold text-white mb-6 tracking-tight">
      Welcome to <span class="text-osu-pink">DailyPP</span>
    </h1>
    
    {#if $page.data.session?.user}
      <p class="text-xl text-gray-300 mb-8">
        Ready for today's challenge, <span class="text-osu-pink">{$page.data.session.user.name}</span>?
      </p>
      <div class="space-y-4">
        <a
          href="/challenges"
          class="block w-full sm:w-auto sm:inline-block bg-osu-pink text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
        >
          View Today's Challenges
        </a>
        <a
          href="/profile"
          class="block w-full sm:w-auto sm:inline-block ml-0 sm:ml-4 bg-transparent border-2 border-osu-pink text-osu-pink px-8 py-3 rounded-lg hover:bg-osu-pink hover:text-white transition-all transform hover:scale-105 shadow-lg"
        >
          View Profile
        </a>
      </div>
    {:else}
      <p class="text-xl text-gray-300 mb-8">
        Challenge yourself daily with personalized beatmap recommendations based on your skill level!
      </p>
      <div class="space-y-6">
        <form action="/auth/signin" method="POST">
          <button
            type="submit"
            class="bg-osu-pink text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
          >
            Sign In with osu!
          </button>
        </form>
        <p class="text-sm text-gray-400">
          Start improving your PP today with personalized daily challenges
        </p>
      </div>
    {/if}

    <!-- Features Section -->
    <div class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-dark-100 p-6 rounded-lg border border-gray-700">
        <h3 class="text-lg font-semibold text-white mb-2">Daily Challenges</h3>
        <p class="text-gray-400">
          Get three new beatmaps every day, tailored to your skill level
        </p>
      </div>
      <div class="bg-dark-100 p-6 rounded-lg border border-gray-700">
        <h3 class="text-lg font-semibold text-white mb-2">Track Progress</h3>
        <p class="text-gray-400">
          Monitor your improvement with detailed statistics and history
        </p>
      </div>
      <div class="bg-dark-100 p-6 rounded-lg border border-gray-700">
        <h3 class="text-lg font-semibold text-white mb-2">Skill-Based</h3>
        <p class="text-gray-400">
          Challenges adapt to your PP, ensuring steady improvement
        </p>
      </div>
    </div>
  </div>
</div>
