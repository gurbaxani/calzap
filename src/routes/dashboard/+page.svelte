<script lang="ts">
	import MacroBar from '$lib/components/MacroBar.svelte';
	import { auth } from '$lib/user.svelte';
	import { pb } from '$lib/pb';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import type { FoodLogsResponse } from '../../../pocketbase-types';

	let dailyTargets = $state({
		calories: 2500,
		protein: 180,
		carbs: 250,
		fats: 70,
		fiber: 35
	});

	let selectedDate = $state(new Date());
	let logsToday = $state<FoodLogsResponse[]>([]);
	let recentFoods = $state<{
		name: string;
		calories: number;
		proteins: number;
		carbs: number;
		fats: number;
		fiber: number;
	}[]>([]);

	let showConsumedCal = $state(false);
	let showQuickAdd = $state(false);
	let isSaving = $state(false);

	let quickLog = $state({
		name: '',
		calories: undefined as number | undefined,
		protein: undefined as number | undefined,
		carbs: undefined as number | undefined,
		fats: undefined as number | undefined,
		fiber: undefined as number | undefined
	});

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

	// Fetch logs created on the selected date (secured to current user)
	async function fetchLogsForDate(date: Date) {
		if (auth.user?.id) {
			try {
				const startOfDay = new Date(date);
				startOfDay.setHours(0, 0, 0, 0);
				
				const endOfDay = new Date(date);
				endOfDay.setHours(23, 59, 59, 999);
				
				const filterStr = pb.filter('user = {:userId} && consumed_at >= {:startOfDay} && consumed_at <= {:endOfDay}', {
					userId: auth.user.id,
					startOfDay: startOfDay.toISOString(),
					endOfDay: endOfDay.toISOString()
				});
				
				const result = await pb.collection('food_logs').getList<FoodLogsResponse>(1, 100, {
					filter: filterStr,
					sort: '-consumed_at'
				});
				logsToday = result.items;
			} catch (err: unknown) {
				console.error('Error fetching logs:', err);
			}
		}
	}

	async function fetchRecentFoods() {
		if (auth.user?.id) {
			try {
				const result = await pb.collection('food_logs').getList<FoodLogsResponse>(1, 30, {
					filter: pb.filter('user = {:userId}', { userId: auth.user.id }),
					sort: '-consumed_at'
				});
				
				// Group and get unique foods by name
				const uniqueMap = new Map<string, typeof recentFoods[number]>();
				for (const item of result.items) {
					if (item.name && !uniqueMap.has(item.name)) {
						uniqueMap.set(item.name, {
							name: item.name,
							calories: item.calories ?? 0,
							proteins: item.proteins ?? 0,
							carbs: item.carbs ?? 0,
							fats: item.fats ?? 0,
							fiber: item.fiber ?? 0
						});
					}
					if (uniqueMap.size >= 5) break;
				}
				recentFoods = Array.from(uniqueMap.values());
			} catch (err: unknown) {
				console.error('Error fetching recent foods:', err);
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
			await fetchLogsForDate(selectedDate);
			await fetchRecentFoods();
		} catch (err: unknown) {
			console.error('Failed to delete log entry:', err);
		}
	}

	function changeDate(days: number) {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() + days);
		selectedDate = newDate;
		fetchLogsForDate(selectedDate);
	}

	function formatSelectedDate(date: Date): string {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0, 0, 0, 0);
		
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);
		
		if (d.getTime() === today.getTime()) {
			return 'Today';
		} else if (d.getTime() === yesterday.getTime()) {
			return 'Yesterday';
		} else {
			return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
		}
	}

	async function saveQuickLog() {
		if (!auth.user?.id) return;
		isSaving = true;
		try {
			await pb.collection('food_logs').create({
				user: auth.user.id,
				name: quickLog.name || 'Quick Log',
				calories: Number(quickLog.calories ?? 0),
				proteins: Number(quickLog.protein ?? 0),
				carbs: Number(quickLog.carbs ?? 0),
				fats: Number(quickLog.fats ?? 0),
				fiber: Number(quickLog.fiber ?? 0),
				consumed_at: new Date().toISOString()
			});
			// Reset inputs
			quickLog = {
				name: '',
				calories: undefined,
				protein: undefined,
				carbs: undefined,
				fats: undefined,
				fiber: undefined
			};
			showQuickAdd = false;
			await fetchLogsForDate(selectedDate);
			await fetchRecentFoods();
		} catch (err: unknown) {
			console.error('Failed to create quick log:', err);
		} finally {
			isSaving = false;
		}
	}

	async function logRecentFood(food: typeof recentFoods[number]) {
		if (!auth.user?.id) return;
		try {
			await pb.collection('food_logs').create({
				user: auth.user.id,
				name: food.name,
				calories: food.calories,
				proteins: food.proteins,
				carbs: food.carbs,
				fats: food.fats,
				fiber: food.fiber,
				consumed_at: new Date().toISOString()
			});
			// Always reset selection to today when adding a new meal
			selectedDate = new Date();
			await fetchLogsForDate(selectedDate);
		} catch (err: unknown) {
			console.error('Failed to log recent food:', err);
		}
	}

	onMount(() => {
		if (!auth.isValid) {
			goto('/login');
		} else {
			fetchTargets();
			fetchLogsForDate(selectedDate);
			fetchRecentFoods();
		}
	});
