<script lang="ts">
	import { store } from '$lib/store.svelte';
	import { goto } from '$app/navigation';
	import { logDraft, resetLogDraft } from '$lib/logDraft.svelte';
	import { onMount } from 'svelte';

	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	onMount(() => {
		if (!logDraft.selectedFood || !logDraft.mealType) {
			goto('/log');
		}
	});

	// Derived scale factor based on food's reference quantity and user's consumed quantity
	const scale = $derived.by(() => {
		const selectedFood = logDraft.selectedFood;
		if (selectedFood && selectedFood.quantity && selectedFood.quantity > 0) {
			return logDraft.quantity / selectedFood.quantity;
		}
		return 1;
	});

	// Derived adjusted macros based on quantity scale
	const adjCalories = $derived.by(() => logDraft.selectedFood?.calories !== undefined ? Math.round(logDraft.selectedFood.calories * scale) : 0);
	const adjProtein = $derived.by(() => logDraft.selectedFood?.proteins !== undefined ? Number((logDraft.selectedFood.proteins * scale).toFixed(1)) : 0);
	const adjCarbs = $derived.by(() => logDraft.selectedFood?.carbs !== undefined ? Number((logDraft.selectedFood.carbs * scale).toFixed(1)) : 0);
	const adjFats = $derived.by(() => logDraft.selectedFood?.fats !== undefined ? Number((logDraft.selectedFood.fats * scale).toFixed(1)) : 0);
	const adjFiber = $derived.by(() => logDraft.selectedFood?.fiber !== undefined ? Number((logDraft.selectedFood.fiber * scale).toFixed(1)) : 0);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!logDraft.selectedFood) return;

		loading = true;
		error = '';
		success = false;

		try {
			store.addFoodLog({
				name: logDraft.selectedFood.name,
				calories: adjCalories,
				proteins: adjProtein,
				carbs: adjCarbs,
				fats: adjFats,
				fiber: adjFiber,
				consumed_at: new Date().toISOString(),
				mealType: logDraft.mealType || undefined
			});
			success = true;
		} catch (err: unknown) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to log food';
			}
		} finally {
			loading = false;
		}
	}

	function handleAddAnother() {
		// Keep the same meal category, but reset the selected food
		logDraft.selectedFood = null;
		logDraft.quantity = 100;
		success = false;
		goto('/log/food');
	}

	function handleFinish() {
		resetLogDraft();
		success = false;
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Adjust Quantity | Calzap</title>
	<meta name="description" content="Adjust your meal portion size to log accurate macronutrients." />
</svelte:head>

<div class="mx-auto max-w-lg pb-12 pt-4 px-4 sm:px-6 md:pt-8 flex flex-col gap-8 animate-in fade-in duration-300">
	{#if error}
		<div class="rounded-xl bg-red-50 p-4 ring-1 ring-inset ring-red-200 dark:bg-red-950/30 dark:ring-red-900/50" role="alert">
			<p class="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
		</div>
	{/if}

	{#if success}
		<div class="flex flex-col items-center justify-center gap-6 rounded-2xl bg-zinc-900 py-12 px-6 text-center shadow-2xl dark:bg-zinc-100 animate-in zoom-in-95 duration-300" role="status">
			<div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-600">
				<span class="material-symbols-outlined text-[32px] select-none leading-none font-bold">check</span>
			</div>
			<div>
				<h3 class="text-3xl font-extrabold tracking-tight text-white dark:text-zinc-900">Meal Logged!</h3>
				<p class="mt-2 text-sm text-zinc-400 dark:text-zinc-600">
					Successfully added to your {logDraft.mealType || 'diary'}.
				</p>
			</div>
			<div class="flex flex-col sm:flex-row gap-3 w-full max-w-xs pt-4">
				<button 
					type="button" 
					onclick={handleAddAnother}
					class="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20 dark:bg-black/5 dark:text-zinc-900 dark:hover:bg-black/10 transition-colors active:scale-95 cursor-pointer"
				>
					Add Another
				</button>
				<button 
					type="button" 
					onclick={handleFinish}
					class="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-colors active:scale-95 cursor-pointer"
				>
					Done
				</button>
			</div>
		</div>
	{:else if logDraft.selectedFood}
		<!-- Navigation Header -->
		<header class="flex items-center justify-between border-b border-(--border) pb-6">
			<div class="flex items-center gap-4">
				<button
					type="button"
					id="btn-back-food"
					onclick={() => goto('/log/food')}
					class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-95 cursor-pointer"
					aria-label="Back to food catalog selection"
				>
					<span class="material-symbols-outlined text-[20px] select-none leading-none">arrow_back</span>
				</button>
				<div class="flex flex-col">
					<h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Set Quantity</h1>
					<p class="text-sm text-zinc-500 dark:text-zinc-400">
						Step 3 of 3 • {logDraft.mealType || 'Meal'}
					</p>
				</div>
			</div>
		</header>

		<!-- Selected Food info and Quantity input -->
		<form onsubmit={handleSubmit} class="flex flex-col gap-6">
			<div class="rounded-3xl bg-(--surface) border border-(--border) p-6 flex flex-col gap-6 shadow-xs">
				<div>
					<span class="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1 block">Active Selection</span>
					<h2 class="text-2xl font-black tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">{logDraft.selectedFood.name}</h2>
					<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
						Reference size: {logDraft.selectedFood.quantity} {logDraft.selectedFood.units} 
						({logDraft.selectedFood.calories} kcal)
					</p>
				</div>

				<!-- Portions/Quantity Adjuster -->
				<div class="flex flex-col gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-(--border)">
					<label for="input-consumed-qty" class="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">How much did you eat?</label>
					<div class="flex items-baseline gap-2">
						<input
							type="number"
							id="input-consumed-qty"
							bind:value={logDraft.quantity}
							min="0.1"
							step="any"
							required
							class="w-full bg-transparent text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 focus:outline-none tabular-nums"
						/>
						<span class="text-xl font-black text-zinc-400 uppercase tracking-wide">{logDraft.selectedFood.units}</span>
					</div>
				</div>

				<!-- Live Scaled Macros display -->
				<div class="grid grid-cols-5 gap-1.5 pt-2">
					<div class="rounded-xl border border-(--border) p-2.5 text-center flex flex-col bg-zinc-50/50 dark:bg-zinc-950/30">
						<span class="text-[9px] font-black uppercase tracking-wider text-calories mb-0.5">Calories</span>
						<span class="text-base font-black tabular-nums text-calories">{adjCalories}</span>
						<span class="text-[8px] font-bold text-zinc-400">kcal</span>
					</div>
					<div class="rounded-xl border border-(--border) p-2.5 text-center flex flex-col bg-zinc-50/50 dark:bg-zinc-950/30">
						<span class="text-[9px] font-black uppercase tracking-wider text-protein mb-0.5">Protein</span>
						<span class="text-base font-black tabular-nums text-protein">{adjProtein}g</span>
					</div>
					<div class="rounded-xl border border-(--border) p-2.5 text-center flex flex-col bg-zinc-50/50 dark:bg-zinc-950/30">
						<span class="text-[9px] font-black uppercase tracking-wider text-carbs mb-0.5">Carbs</span>
						<span class="text-base font-black tabular-nums text-carbs">{adjCarbs}g</span>
					</div>
					<div class="rounded-xl border border-(--border) p-2.5 text-center flex flex-col bg-zinc-50/50 dark:bg-zinc-950/30">
						<span class="text-[9px] font-black uppercase tracking-wider text-fats mb-0.5">Fats</span>
						<span class="text-base font-black tabular-nums text-fats">{adjFats}g</span>
					</div>
					<div class="rounded-xl border border-(--border) p-2.5 text-center flex flex-col bg-zinc-50/50 dark:bg-zinc-950/30">
						<span class="text-[9px] font-black uppercase tracking-wider text-fiber mb-0.5">Fiber</span>
						<span class="text-base font-black tabular-nums text-fiber">{adjFiber}g</span>
					</div>
				</div>

				<!-- Confirm button -->
				<button
					type="submit"
					id="btn-confirm-log"
					disabled={loading || logDraft.quantity <= 0}
					class="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold text-base hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
				>
					{#if loading}
						<span class="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full block"></span>
						<span>Logging...</span>
					{:else}
						<span>Confirm Log to {logDraft.mealType || 'Meal'}</span>
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>
