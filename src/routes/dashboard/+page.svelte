<script lang="ts">
	import MacroBar from '$lib/components/MacroBar.svelte';
	import { auth } from '$lib/user.svelte';
	import { pb } from '$lib/pb';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { FoodLogsResponse } from '../../pocketbase-types';

	let dailyTargets = $state({
		calories: 2500,
		protein: 180,
		carbs: 250,
		fats: 70,
		fiber: 35
	});

	let logsToday = $state<FoodLogsResponse[]>([]);

	// Derive today's macro intake totals dynamically from database logs
	const consumed = $derived.by(() => {
		let totalCal = 0;
		let totalProt = 0;
		let totalCarb = 0;
		let totalFat = 0;
		let totalFib = 0;
		for (const item of logsToday) {
			totalCal = totalCal + (item.calories ?? 0);
			totalProt = totalProt + (item.proteins ?? 0);
			totalCarb = totalCarb + (item.carbs ?? 0);
			totalFat = totalFat + (item.fats ?? 0);
			totalFib = totalFib + (item.fiber ?? 0);
		}
		return {
			calories: totalCal,
			protein: Number(totalProt.toFixed(1)),
			carbs: Number(totalCarb.toFixed(1)),
			fats: Number(totalFat.toFixed(1)),
			fiber: Number(totalFib.toFixed(1))
		};
	});

	const remainingCalories = $derived(dailyTargets.calories - consumed.calories);

	// Fetch target stats for the user (secured to current user)
	async function fetchTargets() {
		if (auth.user?.id) {
			try {
				const record = await pb.collection('user_stats').getOne(auth.user.id);
				
				if (record.target_calories !== undefined && record.target_calories !== null) {
					dailyTargets.calories = record.target_calories;
				}
				if (record.target_proteins !== undefined && record.target_proteins !== null) {
					dailyTargets.protein = record.target_proteins;
				}
				if (record.target_carbs !== undefined && record.target_carbs !== null) {
					dailyTargets.carbs = record.target_carbs;
				}
				if (record.target_fats !== undefined && record.target_fats !== null) {
					dailyTargets.fats = record.target_fats;
				}
				if (record.target_fiber !== undefined && record.target_fiber !== null) {
					dailyTargets.fiber = record.target_fiber;
				}
			} catch (err: unknown) {
				// Fallback to defaults if stats do not exist yet
			}
		}
	}

	// Fetch logs created today (secured to current user)
	async function fetchLogsToday() {
		if (auth.user?.id) {
			try {
				const startOfDay = new Date();
				startOfDay.setHours(0, 0, 0, 0);
				
				const filterStr = pb.filter('user = {:userId} && consumed_at >= {:startOfDay}', {
					userId: auth.user.id,
					startOfDay: startOfDay.toISOString()
				});
				
				const result = await pb.collection('food_logs').getList<FoodLogsResponse>(1, 100, {
					filter: filterStr,
					sort: '-consumed_at'
				});
				logsToday = result.items;
			} catch (err: unknown) {
				console.error('Error fetching today\'s logs:', err);
			}
		}
	}

	async function deleteLog(id: string) {
		if (!confirm('Are you sure you want to delete this log entry?')) {
			return;
		}
		try {
			const record = await pb.collection('food_logs').getOne(id);
			if (record.user !== auth.user?.id) {
				console.error('Unauthorized operation');
				return;
			}
			await pb.collection('food_logs').delete(id);
			await fetchLogsToday();
		} catch (err: unknown) {
			console.error('Failed to delete log entry:', err);
		}
	}

	onMount(() => {
		if (!auth.isValid) {
			goto('/login');
		} else {
			fetchTargets();
			fetchLogsToday();
		}
	});
</script>

<svelte:head>
	<title>Dashboard | Food Factor</title>
</svelte:head>

