<script lang="ts">
	import { auth } from '$lib/user.svelte';
	import { pb } from '$lib/pb';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { FoodsResponse, FoodLogsResponse } from '../../../pocketbase-types';

	// Page modes: search foods or quick add custom meal
	let mode = $state<'search' | 'custom'>('search');
	
	// Search state
	let searchQuery = $state('');
	let foodsList = $state<FoodsResponse[]>([]);
	let selectedFood = $state<FoodsResponse | null>(null);
	let consumedQty = $state<number>(100);
	
	// Status states
	let isLogging = $state(false);
	let isSearching = $state(false);
	let error = $state('');
	let successMsg = $state('');

	// Custom meal input states
	let customName = $state('');
	let customCalories = $state<number | undefined>(undefined);
	let customProtein = $state<number | undefined>(undefined);
	let customCarbs = $state<number | undefined>(undefined);
	let customFats = $state<number | undefined>(undefined);
	let customFiber = $state<number | undefined>(undefined);

	// Today's log history state
	let logsToday = $state<FoodLogsResponse[]>([]);

	// Targets for progress visualizers
	let dailyTargets = $state({
		calories: 2500,
		protein: 180,
		carbs: 250,
		fats: 70,
		fiber: 35
	});

	// Derived scale factor based on food's reference quantity and user's consumed quantity
	const scale = $derived.by(() => {
		if (selectedFood) {
			if (selectedFood.quantity && selectedFood.quantity > 0) {
				return consumedQty / selectedFood.quantity;
			}
		}
		return 1;
	});

	// Derived adjusted macros based on quantity scale
	const adjCalories = $derived.by(() => {
		if (selectedFood) {
			if (selectedFood.calories !== undefined) {
				return Math.round(selectedFood.calories * scale);
			}
		}
		return 0;
	});

	const adjProtein = $derived.by(() => {
		if (selectedFood) {
			if (selectedFood.proteins !== undefined) {
				return Number((selectedFood.proteins * scale).toFixed(1));
			}
		}
		return 0;
	});

	const adjCarbs = $derived.by(() => {
		if (selectedFood) {
			if (selectedFood.carbs !== undefined) {
				return Number((selectedFood.carbs * scale).toFixed(1));
			}
		}
		return 0;
	});

	const adjFats = $derived.by(() => {
		if (selectedFood) {
			if (selectedFood.fats !== undefined) {
				return Number((selectedFood.fats * scale).toFixed(1));
			}
		}
		return 0;
	});

	const adjFiber = $derived.by(() => {
		if (selectedFood) {
			if (selectedFood.fiber !== undefined) {
				return Number((selectedFood.fiber * scale).toFixed(1));
			}
		}
		return 0;
	});

	// Derived cumulative totals of logged macros for today
	const todayTotals = $derived.by(() => {
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

	// Load custom foods matching search pattern (secured to current user)
	async function fetchFoods() {
		if (!auth.user?.id) {
			return;
		}
		isSearching = true;
		try {
			let filterStr = '';
			if (searchQuery.trim() !== '') {
				filterStr = pb.filter('created_by = {:userId} && name ~ {:query}', {
					userId: auth.user.id,
					query: searchQuery.trim()
				});
			} else {
				filterStr = pb.filter('created_by = {:userId}', {
					userId: auth.user.id
				});
			}
			const result = await pb.collection('foods').getList<FoodsResponse>(1, 30, {
				filter: filterStr,
				sort: '-created',
				requestKey: null
			});
			foodsList = result.items;
		} catch (err: unknown) {
			console.error('Error fetching foods:', err);
		} finally {
			isSearching = false;
		}
	}

	// Fetch target stats for the user to compare against logged values
	async function fetchTargets() {
		if (auth.user?.id) {
			try {
				const record = await pb.collection('user_stats').getOne(auth.user.id, { requestKey: null });
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
				// Fallback to default targets
			}
		}
	}

	// Load logs created today (secured to current user)
	async function fetchLogsToday() {
		if (!auth.user?.id) {
			return;
		}
		try {
			const startOfDay = new Date();
			startOfDay.setHours(0, 0, 0, 0);
			
			const filterStr = pb.filter('user = {:userId} && consumed_at >= {:startOfDay}', {
				userId: auth.user.id,
				startOfDay: startOfDay
			});
			
			const result = await pb.collection('food_logs').getList<FoodLogsResponse>(1, 50, {
				filter: filterStr,
				sort: '-consumed_at',
				requestKey: null
			});
			
			logsToday = result.items;
		} catch (err: unknown) {
			console.error('Error fetching today\'s logs:', err);
		}
	}

	// Form input handler to trigger search
	function handleSearchInput() {
		fetchFoods();
	}

	// Selection handler
	function selectFoodItem(food: FoodsResponse) {
		selectedFood = food;
		if (food.quantity !== undefined && food.quantity !== null) {
			consumedQty = food.quantity;
		} else {
			consumedQty = 100;
		}
		error = '';
		successMsg = '';
	}

	// Log food selected from catalog
	async function logSelectedFood() {
		if (!auth.user?.id) {
			error = 'You must be logged in.';
			return;
		}
		if (!selectedFood) {
			error = 'No food selected.';
			return;
		}
		isLogging = true;
		error = '';
		successMsg = '';
		try {
			await pb.collection('food_logs').create({
				user: auth.user.id,
				food: selectedFood.id,
				name: selectedFood.name,
				calories: adjCalories,
				proteins: adjProtein,
				carbs: adjCarbs,
				fats: adjFats,
				fiber: adjFiber,
				consumed_at: new Date()
			});
			
			successMsg = `Successfully logged ${selectedFood.name}!`;
			selectedFood = null;
			consumedQty = 100;
			await fetchLogsToday();
		} catch (err: unknown) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to log food';
			}
		} finally {
			isLogging = false;
		}
	}

	// Log a quick meal with custom name & macros
	async function logCustomMeal(e: Event) {
		e.preventDefault();
		if (!auth.user?.id) {
			error = 'You must be logged in to log a meal.';
			return;
		}
		if (customName.trim() === '') {
			error = 'Please enter a name for the meal.';
			return;
		}
		isLogging = true;
		error = '';
		successMsg = '';
		try {
			await pb.collection('food_logs').create({
				user: auth.user.id,
				name: customName,
				calories: customCalories ?? 0,
				proteins: customProtein ?? 0,
				carbs: customCarbs ?? 0,
				fats: customFats ?? 0,
				fiber: customFiber ?? 0,
				consumed_at: new Date()
			});
			
			successMsg = `Logged custom meal: ${customName}`;
			customName = '';
			customCalories = undefined;
			customProtein = undefined;
			customCarbs = undefined;
			customFats = undefined;
			customFiber = undefined;
			
			await fetchLogsToday();
		} catch (err: unknown) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to log custom meal';
			}
		} finally {
			isLogging = false;
		}
	}

	// Delete log entry
	async function deleteLog(id: string) {
		error = '';
		successMsg = '';
		try {
			const record = await pb.collection('food_logs').getOne(id, { requestKey: null });
			if (record.user !== auth.user?.id) {
				error = 'Unauthorized operation';
				return;
			}
			await pb.collection('food_logs').delete(id);
			successMsg = 'Log entry deleted.';
			await fetchLogsToday();
		} catch (err: unknown) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to delete log entry';
			}
		}
	}

	// Quickly re-log a meal that has already been logged today
	async function repeatLog(log: FoodLogsResponse) {
		if (!auth.user?.id) {
			error = 'You must be logged in.';
			return;
		}
		error = '';
		successMsg = '';
		try {
			await pb.collection('food_logs').create({
				user: auth.user.id,
				food: log.food || undefined,
				name: log.name,
				calories: log.calories,
				proteins: log.proteins,
				carbs: log.carbs,
				fats: log.fats,
				fiber: log.fiber,
				consumed_at: new Date()
			});
			successMsg = `Logged "${log.name}" again!`;
			await fetchLogsToday();
		} catch (err: unknown) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to repeat log';
			}
		}
	}

	// Delete defined food from catalog
	async function deleteDefinedFood(id: string) {
		if (!confirm('Are you sure you want to delete this food definition? This will not affect your past log history.')) {
			return;
		}
		error = '';
		successMsg = '';
		try {
			const record = await pb.collection('foods').getOne(id, { requestKey: null });
			if (record.created_by !== auth.user?.id) {
				error = 'Unauthorized operation';
				return;
			}
			await pb.collection('foods').delete(id);
			successMsg = 'Food definition deleted.';
			
			if (selectedFood?.id === id) {
				selectedFood = null;
			}
			await fetchFoods();
		} catch (err: unknown) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to delete food definition';
			}
		}
	}

	// Initialize
	onMount(() => {
		if (!auth.isValid) {
			goto('/login');
		} else {
			fetchFoods();
			fetchTargets();
			fetchLogsToday();
		}
	});
