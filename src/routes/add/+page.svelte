<script lang="ts">
	import { pb } from '$lib/pb';
	import { auth } from '$lib/user.svelte';
	import { FoodsUnitsOptions } from '../../../pocketbase-types';

	let name = $state('');
	let calories = $state<number | undefined>(undefined);
	let proteins = $state<number | undefined>(undefined);
	let carbs = $state<number | undefined>(undefined);
	let fats = $state<number | undefined>(undefined);
	let fiber = $state<number | undefined>(undefined);
	let quantity = $state<number>(100);
	let units = $state<FoodsUnitsOptions>(FoodsUnitsOptions.grams);
	
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!auth.user?.id) {
			error = 'You must be logged in to add a food.';
			return;
		}

		loading = true;
		error = '';
		success = false;

		try {
			await pb.collection('foods').create({
				name,
				calories,
				proteins,
				carbs,
				fats,
				fiber,
				quantity,
				units,
				created_by: auth.user.id
			});
			success = true;
			name = '';
			calories = undefined;
			proteins = undefined;
			carbs = undefined;
			fats = undefined;
			fiber = undefined;
			quantity = 100;
			units = FoodsUnitsOptions.grams;
		} catch (err: unknown) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to add food';
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto max-w-lg pb-24 pt-8 px-4 sm:px-6 md:pt-12">
	<header class="mb-10 flex flex-col gap-2">
		<h1 class="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">New Food</h1>
		<p class="text-lg text-zinc-500 dark:text-zinc-400">Enter the exact macros for your food.</p>
	</header>

	{#if error}
		<div class="mb-8 rounded-2xl bg-red-50 p-4 ring-1 ring-inset ring-red-200 dark:bg-red-950/30 dark:ring-red-900/50" role="alert">
			<p class="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
		</div>
	{/if}

	{#if success}
		<div class="flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-zinc-900 py-16 px-6 text-center shadow-2xl dark:bg-zinc-100" role="status">
			<div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-600">
				<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<div>
				<h3 class="text-3xl font-bold tracking-tight text-white dark:text-zinc-900">Saved!</h3>
				<p class="mt-2 text-zinc-400 dark:text-zinc-600">Your custom food is now available.</p>
			</div>
			<button 
				type="button" 
				onclick={() => (success = false)}
				class="mt-6 rounded-xl bg-white/10 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20 dark:bg-black/5 dark:text-zinc-900 dark:hover:bg-black/10 active:scale-95"
			>
				Add Another
			</button>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="flex flex-col gap-10">
			<!-- Core Info -->
			<fieldset class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<label for="name" class="text-xs font-bold uppercase tracking-wider text-zinc-500">Food Name</label>
					<input
						type="text"
						id="name"
						bind:value={name}
						required
						placeholder="e.g. Grilled Chicken Breast"
						class="w-full border-b-2 border-zinc-200 bg-transparent py-3 text-2xl font-bold tracking-tight text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-700 dark:focus:border-zinc-50 transition-colors"
					/>
				</div>

				<div class="grid grid-cols-2 gap-6">
					<div class="flex flex-col gap-2">
						<label for="quantity" class="text-xs font-bold uppercase tracking-wider text-zinc-500">Quantity</label>
						<input
							type="number"
							id="quantity"
							bind:value={quantity}
							min="0"
							step="0.1"
							class="w-full rounded-2xl bg-zinc-100 px-4 py-4 text-xl font-bold text-zinc-900 focus:bg-zinc-200 focus:outline-none dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800 transition-colors"
						/>
					</div>
					
					<div class="flex flex-col gap-2">
						<label for="units" class="text-xs font-bold uppercase tracking-wider text-zinc-500">Units</label>
						<div class="relative">
							<select
								id="units"
								bind:value={units}
								class="w-full appearance-none rounded-2xl bg-zinc-100 px-4 py-4 text-xl font-bold text-zinc-900 focus:bg-zinc-200 focus:outline-none dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800 transition-colors"
							>
								{#each Object.values(FoodsUnitsOptions) as unit (unit)}
									<option value={unit}>{unit}</option>
								{/each}
							</select>
							<div class="pointer-events-none absolute inset-y-0 right-4 flex items-center">
								<svg class="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</div>
					</div>
				</div>
			</fieldset>

			<!-- Macros Grid -->
			<fieldset class="flex flex-col gap-4">
				<h2 class="text-xs font-bold uppercase tracking-wider text-zinc-500">Macronutrients</h2>
				
				<div class="grid grid-cols-2 gap-4">
					<!-- Calories -->
					<div class="col-span-2 flex flex-col gap-2 rounded-[2rem] bg-zinc-100 p-6 ring-1 ring-inset ring-zinc-200/50 dark:bg-zinc-800/50 dark:ring-zinc-700/50 focus-within:bg-zinc-200 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:bg-zinc-800 dark:focus-within:ring-zinc-50 transition-all">
						<label for="calories" class="text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Total Calories</label>
						<input
							type="number"
							id="calories"
							bind:value={calories}
							min="0"
							step="1"
							placeholder="0"
							class="w-full bg-transparent text-6xl font-black tracking-tighter text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
						/>
					</div>

					<!-- Protein -->
					<div class="flex flex-col gap-2 rounded-3xl bg-rose-50/50 p-5 ring-1 ring-inset ring-rose-100 dark:bg-rose-950/20 dark:ring-rose-900/30 focus-within:bg-rose-50 focus-within:ring-2 focus-within:ring-rose-500 dark:focus-within:bg-rose-900/20 dark:focus-within:ring-rose-400 transition-all">
						<label for="proteins" class="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Protein (g)</label>
						<input
							type="number"
							id="proteins"
							bind:value={proteins}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-4xl font-extrabold tracking-tighter text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
						/>
					</div>

					<!-- Carbs -->
					<div class="flex flex-col gap-2 rounded-3xl bg-amber-50/50 p-5 ring-1 ring-inset ring-amber-100 dark:bg-amber-950/20 dark:ring-amber-900/30 focus-within:bg-amber-50 focus-within:ring-2 focus-within:ring-amber-500 dark:focus-within:bg-amber-900/20 dark:focus-within:ring-amber-400 transition-all">
						<label for="carbs" class="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Carbs (g)</label>
						<input
							type="number"
							id="carbs"
							bind:value={carbs}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-4xl font-extrabold tracking-tighter text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
						/>
					</div>

					<!-- Fats -->
					<div class="flex flex-col gap-2 rounded-3xl bg-blue-50/50 p-5 ring-1 ring-inset ring-blue-100 dark:bg-blue-950/20 dark:ring-blue-900/30 focus-within:bg-blue-50 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:bg-blue-900/20 dark:focus-within:ring-blue-400 transition-all">
						<label for="fats" class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Fats (g)</label>
						<input
							type="number"
							id="fats"
							bind:value={fats}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-4xl font-extrabold tracking-tighter text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
						/>
					</div>

					<!-- Fiber -->
					<div class="flex flex-col gap-2 rounded-3xl bg-emerald-50/50 p-5 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-950/20 dark:ring-emerald-900/30 focus-within:bg-emerald-50 focus-within:ring-2 focus-within:ring-emerald-500 dark:focus-within:bg-emerald-900/20 dark:focus-within:ring-emerald-400 transition-all">
						<label for="fiber" class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Fiber (g)</label>
						<input
							type="number"
							id="fiber"
							bind:value={fiber}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-4xl font-extrabold tracking-tighter text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
						/>
					</div>
				</div>
			</fieldset>

			<div class="pt-2">
				<button
					type="submit"
					disabled={loading}
					class="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-8 py-5 text-lg font-bold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20 active:scale-[0.98]"
				>
					{#if loading}
						<svg class="h-6 w-6 animate-spin text-white dark:text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span>Saving...</span>
					{:else}
						<span>Save Food</span>
						<svg class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>