<main class="max-w-md mx-auto px-6 py-12 flex flex-col gap-12 animate-in fade-in duration-300">
	<!-- Header / Summary -->
	<header class="flex flex-col gap-1">
		<h1 class="text-sm font-bold tracking-widest uppercase text-muted">Daily Summary</h1>
		<div class="flex items-baseline gap-2">
			<span class="text-6xl font-black tracking-tighter tabular-nums" style="color: var(--color-calories)">
				{remainingCalories}
			</span>
			<span class="text-xl font-bold text-muted">kcal left</span>
		</div>
	</header>

	<!-- Macros Grid -->
	<section class="grid gap-8">
		<MacroBar 
			label="Protein" 
			value={consumed.protein} 
			target={dailyTargets.protein} 
			unit="g" 
			color="var(--color-protein)" 
		/>
		<MacroBar 
			label="Carbs" 
			value={consumed.carbs} 
			target={dailyTargets.carbs} 
			unit="g" 
			color="var(--color-carbs)" 
		/>
		<MacroBar 
			label="Fats" 
			value={consumed.fats} 
			target={dailyTargets.fats} 
			unit="g" 
			color="var(--color-fats)" 
		/>
		<MacroBar 
			label="Fiber" 
			value={consumed.fiber} 
			target={dailyTargets.fiber} 
			unit="g" 
			color="var(--color-fiber)" 
		/>
	</section>

	<!-- Actions -->
	<section class="flex flex-col gap-4 mt-4">
		<button 
			type="button"
			onclick={() => goto('/log')}
			class="w-full py-4 rounded-2xl bg-(--fg) text-(--bg) font-bold text-lg shadow-xl shadow-black/10 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
			Log Meal
		</button>
		
		<div class="grid grid-cols-2 gap-4">
			<button 
				type="button"
				onclick={() => goto('/log')}
				class="py-3 rounded-xl bg-(--surface) border border-(--border) font-semibold text-sm active:scale-[0.98] transition-transform cursor-pointer"
			>
				Quick Add
			</button>
			<button 
				type="button"
				onclick={() => goto('/log')}
				class="py-3 rounded-xl bg-(--surface) border border-(--border) font-semibold text-sm active:scale-[0.98] transition-transform cursor-pointer"
			>
				Scanner
			</button>
		</div>
	</section>

	<!-- Logged Today Section -->
	<section class="flex flex-col gap-4 mt-2 animate-in fade-in duration-300">
		<div class="flex items-center justify-between">
			<h2 class="text-xs font-black uppercase tracking-wider text-muted">Tracked Today ({logsToday.length})</h2>
			{#if logsToday.length > 0}
				<span class="text-xs font-bold style-color-calories">{consumed.calories} kcal consumed</span>
			{/if}
		</div>

		{#if logsToday.length === 0}
			<div class="rounded-3xl border-2 border-dashed border-(--border) p-8 text-center text-zinc-400 dark:text-zinc-600">
				<p class="font-bold text-sm">No food tracked today yet</p>
				<p class="text-xs text-zinc-500 mt-1">Tap Log Meal above to start tracking!</p>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each logsToday as entry (entry.id)}
					<div
						id="dashboard-log-{entry.id}"
						class="p-4 rounded-2xl bg-(--surface) border border-(--border) flex flex-col gap-2 relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
					>
						<div class="flex items-start justify-between gap-4">
							<div class="flex flex-col">
								<h4 class="font-bold text-base tracking-tight leading-tight">{entry.name}</h4>
								<span class="text-[10px] text-zinc-400 font-semibold mt-0.5">
									{#if entry.consumed_at}
										{new Date(entry.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
									{/if}
								</span>
							</div>
							
							<button
								type="button"
								onclick={() => deleteLog(entry.id)}
								class="h-7 w-7 flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-(--border) text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
								title="Delete log"
								aria-label="Delete log entry"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
							</button>
						</div>

						<!-- Mini macro labels -->
						<div class="flex items-center gap-3 text-xs font-bold text-zinc-500 pt-1.5 border-t border-zinc-100 dark:border-zinc-900">
							<span class="tabular-nums style-color-calories">{entry.calories} kcal</span>
							<span>•</span>
							<span class="text-rose-500 tabular-nums">{entry.proteins}g P</span>
							<span>•</span>
							<span class="text-amber-500 tabular-nums">{entry.carbs}g C</span>
							<span>•</span>
							<span class="text-blue-500 tabular-nums">{entry.fats}g F</span>
							{#if entry.fiber !== undefined && entry.fiber > 0}
								<span>•</span>
								<span class="text-emerald-500 tabular-nums">{entry.fiber}g Fib</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</main>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
	.style-color-calories {
		color: var(--color-calories);
	}
</style>
