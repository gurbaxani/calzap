<script lang="ts">
	import { store } from '$lib/store.svelte';
	import { onMount } from 'svelte';

	let calories = $state(2000);
	let proteins = $state(150);
	let carbs = $state(200);
	let fats = $state(70);
	let fiber = $state(30);
	let weight = $state(70);
	let currentWeight = $state(70);

	let isLoading = $state(false);
	let isSaving = $state(false);
	let saveSuccess = $state(false);

	// AI API Key states (Google AI Studio)
	let apiKey = $state('');
	let showKey = $state(false);
	let isKeySaved = $state(false);
	let keySaveSuccess = $state(false);
	let keyDeleteSuccess = $state(false);

	let inputType = $derived.by(() => {
		if (showKey) {
			return 'text';
		}
		return 'password';
	});

	let keyButtonClasses = $derived.by(() => {
		if (keySaveSuccess) {
			return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10';
		}
		return 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/10 dark:bg-purple-700 dark:hover:bg-purple-600';
	});

	// High-Utility Derived Macro & Weight Metrics (Zero Side-Effects)
	let macroCalories = $derived(proteins * 4 + carbs * 4 + fats * 9);
	let calorieDifference = $derived(calories - macroCalories);
	let weightDifference = $derived(Number((currentWeight - weight).toFixed(1)));

	// Dynamic Button State Styles (Ternary-Free, Zero-Side-Effect Rune)
	let buttonClasses = $derived.by(() => {
		if (saveSuccess) {
			return 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-600/20';
		}
		return 'bg-zinc-900 hover:bg-zinc-800 text-white focus:ring-zinc-900/20 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20';
	});

	function fetchGoals() {
		calories = store.userStats.target_calories;
		proteins = store.userStats.target_proteins;
		carbs = store.userStats.target_carbs;
		fats = store.userStats.target_fats;
		fiber = store.userStats.target_fiber;
		weight = store.userStats.target_weight;
		currentWeight = store.userStats.current_weight;
	}

	function handleSaveGoals(e: Event) {
		e.preventDefault();

		isSaving = true;
		saveSuccess = false;

		store.updateUserStats({
			target_calories: Number(calories),
			target_proteins: Number(proteins),
			target_carbs: Number(carbs),
			target_fats: Number(fats),
			target_fiber: Number(fiber),
			target_weight: Number(weight),
			current_weight: Number(currentWeight)
		});

		isSaving = false;
		saveSuccess = true;
		setTimeout(() => {
			saveSuccess = false;
		}, 3000);
	}

	function handleSaveKey(e: Event) {
		e.preventDefault();
		if (!apiKey.trim()) {
			localStorage.removeItem('google_ai_studio_api_key');
			isKeySaved = false;
			keySaveSuccess = false;
			return;
		}
		localStorage.setItem('google_ai_studio_api_key', apiKey.trim());
		isKeySaved = true;
		keySaveSuccess = true;
		keyDeleteSuccess = false;
		setTimeout(() => {
			keySaveSuccess = false;
		}, 3000);
	}

	function handleDeleteKey() {
		localStorage.removeItem('google_ai_studio_api_key');
		apiKey = '';
		isKeySaved = false;
		keyDeleteSuccess = true;
		keySaveSuccess = false;
		setTimeout(() => {
			keyDeleteSuccess = false;
		}, 3000);
	}

	let importSuccess = $state(false);
	let importError = $state('');

	function handleImportBackup(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = async (event) => {
			const text = event.target?.result as string;
			const success = await store.importBackup(text);
			if (success) {
				importSuccess = true;
				importError = '';
				fetchGoals();
				setTimeout(() => {
					importSuccess = false;
				}, 3000);
			} else {
				importError = 'Invalid backup file format';
				importSuccess = false;
				setTimeout(() => {
					importError = '';
				}, 4000);
			}
		};
		reader.readAsText(file);
	}

	onMount(() => {
		fetchGoals();
		
		const savedKey = localStorage.getItem('google_ai_studio_api_key');
		if (savedKey) {
			apiKey = savedKey;
			isKeySaved = true;
		}
	});
