<script lang="ts">
	import { store } from '$lib/store.svelte';
	import type { Food } from '$lib/store.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	// Catalog Search and Accordion States
	let searchQuery = $state('');
	let activeExpandId = $state<string | null>(null);

	// Deletion Modal States
	let isDeleteModalOpen = $state(false);
	let foodIdToDelete = $state<string | null>(null);

	// Form Modal States (Create and Update)
	let isFormOpen = $state(false);
	let formMode = $state<'create' | 'edit'>('create');
	let editingFoodId = $state<string | null>(null);

	// Form Field States
	let name = $state('');
	let quantity = $state<number>(100);
	let units = $state('grams');
	let calories = $state<number>(0);
	let proteins = $state<number>(0);
	let carbs = $state<number>(0);
	let fats = $state<number>(0);
	let fiber = $state<number>(0);
	let notes = $state('');

	// AI Estimation States
	let estimating = $state(false);
	let aiError = $state('');

	// Derived filtered foods based on search query
	const foodsList = $derived.by(() => {
		if (searchQuery.trim() !== '') {
			return store.foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
		}
		return store.foods;
	});

	// Trigger custom Delete confirmation modal
	function triggerDeleteFood(id: string) {
		foodIdToDelete = id;
		isDeleteModalOpen = true;
	}

	function confirmDelete() {
		if (foodIdToDelete) {
			try {
				store.deleteFood(foodIdToDelete);
			} catch (err: unknown) {
				console.error('Failed to delete food:', err);
			}
		}
		isDeleteModalOpen = false;
		foodIdToDelete = null;
	}

	function cancelDelete() {
		isDeleteModalOpen = false;
		foodIdToDelete = null;
	}

	// Open Form Modal for Create or Update
	function openForm(mode: 'create' | 'edit', food?: Food) {
		formMode = mode;
		aiError = '';
		
		if (mode === 'edit' && food) {
			editingFoodId = food.id;
			name = food.name;
			quantity = food.quantity;
			units = food.units;
			calories = food.calories;
			proteins = food.proteins;
			carbs = food.carbs;
			fats = food.fats;
			fiber = food.fiber;
			notes = food.notes || '';
		} else {
			editingFoodId = null;
			name = '';
			quantity = 100;
			units = 'grams';
			calories = 0;
			proteins = 0;
			carbs = 0;
			fats = 0;
			fiber = 0;
			notes = '';
		}
		isFormOpen = true;
	}

	function closeForm() {
		isFormOpen = false;
		editingFoodId = null;
	}

	// AI Estimation using Gemini API (same logic and prompt as the wizard)
	async function estimateMacros() {
		const apiKey = store.userStats.google_ai_studio_api_key;
		if (!apiKey) {
			aiError = 'Google AI Studio API key not found. Please add it in your profile settings.';
			return;
		}

		if (!name.trim()) {
			aiError = 'Please input a food name first before estimating.';
			return;
		}

		estimating = true;
		aiError = '';

		const prompt = `Estimate the macronutrients for the following food item. Respond with a JSON object exactly like this: {"calories": 100, "proteins": 10, "carbs": 20, "fats": 5, "fiber": 2}. Use numbers. Return ONLY valid JSON without Markdown blocks.
Food Name: ${name}
Reference Quantity: ${quantity} ${units}
Special ingredients/notes: ${notes || 'None'}`;

		try {
			const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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

			if (result.calories !== undefined) calories = Number(result.calories);
			if (result.proteins !== undefined) proteins = Number(result.proteins);
			if (result.carbs !== undefined) carbs = Number(result.carbs);
			if (result.fats !== undefined) fats = Number(result.fats);
			if (result.fiber !== undefined) fiber = Number(result.fiber);
		} catch (err: unknown) {
			if (err instanceof Error) {
				aiError = 'Estimation failed: ' + err.message;
			} else {
				aiError = 'Estimation failed';
			}
		} finally {
			estimating = false;
		}
	}

	function handleFormSubmit(e: Event) {
		e.preventDefault();

		const foodData = {
			name: name.trim(),
			quantity: Number(quantity) || 100,
			units: units.trim() || 'grams',
			calories: Number(calories) || 0,
			proteins: Number(proteins) || 0,
			carbs: Number(carbs) || 0,
			fats: Number(fats) || 0,
			fiber: Number(fiber) || 0,
			notes: notes.trim() || undefined
		};

		try {
			if (formMode === 'edit' && editingFoodId) {
				store.updateFood(editingFoodId, foodData);
			} else {
				store.addFood(foodData);
			}
			closeForm();
		} catch (err: unknown) {
			console.error('Failed to save food definition:', err);
		}
	}
</script>

