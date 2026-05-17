<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pb';
	import { auth } from '$lib/user.svelte';
	import { foodDraft, resetFoodDraft } from '$lib/foodDraft.svelte';

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
				name: foodDraft.name,
				calories: foodDraft.calories,
				proteins: foodDraft.proteins,
				carbs: foodDraft.carbs,
				fats: foodDraft.fats,
				fiber: foodDraft.fiber,
				quantity: foodDraft.quantity,
				units: foodDraft.units,
				created_by: auth.user.id
			});
			success = true;
			resetFoodDraft();
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

<div class="mx-auto max-w-lg pb-12 pt-4 px-4 sm:px-6 md:pt-8">
	{#if error}
		<div class="mb-6 rounded-xl bg-red-50 p-4 ring-1 ring-inset ring-red-200 dark:bg-red-950/30 dark:ring-red-900/50" role="alert">
			<p class="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
		</div>
	{/if}

	{#if success}
		<div class="flex flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-900 py-12 px-6 text-center shadow-2xl dark:bg-zinc-100" role="status">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-600">
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<div>
				<h3 class="text-2xl font-bold tracking-tight text-white dark:text-zinc-900">Saved!</h3>
				<p class="mt-1 text-sm text-zinc-400 dark:text-zinc-600">Your custom food is now available.</p>
			</div>
			<button 
				type="button" 
				onclick={() => { success = false; goto('/add'); }}
				class="mt-4 rounded-lg bg-white/10 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20 dark:bg-black/5 dark:text-zinc-900 dark:hover:bg-black/10 active:scale-95"
			>
				Add Another
			</button>
		</div>
	{:else}
		<header class="mb-8 flex items-center justify-between">
			<div class="flex flex-col gap-1">
				<h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
					Add Macros
				</h1>
				<p class="text-sm text-zinc-500 dark:text-zinc-400">
					Step 3 of 3
				</p>
			</div>
			
			<button 
				type="button" 
				onclick={() => goto('/add/quantity')}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
		</header>

		<form onsubmit={handleSubmit} class="flex flex-col gap-6">
			<fieldset class="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
				<div class="grid grid-cols-2 gap-3">
					<!-- Calories -->
					<div class="col-span-2 flex items-center justify-between gap-4 rounded-xl bg-zinc-100/80 p-5 ring-1 ring-inset ring-zinc-200/50 dark:bg-zinc-800/50 dark:ring-zinc-700/50 focus-within:bg-zinc-200 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:bg-zinc-800 dark:focus-within:ring-zinc-50 transition-all">
						<label for="calories" class="text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Total Calories</label>
						<input
							type="number"
							id="calories"
							bind:value={foodDraft.calories}
							min="0"
							step="1"
							placeholder="0"
							autofocus
							class="w-32 text-right bg-transparent text-4xl font-black tracking-tighter text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
						/>
					</div>

					<!-- Protein -->
					<div class="flex flex-col gap-1 rounded-xl bg-rose-50/50 p-4 ring-1 ring-inset ring-rose-100 dark:bg-rose-950/20 dark:ring-rose-900/30 focus-within:bg-rose-50 focus-within:ring-2 focus-within:ring-rose-500 dark:focus-within:bg-rose-900/20 dark:focus-within:ring-rose-400 transition-all">
						<label for="proteins" class="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Protein (g)</label>
						<input
							type="number"
							id="proteins"
							bind:value={foodDraft.proteins}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-3xl font-extrabold tracking-tighter text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
						/>
					</div>

					<!-- Carbs -->
					<div class="flex flex-col gap-1 rounded-xl bg-amber-50/50 p-4 ring-1 ring-inset ring-amber-100 dark:bg-amber-950/20 dark:ring-amber-900/30 focus-within:bg-amber-50 focus-within:ring-2 focus-within:ring-amber-500 dark:focus-within:bg-amber-900/20 dark:focus-within:ring-amber-400 transition-all">
						<label for="carbs" class="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Carbs (g)</label>
						<input
							type="number"
							id="carbs"
							bind:value={foodDraft.carbs}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-3xl font-extrabold tracking-tighter text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
						/>
					</div>

					<!-- Fats -->
					<div class="flex flex-col gap-1 rounded-xl bg-blue-50/50 p-4 ring-1 ring-inset ring-blue-100 dark:bg-blue-950/20 dark:ring-blue-900/30 focus-within:bg-blue-50 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:bg-blue-900/20 dark:focus-within:ring-blue-400 transition-all">
						<label for="fats" class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Fats (g)</label>
						<input
							type="number"
							id="fats"
							bind:value={foodDraft.fats}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-3xl font-extrabold tracking-tighter text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
						/>
					</div>

					<!-- Fiber -->
					<div class="flex flex-col gap-1 rounded-xl bg-emerald-50/50 p-4 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-950/20 dark:ring-emerald-900/30 focus-within:bg-emerald-50 focus-within:ring-2 focus-within:ring-emerald-500 dark:focus-within:bg-emerald-900/20 dark:focus-within:ring-emerald-400 transition-all">
						<label for="fiber" class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Fiber (g)</label>
						<input
							type="number"
							id="fiber"
							bind:value={foodDraft.fiber}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-3xl font-extrabold tracking-tighter text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-700"
						/>
					</div>
				</div>
			</fieldset>

			<div class="pt-4">
				<button
					type="submit"
					disabled={loading}
					class="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 text-lg font-bold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20 active:scale-[0.98]"
				>
					{#if loading}
						<svg class="h-5 w-5 animate-spin text-white dark:text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span>Saving...</span>
					{:else}
						<span>Save Food</span>
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>
