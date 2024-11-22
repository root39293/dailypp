<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="text-center">
  <h1 class="text-5xl font-bold text-white mb-6 tracking-tight">
    Welcome to <span class="text-osu-pink">DailyPP</span>
  </h1>
  
  {#if $page.data.session?.user}
    <p class="text-xl text-gray-300 mb-8">
      Ready for today's challenge, {$page.data.session.user.name}?
    </p>
    <a
      href="/challenges"
      class="inline-block bg-osu-pink text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
    >
      View Today's Challenges
    </a>
  {:else}
    <p class="text-xl text-gray-300 mb-8">
      Sign in with your osu! account to start improving your PP today!
    </p>
    <form action="/auth/signin" method="POST">
      <button
        type="submit"
        class="bg-osu-pink text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
      >
        Sign In with osu!
      </button>
    </form>
  {/if}
</div>
