<script lang="ts">
	import { store } from '$lib/store.svelte';
	import { goto } from '$app/navigation';
	import { logDraft } from '$lib/logDraft.svelte';
	import type { FoodLog } from '$lib/store.svelte';

	let error = $state('');
	let successMsg = $state('');

	const mealTypes = [
		{ id: 'Breakfast' as const, label: 'Breakfast', icon: 'free_breakfast', description: 'Fuel your morning', colorClass: 'text-amber-500 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20' },
		{ id: 'Lunch' as const, label: 'Lunch', icon: 'lunch_dining', description: 'Mid-day energy', colorClass: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20' },
		{ id: 'Dinner' as const, label: 'Dinner', icon: 'dinner_dining', description: 'End your day right', colorClass: 'text-indigo-500 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20' },
		{ id: 'Snacks' as const, label: 'Snacks', icon: 'cookie', description: 'Quick energy bites', colorClass: 'text-rose-500 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20' }
	];

	function selectMeal(type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') {
		logDraft.mealType = type;
		goto('/log/food');
	}

	// Targets
	const dailyTargets = $derived(store.userStats);

	// Load logs created today
	const logsToday = $derived.by(() => {
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date();
		endOfDay.setHours(23, 59, 59, 999);
		return store.foodLogs.filter(log => {
			const logDate = new Date(log.consumed_at);
			return logDate >= startOfDay && logDate <= endOfDay;
		}).sort((a, b) => new Date(b.consumed_at).getTime() - new Date(a.consumed_at).getTime());
	});

	// Derived cumulative totals
	const todayTotals = $derived.by(() => {
		let totalCal = 0, totalProt = 0, totalCarb = 0, totalFat = 0, totalFib = 0;
		for (const item of logsToday) {
			totalCal += item.calories || 0;
			totalProt += item.proteins || 0;
			totalCarb += item.carbs || 0;
			totalFat += item.fats || 0;
			totalFib += item.fiber || 0;
		}
		return {
			calories: totalCal,
			protein: Number(totalProt.toFixed(1)),
			carbs: Number(totalCarb.toFixed(1)),
			fats: Number(totalFat.toFixed(1)),
			fiber: Number(totalFib.toFixed(1))
		};
	});

	function deleteLog(id: string) {
		error = '';
		successMsg = '';
		try {
			store.deleteFoodLog(id);
			successMsg = 'Log entry deleted.';
		} catch (err: unknown) {
			error = 'Failed to delete log entry';
		}
	}

	function repeatLog(log: FoodLog) {
		error = '';
		successMsg = '';
		try {
			store.addFoodLog({
				name: log.name,
				calories: log.calories,
				proteins: log.proteins,
				carbs: log.carbs,
				fats: log.fats,
				fiber: log.fiber,
				consumed_at: new Date().toISOString()
			});
			successMsg = `Logged "${log.name}" again!`;
		} catch (err: unknown) {
			error = 'Failed to repeat log';
		}
	}
</script>

<svelte:head>
	<title>Select Meal | Calzap</title>
	<meta name="description" content="Pick from Breakfast, Lunch, Dinner, or Snacks to log your meal." />
</svelte:head>

<div class="mx-auto max-w-lg pb-12 pt-4 px-4 sm:px-6 md:pt-8 flex flex-col gap-8 animate-in fade-in duration-300">
	<!-- Navigation Header -->
	<header class="flex items-center justify-between border-b border-(--border) pb-6">
		<div class="flex items-center gap-4">
			<button
				type="button"
				id="btn-back-dashboard"
				onclick={() => goto('/dashboard')}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-95 cursor-pointer"
				aria-label="Back to dashboard"
			>
				<span class="material-symbols-outlined text-[20px] select-none leading-none">arrow_back</span>
			</button>
			<div class="flex flex-col">
				<h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Log Meal</h1>
				<p class="text-sm text-zinc-500 dark:text-zinc-400">Step 1 of 3</p>
			</div>
		</div>

		<a
			href="/foods"
			id="link-create-food"
			class="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-xs uppercase tracking-wider transition-all text-center text-zinc-900 dark:text-zinc-50"
		>
			Define Food
		</a>
	</header>

	<!-- Global Alerts -->
	{#if error}
		<div id="alert-error" class="rounded-2xl bg-red-50 p-4 ring-1 ring-inset ring-red-200 dark:bg-red-950/30 dark:ring-red-900/50" role="alert">
			<p class="text-sm font-bold text-red-800 dark:text-red-200">{error}</p>
		</div>
	{/if}

	{#if successMsg}
		<div id="alert-success" class="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 p-4 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-900/50" role="status">
			<p class="text-sm font-bold text-emerald-800 dark:text-emerald-300">{successMsg}</p>
		</div>
	{/if}

	<!-- Meal Types Grid Selection -->
	<section class="flex flex-col gap-4">
		<h2 class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">What are you eating?</h2>
		<div class="grid grid-cols-2 gap-4">
			{#each mealTypes as meal (meal.id)}
				<button
					type="button"
					onclick={() => selectMeal(meal.id)}
					class="flex flex-col items-start p-5 rounded-3xl border border-(--border) bg-(--surface) hover:border-zinc-400 dark:hover:border-zinc-600 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left shadow-xs hover:shadow-md"
				>
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl border {meal.colorClass} mb-4">
						<span class="material-symbols-outlined text-[24px] select-none leading-none">{meal.icon}</span>
					</div>
					<h3 class="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">{meal.label}</h3>
					<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{meal.description}</p>
				</button>
			{/each}
		</div>
	</section>

	<!-- Today's Totals Summary Widget -->
	<section class="rounded-3xl bg-(--surface) border border-(--border) p-6 shadow-xs flex flex-col gap-5">
		<div>
			<h3 class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Total Macros Logged Today</h3>
			<div class="flex items-baseline gap-1.5 mt-1">
				<span class="text-4xl font-black tracking-tight tabular-nums text-calories">
					{todayTotals.calories}
				</span>
				<span class="text-xs font-bold text-zinc-400">/ {dailyTargets.target_calories} kcal</span>
			</div>
		</div>

		<!-- Macro Progress Bars -->
		<div class="flex flex-col gap-4">
			<!-- Protein -->
			<div class="flex flex-col gap-1.5">
				<div class="flex justify-between text-xs font-bold">
					<span class="text-protein">Protein</span>
					<span class="tabular-nums text-zinc-400">{todayTotals.protein}g / {dailyTargets.target_proteins}g</span>
				</div>
				<div class="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
					<div 
						class="h-full rounded-full transition-all duration-500" 
						style="background-color: var(--color-protein); width: {Math.min(100, (todayTotals.protein / dailyTargets.target_proteins) * 100)}%"
					></div>
				</div>
			</div>

			<!-- Carbs -->
			<div class="flex flex-col gap-1.5">
				<div class="flex justify-between text-xs font-bold">
					<span class="text-carbs">Carbs</span>
					<span class="tabular-nums text-zinc-400">{todayTotals.carbs}g / {dailyTargets.target_carbs}g</span>
				</div>
				<div class="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
					<div 
						class="h-full rounded-full transition-all duration-500" 
						style="background-color: var(--color-carbs); width: {Math.min(100, (todayTotals.carbs / dailyTargets.target_carbs) * 100)}%"
					></div>
				</div>
			</div>

			<!-- Fats -->
			<div class="flex flex-col gap-1.5">
				<div class="flex justify-between text-xs font-bold">
					<span class="text-fats">Fats</span>
					<span class="tabular-nums text-zinc-400">{todayTotals.fats}g / {dailyTargets.target_fats}g</span>
				</div>
				<div class="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
					<div 
						class="h-full rounded-full transition-all duration-500" 
						style="background-color: var(--color-fats); width: {Math.min(100, (todayTotals.fats / dailyTargets.target_fats) * 100)}%"
					></div>
				</div>
			</div>

			<!-- Fiber -->
			<div class="flex flex-col gap-1.5">
				<div class="flex justify-between text-xs font-bold">
					<span class="text-fiber">Fiber</span>
					<span class="tabular-nums text-zinc-400">{todayTotals.fiber}g / {dailyTargets.target_fiber}g</span>
				</div>
				<div class="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
					<div 
						class="h-full rounded-full transition-all duration-500" 
						style="background-color: var(--color-fiber); width: {Math.min(100, (todayTotals.fiber / dailyTargets.target_fiber) * 100)}%"
					></div>
				</div>
			</div>
		</div>
	</section>

	<!-- Today's Log entries -->
	<section class="flex flex-col gap-4">
		<h3 class="text-[9px] font-black uppercase tracking-wider text-zinc-400">Logged Today ({logsToday.length})</h3>

		{#if logsToday.length === 0}
			<div class="rounded-3xl border-2 border-dashed border-(--border) p-8 text-center text-zinc-400 dark:text-zinc-600 bg-zinc-50/50 dark:bg-zinc-950/20">
				<p class="font-bold text-sm">No food logged today yet</p>
				<p class="text-xs text-zinc-500 mt-1">Select a meal category above to start logging.</p>
			</div>
		{:else}
			<div class="grid gap-3 max-h-[400px] overflow-y-auto pr-1">
				{#each logsToday as entry (entry.id)}
					<div
						id="log-entry-{entry.id}"
						class="p-4 rounded-2xl bg-(--surface) border border-(--border) flex flex-col gap-2 relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
					>
						<!-- Log Entry Header -->
						<div class="flex items-start justify-between gap-4">
							<div>
								<h4 class="font-bold text-base tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">{entry.name}</h4>
								<div class="flex items-center gap-2 mt-0.5">
									<span class="text-[9px] text-zinc-400 font-bold">
										{#if entry.consumed_at}
											{new Date(entry.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										{/if}
									</span>
									{#if entry.mealType}
										{@const badgeColors = 
											entry.mealType === 'Breakfast' ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' :
											entry.mealType === 'Lunch' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30' :
											entry.mealType === 'Dinner' ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30' :
											'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30'
										}
										<span class="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border {badgeColors}">
											{entry.mealType}
										</span>
									{/if}
								</div>
							</div>
							<div class="flex items-center gap-1.5">
								<!-- Log Again button -->
								<button
									type="button"
									onclick={() => repeatLog(entry)}
									class="h-7 w-7 flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-(--border) text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
									title="Log this again"
								>
									<span class="material-symbols-outlined text-[16px] select-none leading-none">replay</span>
								</button>
								<!-- Delete button -->
								<button
									type="button"
									onclick={() => deleteLog(entry.id)}
									class="h-7 w-7 flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-(--border) text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
									title="Delete log"
								>
									<span class="material-symbols-outlined text-[16px] select-none leading-none">delete</span>
								</button>
							</div>
						</div>

						<!-- Log Entry Macros Summary -->
						<div class="flex items-center gap-3 text-xs font-bold text-zinc-500 pt-1.5 border-t border-zinc-100 dark:border-zinc-900">
							<span class="tabular-nums text-calories">{entry.calories} kcal</span>
							<span>•</span>
							<span class="text-protein tabular-nums">{entry.proteins}g P</span>
							<span>•</span>
							<span class="text-carbs tabular-nums">{entry.carbs}g C</span>
							<span>•</span>
							<span class="text-fats tabular-nums">{entry.fats}g F</span>
							{#if entry.fiber !== undefined && entry.fiber > 0}
								<span>•</span>
								<span class="text-fiber tabular-nums">{entry.fiber}g Fib</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