</script>

<svelte:head>
	<title>Dashboard | Food Factor</title>
</svelte:head>

<main class="max-w-md mx-auto px-6 py-8 flex flex-col gap-8 animate-in fade-in duration-300">
	<!-- Date Switcher Segmented Control -->
	<header class="flex flex-col gap-6">
		<div class="flex items-center justify-between bg-(--surface) border border-(--border) rounded-2xl p-1.5 shadow-sm">
			<button 
				type="button" 
				onclick={() => changeDate(-1)} 
				class="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-[oklch(from_var(--border)_l_c_h_/_0.3)] transition-colors cursor-pointer"
				aria-label="Previous day"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
				</svg>
			</button>
			
			<span class="font-extrabold text-sm tracking-wider uppercase text-muted">
				{formatSelectedDate(selectedDate)}
			</span>
			
			<button 
				type="button" 
				onclick={() => changeDate(1)} 
				class="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-[oklch(from_var(--border)_l_c_h_/_0.3)] transition-colors cursor-pointer"
				aria-label="Next day"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-5">
					<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
				</svg>
			</button>
		</div>

		<!-- Calorie Intake Dashboard -->
		<div class="flex flex-col gap-1.5">
			<button 
				type="button" 
				onclick={() => { showConsumedCal = !showConsumedCal; }} 
				class="group flex flex-col items-start bg-transparent border-0 p-0 text-left cursor-pointer focus:outline-hidden"
			>
				<div class="flex items-baseline gap-2 group-hover:opacity-90 transition-opacity">
					{#if showConsumedCal}
						<span class="text-6xl font-black tracking-tighter tabular-nums" style="color: var(--color-calories)">
							{consumed.calories}
						</span>
						<span class="text-lg font-bold text-muted">/ {dailyTargets.calories} kcal</span>
					{:else}
						{#if remainingCalories >= 0}
							<span class="text-6xl font-black tracking-tighter tabular-nums" style="color: var(--color-calories)">
								{remainingCalories}
							</span>
							<span class="text-lg font-bold text-muted">kcal left</span>
						{:else}
							<span class="text-6xl font-black tracking-tighter tabular-nums text-rose-500">
								{Math.abs(remainingCalories)}
							</span>
							<span class="text-lg font-bold text-rose-500">kcal over</span>
						{/if}
					{/if}
				</div>
				<span class="text-[10px] font-black text-muted/60 uppercase tracking-widest mt-1">
					{#if showConsumedCal}
						Showing Total Consumed • Tap to view left
					{:else}
						{#if remainingCalories >= 0}
							Showing Remaining • Tap to view consumed
						{:else}
							Exceeded Daily Target • Tap to view consumed
						{/if}
					{/if}
				</span>
			</button>
		</div>
	</header>

	<!-- Macros Grid (2x2) -->
	<section class="grid grid-cols-2 gap-4">
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
	<section class="flex flex-col gap-4 mt-2">
		<button 
			type="button"
			onclick={() => goto('/log')}
			class="w-full py-4 rounded-2xl bg-(--fg) text-(--bg) font-bold text-lg shadow-xl shadow-black/10 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
			Log Meal
		</button>
		
		<div class="grid grid-cols-2 gap-4">
			<button 
				type="button"
				onclick={() => { showQuickAdd = !showQuickAdd; }}
				class="py-3.5 rounded-2xl bg-(--surface) border border-(--border) font-bold text-sm active:scale-[0.98] transition-transform cursor-pointer"
			>
				{#if showQuickAdd}
					Cancel Quick Add
				{:else}
					Quick Add
				{/if}
			</button>
			<button 
				type="button"
				onclick={() => goto('/log')}
				class="py-3.5 rounded-2xl bg-(--surface) border border-(--border) font-bold text-sm active:scale-[0.98] transition-transform cursor-pointer"
			>
				Scanner
			</button>
		</div>

		<!-- Quick Add Slide Panel -->
		{#if showQuickAdd}
			<div 
				transition:slide={{ duration: 300 }}
				class="p-5 rounded-2xl bg-(--surface) border border-(--border) flex flex-col gap-4 shadow-xl"
			>
				<h3 class="font-extrabold text-sm uppercase tracking-wider text-muted">Quick Log Fuel</h3>
				
				<div class="flex flex-col gap-3">
					<div class="flex flex-col gap-1">
						<label for="quick-name" class="text-[10px] font-bold uppercase tracking-wider text-muted/80">Meal Name</label>
						<input 
							type="text" 
							id="quick-name" 
							placeholder="e.g. Protein shake" 
							bind:value={quickLog.name}
							class="w-full px-4 py-2.5 rounded-xl bg-(--surface) border border-(--border) font-medium text-sm focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
						/>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div class="flex flex-col gap-1">
							<label for="quick-cal" class="text-[10px] font-bold uppercase tracking-wider text-muted/80">Calories (kcal)</label>
							<input 
								type="number" 
								id="quick-cal" 
								placeholder="0" 
								bind:value={quickLog.calories}
								class="w-full px-4 py-2.5 rounded-xl bg-(--surface) border border-(--border) font-bold text-sm focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors tabular-nums"
							/>
						</div>

						<div class="flex flex-col gap-1">
							<label for="quick-prot" class="text-[10px] font-bold uppercase tracking-wider text-muted/80">Protein (g)</label>
							<input 
								type="number" 
								id="quick-prot" 
								placeholder="0" 
								bind:value={quickLog.protein}
								class="w-full px-4 py-2.5 rounded-xl bg-(--surface) border border-(--border) font-bold text-sm focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors tabular-nums"
							/>
						</div>

						<div class="flex flex-col gap-1">
							<label for="quick-carb" class="text-[10px] font-bold uppercase tracking-wider text-muted/80">Carbs (g)</label>
							<input 
								type="number" 
								id="quick-carb" 
								placeholder="0" 
								bind:value={quickLog.carbs}
								class="w-full px-4 py-2.5 rounded-xl bg-(--surface) border border-(--border) font-bold text-sm focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors tabular-nums"
							/>
						</div>

						<div class="flex flex-col gap-1">
							<label for="quick-fat" class="text-[10px] font-bold uppercase tracking-wider text-muted/80">Fats (g)</label>
							<input 
								type="number" 
								id="quick-fat" 
								placeholder="0" 
								bind:value={quickLog.fats}
								class="w-full px-4 py-2.5 rounded-xl bg-(--surface) border border-(--border) font-bold text-sm focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors tabular-nums"
							/>
						</div>
					</div>

					<button 
						type="button"
						onclick={saveQuickLog}
						disabled={isSaving}
						class="w-full mt-2 py-3 rounded-xl bg-(--fg) text-(--bg) font-bold text-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
					>
						{#if isSaving}
							Saving...
						{:else}
							Confirm Log
						{/if}
					</button>
				</div>
			</div>
		{/if}
	</section>

	<!-- Quick Templates Section (Recent Foods) -->
	{#if recentFoods.length > 0}
		<section class="flex flex-col gap-3">
			<h2 class="text-[10px] font-black uppercase tracking-wider text-muted">Quick Templates (Tap to Log)</h2>
			<div class="flex gap-3 overflow-x-auto pb-2 scrollbar-none mask-fade">
				{#each recentFoods as food (food.name)}
					<button
						type="button"
						onclick={() => logRecentFood(food)}
						class="flex-shrink-0 px-4 py-3 rounded-2xl bg-(--surface) border border-(--border) hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-95 transition-all text-left flex flex-col gap-1 cursor-pointer max-w-[150px]"
					>
						<span class="font-bold text-xs truncate w-full">{food.name}</span>
						<div class="flex items-center gap-1.5 text-[9px] font-black text-muted uppercase">
							<span class="style-color-calories">{food.calories} kcal</span>
							<span>•</span>
							<span class="text-rose-500">{Math.round(food.proteins)}g P</span>
						</div>
					</button>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Logged Today Section -->
	<section class="flex flex-col gap-4 mt-2 animate-in fade-in duration-300">
		<div class="flex items-center justify-between">
			<h2 class="text-[10px] font-black uppercase tracking-wider text-muted">Tracked for this Date ({logsToday.length})</h2>
			{#if logsToday.length > 0}
				<span class="text-xs font-black style-color-calories uppercase tracking-tight">{consumed.calories} kcal consumed</span>
			{/if}
		</div>

		{#if logsToday.length === 0}
			<div class="rounded-3xl border-2 border-dashed border-(--border) p-8 text-center text-zinc-400 dark:text-zinc-600 bg-(--surface)/40">
				<p class="font-bold text-sm">No food tracked for this date</p>
				<p class="text-xs text-zinc-500 mt-1">Tap Log Meal or Quick Add to start tracking!</p>
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
								class="h-8 w-8 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-(--border) text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
								title="Delete log"
								aria-label="Delete log entry"
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-4">
									<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.34 6.14m-1.66-6.14-.34 6.14M12 18.75m-9-13.5h18M5.25 5.25l.844 14.166a2.25 2.25 0 0 0 2.247 2.114h6.318a2.25 2.25 0 0 0 2.247-2.114L18.75 5.25M9 5.25V4.5a3.75 3.75 0 1 1 7.5 0v.75m-8.25 0h9" />
								</svg>
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
	.mask-fade {
		mask-image: linear-gradient(to right, black 85%, transparent 100%);
		-webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
	}
</style>
