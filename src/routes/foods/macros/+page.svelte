<script lang="ts">
	import { goto } from '$app/navigation';
	import { store } from '$lib/store.svelte';
	import { foodDraft, resetFoodDraft } from '$lib/foodDraft.svelte';

	let loading = $state(false);
	let estimating = $state(false);
	let error = $state('');
	let success = $state(false);

	async function estimateMacros() {
		const apiKey = store.userStats.google_ai_studio_api_key;
		if (!apiKey) {
			error = 'Google AI Studio API key not found. Please add it in your profile settings.';
			return;
		}

		estimating = true;
		error = '';

		const prompt = `Estimate the macronutrients for the following food item. Respond with a JSON object exactly like this: {"calories": 100, "proteins": 10, "carbs": 20, "fats": 5, "fiber": 2}. Use numbers. Return ONLY valid JSON without Markdown blocks.
Food Name: ${foodDraft.name}
Quantity: ${foodDraft.quantity} ${foodDraft.units}
Special ingredients/notes: ${foodDraft.notes || 'None'}`;

		try {
			const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					contents: [{
						parts: [{ text: prompt }]
					}],
					generationConfig: {
						temperature: 0.1,
						responseMimeType: "application/json"
					}
				})
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.error?.message || 'Failed to fetch estimation from Gemini');
			}

			const data = await response.json();
			const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
			if (!textResponse) {
				throw new Error('Invalid response from Gemini');
			}

			const result = JSON.parse(textResponse);

			if (result.calories !== undefined) foodDraft.calories = Number(result.calories);
			if (result.proteins !== undefined) foodDraft.proteins = Number(result.proteins);
			if (result.carbs !== undefined) foodDraft.carbs = Number(result.carbs);
			if (result.fats !== undefined) foodDraft.fats = Number(result.fats);
			if (result.fiber !== undefined) foodDraft.fiber = Number(result.fiber);
		} catch (err: any) {
			error = 'Estimation failed: ' + err.message;
		} finally {
			estimating = false;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		loading = true;
		error = '';
		success = false;

		try {
			store.addFood({
				name: foodDraft.name,
				calories: foodDraft.calories || 0,
				proteins: foodDraft.proteins || 0,
				carbs: foodDraft.carbs || 0,
				fats: foodDraft.fats || 0,
				fiber: foodDraft.fiber || 0,
				quantity: foodDraft.quantity || 0,
				units: foodDraft.units || 'grams',
				notes: foodDraft.notes
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
				<span class="material-symbols-outlined text-[24px] select-none leading-none font-bold">check</span>
			</div>
			<div>
				<h3 class="text-2xl font-bold tracking-tight text-white dark:text-zinc-900">Saved!</h3>
				<p class="mt-1 text-sm text-zinc-400 dark:text-zinc-600">Your custom food is now available.</p>
			</div>
			<button 
				type="button" 
				onclick={() => { success = false; goto('/foods'); }}
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
				onclick={() => goto('/foods/quantity')}
				aria-label="Go back to quantity selection"
				class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
			>
				<span class="material-symbols-outlined text-[20px] select-none leading-none">arrow_back</span>
			</button>
		</header>

		<div class="mb-2 animate-in fade-in slide-in-from-right-4 duration-300">
			<button
				type="button"
				onclick={estimateMacros}
				disabled={estimating || loading}
				class="group flex w-full items-center justify-center gap-2 rounded-xl bg-fiber/10 px-4 py-4 text-sm font-bold text-fiber transition-all hover:bg-fiber/20 focus:outline-none focus:ring-4 focus:ring-fiber/20 active:scale-[0.98] border border-fiber/20 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if estimating}
					<span class="material-symbols-outlined animate-spin text-[20px] leading-none select-none">sync</span>
					<span>Estimating with AI...</span>
				{:else}
					<span class="material-symbols-outlined text-[18px] select-none leading-none">auto_awesome</span>
					<span>Estimate Macros with AI</span>
				{/if}
			</button>
		</div>

		<form onsubmit={handleSubmit} class="flex flex-col gap-6">
			<fieldset class="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
				<div class="grid grid-cols-2 gap-3">
					<!-- Calories -->
					<div class="col-span-2 flex items-center justify-between gap-4 rounded-xl bg-calories/5 p-5 border border-calories/15 dark:border-calories/25 focus-within:bg-calories/10 focus-within:ring-2 focus-within:ring-calories transition-all">
						<label for="calories" class="text-sm font-bold uppercase tracking-wider text-calories">Total Calories</label>
						<input
							type="number"
							id="calories"
							bind:value={foodDraft.calories}
							min="0"
							step="1"
							placeholder="0"
							class="w-32 text-right bg-transparent text-4xl font-black tracking-tighter text-calories placeholder:text-calories/30 focus:outline-none focus:placeholder:text-calories/10"
						/>
					</div>

					<!-- Protein -->
					<div class="flex flex-col gap-1 rounded-xl bg-protein/5 p-4 border border-protein/15 dark:border-protein/25 focus-within:bg-protein/10 focus-within:ring-2 focus-within:ring-protein transition-all">
						<label for="proteins" class="text-[10px] font-bold uppercase tracking-wider text-protein">Protein (g)</label>
						<input
							type="number"
							id="proteins"
							bind:value={foodDraft.proteins}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-3xl font-extrabold tracking-tighter text-protein placeholder:text-protein/30 focus:outline-none"
						/>
					</div>

					<!-- Carbs -->
					<div class="flex flex-col gap-1 rounded-xl bg-carbs/5 p-4 border border-carbs/15 dark:border-carbs/25 focus-within:bg-carbs/10 focus-within:ring-2 focus-within:ring-carbs transition-all">
						<label for="carbs" class="text-[10px] font-bold uppercase tracking-wider text-carbs">Carbs (g)</label>
						<input
							type="number"
							id="carbs"
							bind:value={foodDraft.carbs}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-3xl font-extrabold tracking-tighter text-carbs placeholder:text-carbs/30 focus:outline-none"
						/>
					</div>

					<!-- Fats -->
					<div class="flex flex-col gap-1 rounded-xl bg-fats/5 p-4 border border-fats/15 dark:border-fats/25 focus-within:bg-fats/10 focus-within:ring-2 focus-within:ring-fats transition-all">
						<label for="fats" class="text-[10px] font-bold uppercase tracking-wider text-fats">Fats (g)</label>
						<input
							type="number"
							id="fats"
							bind:value={foodDraft.fats}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-3xl font-extrabold tracking-tighter text-fats placeholder:text-fats/30 focus:outline-none"
						/>
					</div>

					<!-- Fiber -->
					<div class="flex flex-col gap-1 rounded-xl bg-fiber/5 p-4 border border-fiber/15 dark:border-fiber/25 focus-within:bg-fiber/10 focus-within:ring-2 focus-within:ring-fiber transition-all">
						<label for="fiber" class="text-[10px] font-bold uppercase tracking-wider text-fiber">Fiber (g)</label>
						<input
							type="number"
							id="fiber"
							bind:value={foodDraft.fiber}
							min="0"
							step="0.1"
							placeholder="0"
							class="w-full bg-transparent text-3xl font-extrabold tracking-tighter text-fiber placeholder:text-fiber/30 focus:outline-none"
						/>
					</div>
				</div>
			</fieldset>

			<div class="pt-4">
				<button
					type="submit"
					disabled={loading || estimating}
					class="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 text-lg font-bold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20 active:scale-[0.98]"
				>
					{#if loading}
						<span class="material-symbols-outlined animate-spin text-[20px] leading-none select-none">sync</span>
						<span>Saving...</span>
					{:else}
						<span>Save Food</span>
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>