<svelte:head>
	<title>Manage Foods | Calzap</title>
	<meta name="description" content="View, search, edit, create or delete custom foods from your catalog." />
</svelte:head>

<div class="mx-auto max-w-lg pb-12 pt-4 px-4 sm:px-6 md:pt-8 flex flex-col gap-8 animate-in fade-in duration-300">
	<!-- Page Header -->
	<header class="flex items-center justify-between border-b border-(--border) pb-6">
		<div class="flex flex-col">
			<h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Custom Foods</h1>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">
				Manage catalog definitions ({store.foods.length})
			</p>
		</div>
		<button
			type="button"
			onclick={() => openForm('create')}
			class="px-4 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
		>
			<span class="material-symbols-outlined text-[16px] leading-none select-none font-bold">add</span>
			<span>Define Food</span>
		</button>
	</header>

	<!-- Search bar & custom list view -->
	<div class="flex flex-col gap-6">
		<!-- Search Input -->
		<div class="relative">
			<input
				type="search"
				id="search-foods-input"
				bind:value={searchQuery}
				placeholder="Search your custom catalog..."
				class="w-full rounded-2xl bg-(--surface) border border-(--border) px-5 py-4 pl-12 font-bold text-base focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-50"
			/>
			<div class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
				<span class="material-symbols-outlined text-[20px] select-none leading-none">search</span>
			</div>
		</div>

		<!-- Foods Catalog Accordion stream -->
		<div class="flex flex-col gap-3">
			{#if foodsList.length === 0}
				<div class="rounded-3xl border-2 border-dashed border-(--border) p-12 text-center flex flex-col items-center gap-4 bg-zinc-50/30 dark:bg-zinc-950/10">
					<p class="text-zinc-500 dark:text-zinc-400 font-bold text-base">No catalog foods found</p>
					<p class="text-zinc-400 text-xs max-w-xs leading-relaxed">
						You haven't defined any custom foods matching your search. Create food definitions to log meals instantly with custom values.
					</p>
					<button
						type="button"
						onclick={() => openForm('create')}
						class="px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
					>
						Define a Food
					</button>
				</div>
			{:else}
				<div class="grid gap-3">
					{#each foodsList as item (item.id)}
						{@const isExpanded = activeExpandId === item.id}
						<div class="flex flex-col rounded-3xl bg-(--surface) border transition-all duration-300 shadow-xs {isExpanded ? 'border-zinc-400 dark:border-zinc-600 ring-1 ring-zinc-400 dark:ring-zinc-600' : 'border-(--border) hover:border-zinc-300 dark:hover:border-zinc-700'}">
							<!-- Main Row -->
							<button
								type="button"
								onclick={() => { activeExpandId = isExpanded ? null : item.id; }}
								class="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
							>
								<div>
									<h4 class="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">{item.name}</h4>
									<p class="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mt-1">
										Reference Size: {item.quantity} {item.units} • <span class="tabular-nums text-calories">{item.calories} kcal</span>
									</p>
								</div>
								<div class="flex items-center gap-2">
									<span class="material-symbols-outlined text-[20px] text-zinc-400 transition-transform duration-300 select-none {isExpanded ? 'rotate-180 text-zinc-700 dark:text-zinc-300' : ''}">keyboard_arrow_down</span>
								</div>
							</button>

							<!-- Collapsible details accordion -->
							{#if isExpanded}
								<div class="px-5 pb-5 pt-1 border-t border-zinc-100 dark:border-zinc-900/50 flex flex-col gap-5 animate-in slide-in-from-top-2 duration-200">
									<!-- Detailed Macros Grid -->
									<div class="grid grid-cols-4 gap-1.5">
										<div class="rounded-xl border border-(--border) p-2 text-center bg-protein/5 border-protein/15 flex flex-col justify-center">
											<span class="text-[8px] font-black uppercase tracking-wider text-protein">Protein</span>
											<span class="text-sm font-black tabular-nums text-protein mt-0.5">{item.proteins}g</span>
										</div>
										<div class="rounded-xl border border-(--border) p-2 text-center bg-carbs/5 border-carbs/15 flex flex-col justify-center">
											<span class="text-[8px] font-black uppercase tracking-wider text-carbs">Carbs</span>
											<span class="text-sm font-black tabular-nums text-carbs mt-0.5">{item.carbs}g</span>
										</div>
										<div class="rounded-xl border border-(--border) p-2 text-center bg-fats/5 border-fats/15 flex flex-col justify-center">
											<span class="text-[8px] font-black uppercase tracking-wider text-fats">Fats</span>
											<span class="text-sm font-black tabular-nums text-fats mt-0.5">{item.fats}g</span>
										</div>
										<div class="rounded-xl border border-(--border) p-2 text-center bg-fiber/5 border-fiber/15 flex flex-col justify-center">
											<span class="text-[8px] font-black uppercase tracking-wider text-fiber">Fiber</span>
											<span class="text-sm font-black tabular-nums text-fiber mt-0.5">{item.fiber}g</span>
										</div>
									</div>

									<!-- Special notes block -->
									{#if item.notes}
										<div class="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-(--border)">
											<span class="text-[8px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">Ingredients / Notes</span>
											<p class="text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed">{item.notes}</p>
										</div>
									{/if}

									<!-- CRUD action buttons -->
									<div class="flex gap-2.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-900/50">
										<button
											type="button"
											onclick={() => openForm('edit', item)}
											class="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-(--border) transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
										>
											<span class="material-symbols-outlined text-[15px] select-none leading-none">edit</span>
											<span>Edit Food</span>
										</button>
										<button
											type="button"
											onclick={() => triggerDeleteFood(item.id)}
											class="py-2.5 px-4 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 border border-red-100 dark:border-red-950/50 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
										>
											<span class="material-symbols-outlined text-[15px] select-none leading-none">delete</span>
											<span>Delete</span>
										</button>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Reusable animated Delete Modal -->
<ConfirmModal
	isOpen={isDeleteModalOpen}
	title="Delete Food Definition"
	message="Are you sure you want to delete this food definition? This will not affect your past log history."
	onConfirm={confirmDelete}
	onCancel={cancelDelete}
/>

<!-- Premium Interactive CRUD Modal (Drawer/Dialog) for Create and Update -->
{#if isFormOpen}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			onclick={closeForm}
			class="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300 w-full h-full border-0 cursor-pointer"
			aria-label="Close modal"
		></button>

		<!-- Modal Scrollable Content Container -->
		<div class="relative bg-(--surface) border border-(--border) w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
			<!-- Modal Header -->
			<header class="p-6 border-b border-(--border) flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
				<div>
					<h3 class="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
						{formMode === 'create' ? 'Define Food' : 'Edit Food'}
					</h3>
					<p class="text-xs text-zinc-400 mt-0.5">
						{formMode === 'create' ? 'Define custom nutritional specifications' : 'Update existing nutritional specifications'}
					</p>
				</div>
				<button
					type="button"
					onclick={closeForm}
					class="h-9 w-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
					aria-label="Cancel"
				>
					✕
				</button>
			</header>

			<!-- Form Container -->
			<form onsubmit={handleFormSubmit} class="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
				{#if aiError}
					<div class="rounded-xl bg-red-50 p-4 ring-1 ring-inset ring-red-200 dark:bg-red-950/30 dark:ring-red-900/50" role="alert">
						<p class="text-xs font-semibold text-red-800 dark:text-red-200">{aiError}</p>
					</div>
				{/if}

				<!-- Gemini AI Smart Autofill trigger -->
				<div>
					<button
						type="button"
						onclick={estimateMacros}
						disabled={estimating || !name.trim()}
						class="group flex w-full items-center justify-center gap-2 rounded-2xl bg-fiber/10 px-4 py-3.5 text-sm font-extrabold text-fiber transition-all hover:bg-fiber/20 focus:outline-none focus:ring-4 focus:ring-fiber/20 active:scale-[0.98] border border-fiber/15 disabled:cursor-not-allowed disabled:opacity-40"
					>
						{#if estimating}
							<span class="material-symbols-outlined animate-spin text-[18px] leading-none select-none">sync</span>
							<span>Estimating Macros with Gemini AI...</span>
						{:else}
							<span class="material-symbols-outlined text-[16px] select-none leading-none">auto_awesome</span>
							<span>Estimate Macros with AI (Gemini)</span>
						{/if}
					</button>
					<span class="text-[9px] text-zinc-400 mt-1 block text-center leading-normal">
						Ensure you typed a name (and optional details in notes) before triggering the AI estimate.
					</span>
				</div>

				<!-- Field inputs -->
				<fieldset class="flex flex-col gap-4">
					<!-- Food Name -->
					<div class="flex flex-col gap-1.5">
						<label for="food-form-name" class="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Food Name</label>
						<input
							type="text"
							id="food-form-name"
							bind:value={name}
							placeholder="e.g. Avocado, Whole Eggs, Grilled Salmon"
							required
							class="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-(--border) px-4 py-3 font-bold text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all text-zinc-900 dark:text-zinc-50"
						/>
					</div>

					<!-- Reference Quantity and Units -->
					<div class="grid grid-cols-2 gap-4">
						<div class="flex flex-col gap-1.5">
							<label for="food-form-qty" class="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Reference Size</label>
							<input
								type="number"
								id="food-form-qty"
								bind:value={quantity}
								min="0.1"
								step="any"
								required
								class="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-(--border) px-4 py-3 font-bold text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all text-zinc-900 dark:text-zinc-50 tabular-nums"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label for="food-form-units" class="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Units</label>
							<select
								id="food-form-units"
								bind:value={units}
								class="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-(--border) px-4 py-3 font-bold text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all text-zinc-900 dark:text-zinc-50 cursor-pointer"
							>
								<option value="grams">grams</option>
								<option value="ml">ml (milliliters)</option>
								<option value="pieces">pieces</option>
								<option value="servings">servings</option>
								<option value="oz">oz (ounces)</option>
								<option value="cups">cups</option>
							</select>
						</div>
					</div>

					<!-- Macros Inputs -->
					<div class="grid grid-cols-2 gap-3.5">
						<!-- Calories -->
						<div class="col-span-2 flex items-center justify-between gap-4 rounded-xl bg-calories/5 p-4 border border-calories/15 dark:border-calories/25 focus-within:bg-calories/10 transition-all">
							<label for="food-form-calories" class="text-xs font-black uppercase tracking-wider text-calories">Total Calories (kcal)</label>
							<input
								type="number"
								id="food-form-calories"
								bind:value={calories}
								min="0"
								step="1"
								required
								class="w-28 text-right bg-transparent text-3xl font-black tracking-tighter text-calories focus:outline-none tabular-nums"
							/>
						</div>

						<!-- Protein -->
						<div class="flex flex-col gap-1 rounded-xl bg-protein/5 p-3.5 border border-protein/15 dark:border-protein/25 focus-within:bg-protein/10 transition-all">
							<label for="food-form-proteins" class="text-[9px] font-black uppercase tracking-wider text-protein">Protein (g)</label>
							<input
								type="number"
								id="food-form-proteins"
								bind:value={proteins}
								min="0"
								step="0.1"
								required
								class="w-full bg-transparent text-2xl font-extrabold tracking-tighter text-protein focus:outline-none tabular-nums"
							/>
						</div>

						<!-- Carbs -->
						<div class="flex flex-col gap-1 rounded-xl bg-carbs/5 p-3.5 border border-carbs/15 dark:border-carbs/25 focus-within:bg-carbs/10 transition-all">
							<label for="food-form-carbs" class="text-[9px] font-black uppercase tracking-wider text-carbs">Carbs (g)</label>
							<input
								type="number"
								id="food-form-carbs"
								bind:value={carbs}
								min="0"
								step="0.1"
								required
								class="w-full bg-transparent text-2xl font-extrabold tracking-tighter text-carbs focus:outline-none tabular-nums"
							/>
						</div>

						<!-- Fats -->
						<div class="flex flex-col gap-1 rounded-xl bg-fats/5 p-3.5 border border-fats/15 dark:border-fats/25 focus-within:bg-fats/10 transition-all">
							<label for="food-form-fats" class="text-[9px] font-black uppercase tracking-wider text-fats">Fats (g)</label>
							<input
								type="number"
								id="food-form-fats"
								bind:value={fats}
								min="0"
								step="0.1"
								required
								class="w-full bg-transparent text-2xl font-extrabold tracking-tighter text-fats focus:outline-none tabular-nums"
							/>
						</div>

						<!-- Fiber -->
						<div class="flex flex-col gap-1 rounded-xl bg-fiber/5 p-3.5 border border-fiber/15 dark:border-fiber/25 focus-within:bg-fiber/10 transition-all">
							<label for="food-form-fiber" class="text-[9px] font-black uppercase tracking-wider text-fiber">Fiber (g)</label>
							<input
								type="number"
								id="food-form-fiber"
								bind:value={fiber}
								min="0"
								step="0.1;;"
								required
								class="w-full bg-transparent text-2xl font-extrabold tracking-tighter text-fiber focus:outline-none tabular-nums"
							/>
						</div>
					</div>

					<!-- Notes / Special Ingredients -->
					<div class="flex flex-col gap-1.5">
						<label for="food-form-notes" class="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Special Ingredients / Notes</label>
						<textarea
							id="food-form-notes"
							bind:value={notes}
							rows="3"
							placeholder="Optional ingredients breakdown or helper guidelines..."
							class="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-(--border) px-4 py-3 font-bold text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all text-zinc-900 dark:text-zinc-50 resize-y"
						></textarea>
					</div>
				</fieldset>

				<!-- Save & Cancel triggers -->
				<div class="flex gap-4 pt-4 border-t border-(--border) mt-2 shrink-0">
					<button
						type="button"
						onclick={closeForm}
						class="flex-1 py-4 px-4 rounded-2xl border border-(--border) text-sm font-extrabold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 py-4 px-4 rounded-2xl text-sm font-extrabold text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md"
					>
						Save Specifications
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