</script>

<svelte:head>
	<title>Log Meal | Fuel</title>
	<meta name="description" content="Log your meals quickly by choosing from your catalog or keying in custom macronutrients." />
</svelte:head>

<main class="max-w-md mx-auto px-6 py-8 flex flex-col gap-8 animate-in fade-in duration-300">
	<!-- Navigation Header -->
	<header class="flex items-center justify-between border-b border-(--border) pb-6">
		<div class="flex items-center gap-4">
			<button
				type="button"
				id="btn-back-dashboard"
				onclick={() => goto('/dashboard')}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface) text-(--fg) border border-(--border) hover:bg-(--border) transition-colors active:scale-95 cursor-pointer"
				aria-label="Back to dashboard"
			>
				<span class="material-symbols-outlined text-[20px] select-none leading-none">arrow_back</span>
			</button>
			<div>
				<h1 class="text-2xl font-black tracking-tight">Log Fuel</h1>
				<p class="text-xs text-zinc-500 dark:text-zinc-400">Track macro intake in seconds</p>
			</div>
		</div>

		<!-- Optional link to add custom food definitions -->
		<a
			href="/add"
			id="link-create-food"
			class="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-xs uppercase tracking-wider transition-all text-center"
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

	<!-- Logging Interface Stack -->
	<div class="flex flex-col gap-6">
		
		<!-- Mode Switcher Pill Container -->
		<div class="flex rounded-2xl bg-(--surface) p-1 border border-(--border)">
			<button
				type="button"
				id="tab-search-mode"
				onclick={() => { mode = 'search'; error = ''; successMsg = ''; }}
				class="flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer"
				class:active-mode={mode === 'search'}
			>
				Catalog Search
			</button>
			<button
				type="button"
				id="tab-custom-mode"
				onclick={() => { mode = 'custom'; error = ''; successMsg = ''; }}
				class="flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer"
				class:active-mode={mode === 'custom'}
			>
				Quick Add
			</button>
		</div>

		<!-- SEARCH & LOG VIEW -->
		{#if mode === 'search'}
			<div class="flex flex-col gap-5 animate-in fade-in duration-200">
				<!-- Search Input -->
				<div class="relative">
					<input
						type="search"
						id="search-foods-input"
						bind:value={searchQuery}
						oninput={handleSearchInput}
						placeholder="Search foods..."
						class="w-full rounded-2xl bg-(--surface) border border-(--border) px-5 py-4 pl-12 font-bold text-base focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600 transition-all placeholder:text-zinc-400"
					/>
					<div class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
						<span class="material-symbols-outlined text-[20px] select-none leading-none">search</span>
					</div>
				</div>

				<!-- Selection Details Box (if item selected) -->
				{#if selectedFood}
					<div id="selection-details-card" class="rounded-3xl bg-(--surface) border border-(--border) p-6 flex flex-col gap-6 shadow-xl shadow-black/5 relative overflow-hidden">
						<button
							type="button"
							id="btn-close-selection"
							onclick={() => { selectedFood = null; }}
							class="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 hover:opacity-85 text-zinc-500 cursor-pointer"
							aria-label="Cancel selection"
						>
							✕
						</button>

						<div>
							<span class="text-[9px] font-black uppercase tracking-widest text-calories mb-1 block">Active Selection</span>
							<h2 class="text-xl font-black tracking-tight leading-tight">{selectedFood.name}</h2>
							<p class="text-xs text-zinc-400 mt-0.5">
								Reference: {selectedFood.quantity} {selectedFood.units} 
								({selectedFood.calories} kcal)
							</p>
						</div>

						<!-- Quantity Adjuster -->
						<div class="flex flex-col gap-2 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-(--border)">
							<label for="input-consumed-qty" class="text-[9px] font-black uppercase tracking-wider text-zinc-400">Quantity Consumed</label>
							<div class="flex items-baseline gap-2">
								<input
									type="number"
									id="input-consumed-qty"
									bind:value={consumedQty}
									min="0.1"
									step="any"
									class="w-full bg-transparent text-3xl font-black tracking-tight focus:outline-hidden tabular-nums"
								/>
								<span class="text-lg font-black text-zinc-400 uppercase tracking-wide">{selectedFood.units}</span>
							</div>
						</div>

						<!-- Adjusted Macros Display -->
						<div class="grid grid-cols-4 gap-2">
							<div class="rounded-xl border border-(--border) p-2 text-center flex flex-col bg-zinc-50/50 dark:bg-zinc-950/30">
								<span class="text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-0.5">Calories</span>
								<span class="text-sm font-black tabular-nums style-color-calories">{adjCalories}</span>
								<span class="text-[8px] font-bold text-zinc-400">kcal</span>
							</div>
							<div class="rounded-xl border border-(--border) p-2 text-center flex flex-col bg-zinc-50/50 dark:bg-zinc-950/30">
								<span class="text-[9px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-0.5">Protein</span>
								<span class="text-sm font-black tabular-nums text-rose-600 dark:text-rose-400">{adjProtein}g</span>
							</div>
							<div class="rounded-xl border border-(--border) p-2 text-center flex flex-col bg-zinc-50/50 dark:bg-zinc-950/30">
								<span class="text-[9px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 mb-0.5">Carbs</span>
								<span class="text-sm font-black tabular-nums text-amber-600 dark:text-amber-400">{adjCarbs}g</span>
							</div>
							<div class="rounded-xl border border-(--border) p-2 text-center flex flex-col bg-zinc-50/50 dark:bg-zinc-950/30">
								<span class="text-[9px] font-black uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-0.5">Fats</span>
								<span class="text-sm font-black tabular-nums text-blue-600 dark:text-blue-400">{adjFats}g</span>
							</div>
						</div>

						<!-- Action button -->
						<button
							type="button"
							id="btn-confirm-log"
							onclick={logSelectedFood}
							disabled={isLogging || consumedQty <= 0}
							class="w-full py-4 rounded-2xl bg-(--fg) text-(--bg) font-bold text-base hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
						>
							{#if isLogging}
								<span class="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full block"></span>
								<span>Logging...</span>
							{:else}
								<span>Confirm Log</span>
							{/if}
						</button>
					</div>
				{/if}

				<!-- Search Results List -->
				<div class="flex flex-col gap-3">
					<h3 class="text-[9px] font-black uppercase tracking-wider text-zinc-400">Catalog Food Items</h3>
					
					{#if isSearching}
						<div class="py-12 text-center text-zinc-500">
							<span class="animate-spin h-6 w-6 border-2 border-zinc-500 border-t-transparent rounded-full inline-block mb-2"></span>
							<p class="font-bold text-sm">Searching Catalog...</p>
						</div>
					{:else}
						{#if foodsList.length === 0}
							<div class="rounded-3xl border-2 border-dashed border-(--border) p-12 text-center flex flex-col items-center gap-4">
								<p class="text-zinc-500 font-bold text-base">No catalog foods found</p>
								<p class="text-zinc-400 text-xs max-w-xs">Define custom food items with exact macronutrient counts first to easily log them.</p>
								<a
									href="/add"
									class="px-6 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all"
								>
									Define a Food
								</a>
							</div>
						{:else}
							<div class="grid gap-3 max-h-[350px] overflow-y-auto pr-1">
								{#each foodsList as item (item.id)}
									<div class="flex items-stretch gap-2 group w-full">
										<button
											type="button"
											id="food-item-{item.id}"
											onclick={() => selectFoodItem(item)}
											class="flex-1 text-left p-4 rounded-2xl bg-(--surface) border border-(--border) hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex items-center justify-between gap-4 active:scale-[0.99] cursor-pointer"
										>
											<div>
												<h4 class="font-bold text-base tracking-tight">{item.name}</h4>
												<p class="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mt-0.5">
													{item.quantity} {item.units} • <span class="tabular-nums style-color-calories">{item.calories} kcal</span>
												</p>
											</div>
											<span class="text-[10px] font-black uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-(--border)">Select</span>
										</button>
										
										<!-- Delete Defined Food Button -->
										<button
											type="button"
											id="delete-food-{item.id}"
											onclick={() => deleteDefinedFood(item.id)}
											class="px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-900/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
											title="Delete food definition"
										>
											<span class="material-symbols-outlined text-[16px] select-none leading-none">delete</span>
										</button>
									</div>
								{/each}
							</div>
						{/if}
					{/if}
				</div>
			</div>
		{/if}

		<!-- QUICK ADD VIEW -->
		{#if mode === 'custom'}
			<form onsubmit={logCustomMeal} class="flex flex-col gap-5 animate-in fade-in duration-200">
				<div class="rounded-3xl bg-(--surface) border border-(--border) p-6 flex flex-col gap-6 shadow-xl shadow-black/5">
					
					<!-- Name -->
					<div class="flex flex-col gap-1.5">
						<label for="input-custom-name" class="text-[9px] font-black uppercase tracking-wider text-zinc-500">Meal Name</label>
						<input
							type="text"
							id="input-custom-name"
							bind:value={customName}
							required
							placeholder="e.g. Eggs and toast"
							class="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-(--border) px-4 py-3 font-semibold text-sm focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
						/>
					</div>

					<!-- Calories and Macros Inputs Grid -->
					<div class="grid grid-cols-2 gap-4">
						
						<!-- Calories -->
						<div class="flex flex-col gap-1.5 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/30 p-4 border border-(--border)">
							<label for="input-custom-calories" class="text-[9px] font-black uppercase tracking-wider text-zinc-400">Calories (kcal)</label>
							<input
								type="number"
								id="input-custom-calories"
								bind:value={customCalories}
								min="0"
								placeholder="0"
								class="bg-transparent text-2xl font-black tracking-tight focus:outline-hidden tabular-nums style-color-calories"
							/>
						</div>

						<!-- Protein -->
						<div class="flex flex-col gap-1.5 rounded-2xl bg-rose-50/30 dark:bg-rose-950/10 p-4 border border-rose-100 dark:border-rose-950">
							<label for="input-custom-protein" class="text-[9px] font-black uppercase tracking-wider text-rose-500">Protein (g)</label>
							<input
								type="number"
								id="input-custom-protein"
								bind:value={customProtein}
								min="0"
								step="0.1"
								placeholder="0.0"
								class="bg-transparent text-2xl font-black tracking-tight focus:outline-hidden tabular-nums text-rose-600 dark:text-rose-400"
							/>
						</div>

						<!-- Carbs -->
						<div class="flex flex-col gap-1.5 rounded-2xl bg-amber-50/30 dark:bg-amber-950/10 p-4 border border-amber-100 dark:border-amber-950">
							<label for="input-custom-carbs" class="text-[9px] font-black uppercase tracking-wider text-amber-500">Carbs (g)</label>
							<input
								type="number"
								id="input-custom-carbs"
								bind:value={customCarbs}
								min="0"
								step="0.1"
								placeholder="0.0"
								class="bg-transparent text-2xl font-black tracking-tight focus:outline-hidden tabular-nums text-amber-600 dark:text-amber-400"
							/>
						</div>

						<!-- Fats -->
						<div class="flex flex-col gap-1.5 rounded-2xl bg-blue-50/30 dark:bg-blue-950/10 p-4 border border-blue-100 dark:border-blue-950">
							<label for="input-custom-fats" class="text-[9px] font-black uppercase tracking-wider text-blue-500">Fats (g)</label>
							<input
								type="number"
								id="input-custom-fats"
								bind:value={customFats}
								min="0"
								step="0.1"
								placeholder="0.0"
								class="bg-transparent text-2xl font-black tracking-tight focus:outline-hidden tabular-nums text-blue-600 dark:text-blue-400"
							/>
						</div>
					</div>

					<button
						type="submit"
						id="btn-submit-custom-meal"
						disabled={isLogging || !customName.trim()}
						class="w-full py-4 rounded-2xl bg-(--fg) text-(--bg) font-bold text-base hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
					>
						{#if isLogging}
							<span class="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full block"></span>
							<span>Logging...</span>
						{:else}
							<span>Confirm Log</span>
						{/if}
					</button>
				</div>
			</form>
		{/if}
	</div>

	<!-- Today's Totals Summary Widget -->
	<section class="rounded-3xl bg-(--surface) border border-(--border) p-6 shadow-xl shadow-black/5 flex flex-col gap-5">
		<div>
			<h3 class="text-[9px] font-black uppercase tracking-widest text-zinc-400">Total Fuel Logged Today</h3>
			<div class="flex items-baseline gap-1.5 mt-1">
				<span class="text-4xl font-black tracking-tight tabular-nums style-color-calories">
					{todayTotals.calories}
				</span>
				<span class="text-xs font-bold text-zinc-400">/ {dailyTargets.calories} kcal</span>
			</div>
		</div>

		<!-- Macro Progress Bars -->
		<div class="flex flex-col gap-4">
			<!-- Protein -->
			<div class="flex flex-col gap-1.5">
				<div class="flex justify-between text-xs font-bold">
					<span class="text-rose-500">Protein</span>
					<span class="tabular-nums text-zinc-400">{todayTotals.protein}g / {dailyTargets.protein}g</span>
				</div>
				<div class="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
					<div 
						class="h-full rounded-full transition-all duration-500" 
						style="background-color: var(--color-protein); width: {Math.min(100, (todayTotals.protein / dailyTargets.protein) * 100)}%"
					></div>
				</div>
			</div>

			<!-- Carbs -->
			<div class="flex flex-col gap-1.5">
				<div class="flex justify-between text-xs font-bold">
					<span class="text-amber-500">Carbs</span>
					<span class="tabular-nums text-zinc-400">{todayTotals.carbs}g / {dailyTargets.carbs}g</span>
				</div>
				<div class="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
					<div 
						class="h-full rounded-full transition-all duration-500" 
						style="background-color: var(--color-carbs); width: {Math.min(100, (todayTotals.carbs / dailyTargets.carbs) * 100)}%"
					></div>
				</div>
			</div>

			<!-- Fats -->
			<div class="flex flex-col gap-1.5">
				<div class="flex justify-between text-xs font-bold">
					<span class="text-blue-500">Fats</span>
					<span class="tabular-nums text-zinc-400">{todayTotals.fats}g / {dailyTargets.fats}g</span>
				</div>
				<div class="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
					<div 
						class="h-full rounded-full transition-all duration-500" 
						style="background-color: var(--color-fats); width: {Math.min(100, (todayTotals.fats / dailyTargets.fats) * 100)}%"
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
				<p class="text-xs text-zinc-500 mt-1">Select a food from catalog or quick add above.</p>
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
								<h4 class="font-bold text-base tracking-tight leading-tight">{entry.name}</h4>
								<p class="text-[9px] text-zinc-400 uppercase tracking-wider font-bold mt-0.5">
									{#if entry.consumed_at}
										{new Date(entry.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
									{/if}
								</p>
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
							<span class="tabular-nums style-color-calories">{entry.calories} kcal</span>
							<span>•</span>
							<span class="text-rose-500 tabular-nums">{entry.proteins}g P</span>
							<span>•</span>
							<span class="text-amber-500 tabular-nums">{entry.carbs}g C</span>
							<span>•</span>
							<span class="text-blue-500 tabular-nums">{entry.fats}g F</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</main>

<style>
	.style-color-calories {
		color: var(--color-calories);
	}
	.active-mode {
		background-color: var(--color-fg);
		color: var(--color-bg);
	}
</style>
