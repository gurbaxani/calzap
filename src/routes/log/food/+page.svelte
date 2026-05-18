<script lang="ts">
	import { store } from '$lib/store.svelte';
	import { goto } from '$app/navigation';
	import { logDraft } from '$lib/logDraft.svelte';
	import type { Food } from '$lib/store.svelte';

	let searchQuery = $state('');

	// Derived filtered foods based on search query
	const foodsList = $derived.by(() => {
		if (searchQuery.trim() !== '') {
			return store.foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
		}
		return store.foods;
	});

	function selectFoodItem(food: Food) {
		logDraft.selectedFood = food;
		if (food.quantity !== undefined && food.quantity !== null && food.quantity > 0) {
			logDraft.quantity = food.quantity;
		} else {
			logDraft.quantity = 100;
		}
		goto('/log/quantity');
	}

	function deleteDefinedFood(id: string) {
		if (!confirm('Are you sure you want to delete this food definition? This will not affect your past log history.')) {
			return;
		}
		try {
			store.deleteFood(id);
		} catch (err: unknown) {
			console.error('Failed to delete food definition:', err);
		}
	}
</script>

<svelte:head>
	<title>Select Food | Calzap</title>
	<meta name="description" content="Select a food from your catalog to log." />
</svelte:head>

<div class="mx-auto max-w-lg pb-12 pt-4 px-4 sm:px-6 md:pt-8 flex flex-col gap-8 animate-in fade-in duration-300">
	<!-- Navigation Header -->
	<header class="flex items-center justify-between border-b border-(--border) pb-6">
		<div class="flex items-center gap-4">
			<button
				type="button"
				id="btn-back-log"
				onclick={() => goto('/log')}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-95 cursor-pointer"
				aria-label="Back to meal type selection"
			>
				<span class="material-symbols-outlined text-[20px] select-none leading-none">arrow_back</span>
			</button>
			<div class="flex flex-col">
				<h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Select Food</h1>
				<p class="text-sm text-zinc-500 dark:text-zinc-400">
					Step 2 of 3 • {logDraft.mealType || 'Meal'}
				</p>
			</div>
		</div>

		<a
			href="/foods"
			id="link-create-food"
			class="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-xs uppercase tracking-wider transition-all text-center text-zinc-900 dark:text-zinc-50"
		>
			Define New
		</a>
	</header>

	<div class="flex flex-col gap-6">
		<!-- Search Input -->
		<div class="relative">
			<input
				type="search"
				id="search-foods-input"
				bind:value={searchQuery}
				placeholder="Search your foods catalog..."
				class="w-full rounded-2xl bg-(--surface) border border-(--border) px-5 py-4 pl-12 font-bold text-base focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-50"
			/>
			<div class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
				<span class="material-symbols-outlined text-[20px] select-none leading-none">search</span>
			</div>
		</div>

		<!-- Foods List -->
		<div class="flex flex-col gap-3">
			<h2 class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Your Defined Foods</h2>
			
			{#if foodsList.length === 0}
				<div class="rounded-3xl border-2 border-dashed border-(--border) p-12 text-center flex flex-col items-center gap-4">
					<p class="text-zinc-500 dark:text-zinc-400 font-bold text-base">No catalog foods found</p>
					<p class="text-zinc-400 text-xs max-w-xs">Define custom food items with exact macronutrient counts first to easily log them.</p>
					<a
						href="/foods"
						class="px-6 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all"
					>
						Define a Food
					</a>
				</div>
			{:else}
				<div class="grid gap-3 max-h-[500px] overflow-y-auto pr-1">
					{#each foodsList as item (item.id)}
						<div class="flex items-stretch gap-2 group w-full">
							<button
								type="button"
								id="food-item-{item.id}"
								onclick={() => selectFoodItem(item)}
								class="flex-1 text-left p-4 rounded-2xl bg-(--surface) border border-(--border) hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex items-center justify-between gap-4 active:scale-[0.99] cursor-pointer"
							>
								<div>
									<h4 class="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50">{item.name}</h4>
									<p class="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mt-0.5">
										{item.quantity} {item.units} • <span class="tabular-nums text-calories">{item.calories} kcal</span>
									</p>
								</div>
								<span class="text-[10px] font-black uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-2.5 py-1.5 rounded-lg border border-(--border)">Select</span>
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
		</div>
	</div>
</div>
