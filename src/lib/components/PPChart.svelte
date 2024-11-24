<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  
  export let data: {
    pp: number;
    recorded_at: string;
  }[];

  let canvas: HTMLCanvasElement;
  let chart: Chart;

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => new Date(d.recorded_at).toLocaleDateString()),
        datasets: [{
          label: 'Performance Points',
          data: data.map(d => d.pp),
          borderColor: '#FF66AB',
          backgroundColor: 'rgba(255, 102, 171, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 102, 171, 0.3)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#9CA3AF'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#9CA3AF'
            }
          }
        }
      }
    });

    return () => {
      chart.destroy();
    };
  });
</script>

<div class="w-full h-[300px]">
  <canvas bind:this={canvas}></canvas>
</div> 