</script>

<svelte:head>
	<title>Profile | Calzap</title>
</svelte:head>

<main class="max-w-6xl mx-auto px-6 py-12">
	<!-- Header -->
	<header class="mb-12">
		<h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-2">Your Profile</h1>
		<p class="text-muted font-medium text-lg">Manage your account, macros, and fitness targets</p>
	</header>

	<!-- Asymmetric Grid Layout -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
			
			<!-- Left Column: Personal details & account status -->
			<div class="lg:col-span-1 grid gap-6">
				<div class="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm relative overflow-hidden group">
					<!-- Top decorative pulse circle -->
					<div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[var(--color-calories)]/5 group-hover:scale-110 transition-transform duration-500"></div>
					
					<div class="flex flex-col items-center text-center gap-4 mb-6 relative">
						<div class="w-24 h-24 rounded-2xl bg-[var(--color-calories)] flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-500/10">
							L
						</div>
						<div>
							<h2 class="text-2xl font-bold tracking-tight mb-1">
								Local User
							</h2>
							<p class="text-sm text-muted font-semibold">Local Storage Only</p>
						</div>
					</div>

					<div class="grid gap-3 py-5 border-t border-[var(--border)]">
						<div class="flex justify-between items-center text-sm">
							<span class="text-muted font-medium">Data Storage</span>
							<span class="font-mono text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">Browser</span>
						</div>
					</div>

					<div class="pt-5 border-t border-[var(--border)] flex flex-col gap-3">
						<button 
							type="button"
							onclick={() => store.exportCSV()}
							class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-500/20 text-emerald-500 font-bold hover:bg-emerald-500/5 transition-all text-sm active:scale-[0.98]"
						>
							<span class="material-symbols-outlined text-[16px] select-none leading-none">download</span>
							Export Monthly CSV
						</button>

						<button 
							type="button"
							onclick={() => store.exportBackup()}
							class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-950 dark:text-zinc-50 font-bold transition-all text-sm active:scale-[0.98]"
						>
							<span class="material-symbols-outlined text-[16px] select-none leading-none">backup</span>
							Export JSON Backup
						</button>

						<input 
							type="file" 
							id="backup-file-input" 
							accept=".json" 
							onchange={handleImportBackup} 
							class="hidden" 
						/>

						<button 
							type="button"
							onclick={() => {
								const input = document.getElementById('backup-file-input');
								if (input) input.click();
							}}
							class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-500/20 text-zinc-500 hover:bg-zinc-500/5 transition-all text-sm active:scale-[0.98]"
						>
							<span class="material-symbols-outlined text-[16px] select-none leading-none">upload</span>
							Import JSON Backup
						</button>

						{#if importSuccess}
							<p class="text-center text-xs font-bold text-emerald-500 animate-pulse mt-1">Backup imported successfully!</p>
						{/if}
						{#if importError}
							<p class="text-center text-xs font-bold text-rose-500 animate-pulse mt-1">{importError}</p>
						{/if}
					</div>
				</div>

				<!-- AI Settings Card -->
				<div class="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm relative overflow-hidden group">
					<!-- Decorative purple circle (AI color themed) -->
					<div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[var(--color-fiber)]/5 group-hover:scale-110 transition-transform duration-500"></div>
					
					<div class="relative">
						<div class="flex items-center gap-3 mb-4">
							<div class="w-10 h-10 rounded-xl bg-[var(--color-fiber)]/10 text-[var(--color-fiber)] flex items-center justify-center font-black">
								<span class="material-symbols-outlined text-[20px] select-none leading-none">auto_awesome</span>
							</div>
							<div>
								<h2 class="text-xl font-bold tracking-tight">AI Settings</h2>
								<p class="text-xs text-muted font-semibold">Google AI Studio Configuration</p>
							</div>
						</div>

						<p class="text-xs text-muted mb-5 leading-relaxed">
							Configure your Google AI Studio API key to enable intelligent meal estimation and personalized nutrition advice. Your key is stored strictly on your local browser.
						</p>

						<form onsubmit={handleSaveKey} class="space-y-4">
							<div class="space-y-2">
								<label for="ai_api_key" class="text-xs font-black uppercase tracking-widest text-[var(--color-fiber)] block">
									AI Studio API Key
								</label>
								<div class="relative flex items-center bg-zinc-100/50 dark:bg-zinc-800/20 rounded-xl border border-[var(--border)] focus-within:ring-2 focus-within:ring-[var(--color-fiber)] transition-all">
									<input
										id="ai_api_key"
										type={inputType}
										bind:value={apiKey}
										placeholder="AIzaSy..."
										class="w-full bg-transparent px-4 py-3 text-sm font-medium focus:outline-none pr-12 text-zinc-900 dark:text-zinc-50"
									/>
									<button
										type="button"
										onclick={() => showKey = !showKey}
										class="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
										aria-label="Toggle password visibility"
									>
										{#if showKey}
											<span class="material-symbols-outlined text-[16px] select-none leading-none">visibility_off</span>
										{:else}
											<span class="material-symbols-outlined text-[16px] select-none leading-none">visibility</span>
										{/if}
									</button>
								</div>
							</div>

							<div class="flex flex-col gap-2">
								<button
									type="submit"
									class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm active:scale-[0.98] {keyButtonClasses}"
								>
									{#if keySaveSuccess}
										<span class="material-symbols-outlined text-[16px] select-none leading-none font-bold animate-bounce text-white">check</span>
										<span>Key Saved!</span>
									{:else}
										{#if isKeySaved}
											<span>Update API Key</span>
										{:else}
											<span>Save API Key</span>
										{/if}
									{/if}
								</button>

								{#if isKeySaved}
									<button
										type="button"
										onclick={handleDeleteKey}
										class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-500/20 text-rose-500 font-bold hover:bg-rose-500/5 transition-all text-sm active:scale-[0.98]"
									>
										<span class="material-symbols-outlined text-[14px] select-none leading-none">delete</span>
										<span>Delete Saved Key</span>
									</button>
								{/if}
							</div>

							{#if keyDeleteSuccess}
								<p class="text-center text-xs font-bold text-rose-500 animate-pulse mt-1">API Key deleted from local storage</p>
							{/if}

							<div class="pt-3 border-t border-[var(--border)] text-center">
								<a
									href="https://aistudio.google.com/"
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-fiber)] hover:underline"
								>
									Get a free API Key from Google AI Studio
									<span class="material-symbols-outlined text-[10px] select-none leading-none font-bold">open_in_new</span>
								</a>
							</div>
						</form>
					</div>
				</div>
			</div>

			<!-- Right Column: Goals Form & Dynamic Calculators -->
			<div class="lg:col-span-2 grid gap-6">
				<div class="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
					<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
						<div>
							<h2 class="text-2xl font-bold tracking-tight mb-1">Nutritional Goals</h2>
							<p class="text-muted font-medium text-sm">Fine-tune your daily calorie and macronutrient budgets</p>
						</div>
						
						<!-- Live Alignment Meter -->
						<div class="flex items-center gap-2 bg-zinc-100/80 dark:bg-zinc-800/80 p-2 rounded-2xl border border-[var(--border)] text-xs font-bold">
							<span class="text-muted">Balance Meter:</span>
							{#if calorieDifference === 0}
								<span class="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">Aligned</span>
							{:else}
								{#if calorieDifference > 0}
									<span class="text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">-{Math.abs(calorieDifference)} kcal deficit</span>
								{:else}
									<span class="text-rose-500 bg-rose-500/10 px-2 py-1 rounded-lg">+{Math.abs(calorieDifference)} kcal surplus</span>
								{/if}
							{/if}
						</div>
					</div>

					{#if isLoading}
						<div class="flex flex-col items-center justify-center py-20 gap-4">
							<span class="material-symbols-outlined animate-spin text-[40px] leading-none select-none text-zinc-500">sync</span>
							<p class="text-sm font-bold text-muted">Retrieving nutritional profile...</p>
						</div>
					{:else}


						<form onsubmit={handleSaveGoals} class="flex flex-col gap-6">
							
							<!-- Main Targets Grid -->
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								
								<!-- Daily Calories Target Card -->
								<div class="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-zinc-100/50 p-6 border border-[var(--border)] dark:bg-zinc-800/20 focus-within:ring-2 focus-within:ring-[var(--color-calories)] transition-all">
									<div>
										<label for="target_calories" class="text-xs font-black uppercase tracking-widest text-[var(--color-calories)] block mb-1">Daily Calories</label>
										<span class="text-xs text-muted font-medium">Standard baseline target calculation</span>
									</div>
									<div class="flex items-center gap-3">
										<button 
											type="button" 
											onclick={() => calories = Math.max(0, calories - 100)}
											class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											-100
										</button>
										<div class="flex items-baseline bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-[var(--border)]">
											<input
												type="number"
												id="target_calories"
												bind:value={calories}
												min="0"
												step="10"
												required
												class="w-20 text-right bg-transparent text-2xl font-black tracking-tight text-zinc-900 focus:outline-none dark:text-zinc-50"
											/>
											<span class="text-xs font-bold text-zinc-400 dark:text-zinc-500 ml-1">kcal</span>
										</div>
										<button 
											type="button" 
											onclick={() => calories = calories + 100}
											class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											+100
										</button>
									</div>
								</div>

								<!-- Protein Target Card -->
								<div class="flex flex-col gap-3 rounded-2xl bg-rose-50/20 p-5 border border-rose-100/60 dark:bg-rose-950/5 dark:border-rose-900/10 focus-within:ring-2 focus-within:ring-[var(--color-protein)] transition-all">
									<div class="flex justify-between items-center">
										<label for="target_proteins" class="text-xs font-black uppercase tracking-widest text-[var(--color-protein)]">Protein</label>
										<span class="text-[10px] font-bold text-rose-500/70 bg-rose-500/5 px-1.5 py-0.5 rounded">{proteins * 4} kcal</span>
									</div>
									<div class="flex items-center justify-between gap-2 mt-1">
										<button 
											type="button" 
											onclick={() => proteins = Math.max(0, proteins - 5)}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											-5
										</button>
										<div class="flex items-baseline flex-1 justify-center bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-[var(--border)] max-w-[120px]">
											<input
												type="number"
												id="target_proteins"
												bind:value={proteins}
												min="0"
												step="1"
												required
												class="w-12 text-center bg-transparent text-xl font-extrabold tracking-tight text-zinc-900 focus:outline-none dark:text-zinc-50"
											/>
											<span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 ml-0.5">g</span>
										</div>
										<button 
											type="button" 
											onclick={() => proteins = proteins + 5}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											+5
										</button>
									</div>
								</div>

								<!-- Carbs Target Card -->
								<div class="flex flex-col gap-3 rounded-2xl bg-amber-50/20 p-5 border border-amber-100/60 dark:bg-amber-950/5 dark:border-amber-900/10 focus-within:ring-2 focus-within:ring-[var(--color-carbs)] transition-all">
									<div class="flex justify-between items-center">
										<label for="target_carbs" class="text-xs font-black uppercase tracking-widest text-[var(--color-carbs)]">Carbohydrates</label>
										<span class="text-[10px] font-bold text-amber-600/70 bg-amber-600/5 px-1.5 py-0.5 rounded">{carbs * 4} kcal</span>
									</div>
									<div class="flex items-center justify-between gap-2 mt-1">
										<button 
											type="button" 
											onclick={() => carbs = Math.max(0, carbs - 5)}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											-5
										</button>
										<div class="flex items-baseline flex-1 justify-center bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-[var(--border)] max-w-[120px]">
											<input
												type="number"
												id="target_carbs"
												bind:value={carbs}
												min="0"
												step="1"
												required
												class="w-12 text-center bg-transparent text-xl font-extrabold tracking-tight text-zinc-900 focus:outline-none dark:text-zinc-50"
											/>
											<span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 ml-0.5">g</span>
										</div>
										<button 
											type="button" 
											onclick={() => carbs = carbs + 5}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											+5
										</button>
									</div>
								</div>

								<!-- Fats Target Card -->
								<div class="flex flex-col gap-3 rounded-2xl bg-emerald-50/20 p-5 border border-emerald-100/60 dark:bg-emerald-950/5 dark:border-emerald-900/10 focus-within:ring-2 focus-within:ring-[var(--color-fats)] transition-all">
									<div class="flex justify-between items-center">
										<label for="target_fats" class="text-xs font-black uppercase tracking-widest text-[var(--color-fats)]">Fats</label>
										<span class="text-[10px] font-bold text-emerald-600/70 bg-emerald-600/5 px-1.5 py-0.5 rounded">{fats * 9} kcal</span>
									</div>
									<div class="flex items-center justify-between gap-2 mt-1">
										<button 
											type="button" 
											onclick={() => fats = Math.max(0, fats - 5)}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											-5
										</button>
										<div class="flex items-baseline flex-1 justify-center bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-[var(--border)] max-w-[120px]">
											<input
												type="number"
												id="target_fats"
												bind:value={fats}
												min="0"
												step="1"
												required
												class="w-12 text-center bg-transparent text-xl font-extrabold tracking-tight text-zinc-900 focus:outline-none dark:text-zinc-50"
											/>
											<span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 ml-0.5">g</span>
										</div>
										<button 
											type="button" 
											onclick={() => fats = fats + 5}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											+5
										</button>
									</div>
								</div>

								<!-- Fiber Target Card -->
								<div class="flex flex-col gap-3 rounded-2xl bg-purple-50/20 p-5 border border-purple-100/60 dark:bg-purple-950/5 dark:border-purple-900/10 focus-within:ring-2 focus-within:ring-[var(--color-fiber)] transition-all">
									<div class="flex justify-between items-center">
										<label for="target_fiber" class="text-xs font-black uppercase tracking-widest text-[var(--color-fiber)]">Dietary Fiber</label>
										<span class="text-[10px] font-bold text-purple-600/70 bg-purple-600/5 px-1.5 py-0.5 rounded">Essential digestion</span>
									</div>
									<div class="flex items-center justify-between gap-2 mt-1">
										<button 
											type="button" 
											onclick={() => fiber = Math.max(0, fiber - 5)}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											-5
										</button>
										<div class="flex items-baseline flex-1 justify-center bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-[var(--border)] max-w-[120px]">
											<input
												type="number"
												id="target_fiber"
												bind:value={fiber}
												min="0"
												step="1"
												required
												class="w-12 text-center bg-transparent text-xl font-extrabold tracking-tight text-zinc-900 focus:outline-none dark:text-zinc-50"
											/>
											<span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 ml-0.5">g</span>
										</div>
										<button 
											type="button" 
											onclick={() => fiber = fiber + 5}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											+5
										</button>
									</div>
								</div>

								<!-- Weight Target Section Header / Visual Balance Meter -->
								<div class="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-4 border-t border-[var(--border)] mt-2">
									<div>
										<h3 class="text-sm font-bold tracking-tight">Weight Profile</h3>
										<p class="text-xs text-muted">Track body composition targets and updates</p>
									</div>
									
									<!-- Weight Progress Badge -->
									<div class="flex items-center gap-1.5 self-start text-[10px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-[var(--border)]">
										<span class="text-muted">Target status:</span>
										{#if weightDifference === 0}
											<span class="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Goal Reached</span>
										{:else}
											{#if weightDifference > 0}
												<span class="text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">To Lose: {weightDifference} kg</span>
											{:else}
												<span class="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">To Gain: {Math.abs(weightDifference)} kg</span>
											{/if}
										{/if}
									</div>
								</div>

								<!-- Current Weight Card -->
								<div class="flex flex-col gap-3 rounded-2xl bg-zinc-100/30 p-5 border border-[var(--border)] dark:bg-zinc-800/10 focus-within:ring-2 focus-within:ring-zinc-500 transition-all">
									<div class="flex justify-between items-center">
										<label for="current_weight" class="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Current Weight</label>
										<span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">Live entry</span>
									</div>
									<div class="flex items-center justify-between gap-2 mt-1">
										<button 
											type="button" 
											onclick={() => currentWeight = Math.max(0, Number((currentWeight - 0.5).toFixed(1)))}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											-0.5
										</button>
										<div class="flex items-baseline flex-1 justify-center bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-[var(--border)] max-w-[120px]">
											<input
												type="number"
												id="current_weight"
												bind:value={currentWeight}
												min="0"
												step="0.1"
												required
												class="w-12 text-center bg-transparent text-xl font-extrabold tracking-tight text-zinc-900 focus:outline-none dark:text-zinc-50"
											/>
											<span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 ml-0.5">kg</span>
										</div>
										<button 
											type="button" 
											onclick={() => currentWeight = Number((currentWeight + 0.5).toFixed(1))}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											+0.5
										</button>
									</div>
								</div>

								<!-- Target Weight (Goal Weight) Card -->
								<div class="flex flex-col gap-3 rounded-2xl bg-zinc-100/30 p-5 border border-[var(--border)] dark:bg-zinc-800/10 focus-within:ring-2 focus-within:ring-zinc-500 transition-all">
									<div class="flex justify-between items-center">
										<label for="target_weight" class="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Goal Weight</label>
										<span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">Target goal</span>
									</div>
									<div class="flex items-center justify-between gap-2 mt-1">
										<button 
											type="button" 
											onclick={() => weight = Math.max(0, Number((weight - 0.5).toFixed(1)))}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											-0.5
										</button>
										<div class="flex items-baseline flex-1 justify-center bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-[var(--border)] max-w-[120px]">
											<input
												type="number"
												id="target_weight"
												bind:value={weight}
												min="0"
												step="0.1"
												required
												class="w-12 text-center bg-transparent text-xl font-extrabold tracking-tight text-zinc-900 focus:outline-none dark:text-zinc-50"
											/>
											<span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 ml-0.5">kg</span>
										</div>
										<button 
											type="button" 
											onclick={() => weight = Number((weight + 0.5).toFixed(1))}
											class="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-90 transition-all"
										>
											+0.5
										</button>
									</div>
								</div>

							</div>

							<!-- Save Controls -->
							<button
								type="submit"
								disabled={isSaving}
								class="group relative flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-bold transition-all focus:outline-none focus:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 {buttonClasses}"
							>
								{#if isSaving}
									<span class="material-symbols-outlined animate-spin text-[20px] leading-none select-none">sync</span>
									<span>Saving changes...</span>
								{:else}
									{#if saveSuccess}
										<span class="material-symbols-outlined text-[20px] select-none leading-none font-bold animate-bounce text-white">check</span>
										<span>Saved Successfully!</span>
									{:else}
										<span>Save Nutritional Budget</span>
									{/if}
								{/if}
							</button>
						</form>
					{/if}
				</div>
			</div>

		</div>
</main>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
</style>
