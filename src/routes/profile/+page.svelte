<script lang="ts">
	import { auth } from '$lib/user.svelte';
	import { pb } from '$lib/pb';
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
	let saveError = $state('');
	let exists = $state(false);

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

	async function fetchGoals() {
		if (!auth.user?.id) {
			return;
		}

		isLoading = true;
		saveError = '';

		try {
			const record = await pb.collection('user_stats').getOne(auth.user.id);
			
			if (record.target_calories !== undefined && record.target_calories !== null) {
				calories = record.target_calories;
			} else {
				calories = 2000;
			}

			if (record.target_proteins !== undefined && record.target_proteins !== null) {
				proteins = record.target_proteins;
			} else {
				proteins = 150;
			}

			if (record.target_carbs !== undefined && record.target_carbs !== null) {
				carbs = record.target_carbs;
			} else {
				carbs = 200;
			}

			if (record.target_fats !== undefined && record.target_fats !== null) {
				fats = record.target_fats;
			} else {
				fats = 70;
			}

			if (record.target_fiber !== undefined && record.target_fiber !== null) {
				fiber = record.target_fiber;
			} else {
				fiber = 30;
			}

			if (record.target_weight !== undefined && record.target_weight !== null) {
				weight = record.target_weight;
			} else {
				weight = 70;
			}

			if (record.current_weight !== undefined && record.current_weight !== null) {
				currentWeight = record.current_weight;
			} else {
				currentWeight = 70;
			}
			
			exists = true;
		} catch (err: any) {
			if (err.status === 404) {
				exists = false;
				calories = 2000;
				proteins = 150;
				carbs = 200;
				fats = 70;
				fiber = 30;
				weight = 70;
				currentWeight = 70;
			} else {
				saveError = 'Failed to load nutritional goals: ' + err.message;
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleSaveGoals(e: Event) {
		e.preventDefault();
		if (!auth.user?.id) {
			saveError = 'You must be logged in to save goals.';
			return;
		}

		isSaving = true;
		saveError = '';
		saveSuccess = false;

		const data = {
			target_calories: Number(calories),
			target_proteins: Number(proteins),
			target_carbs: Number(carbs),
			target_fats: Number(fats),
			target_fiber: Number(fiber),
			target_weight: Number(weight),
			current_weight: Number(currentWeight)
		};

		try {
			if (exists) {
				await pb.collection('user_stats').update(auth.user.id, data);
			} else {
				await pb.collection('user_stats').create({
					id: auth.user.id,
					...data
				});
				exists = true;
			}
			saveSuccess = true;
			setTimeout(() => {
				saveSuccess = false;
			}, 3000);
		} catch (err: any) {
			saveError = 'Failed to save goals: ' + err.message;
		} finally {
			isSaving = false;
		}
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
	<title>Profile | Food Factor</title>
</svelte:head>

<main class="max-w-6xl mx-auto px-6 py-12">
	<!-- Header -->
	<header class="mb-12">
		<h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-2">Your Profile</h1>
		<p class="text-muted font-medium text-lg">Manage your account, macros, and fitness targets</p>
	</header>

	{#if auth.isValid && auth.user}
		<!-- Asymmetric Grid Layout -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
			
			<!-- Left Column: Personal details & account status -->
			<div class="lg:col-span-1 grid gap-6">
				<div class="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm relative overflow-hidden group">
					<!-- Top decorative pulse circle -->
					<div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[var(--color-calories)]/5 group-hover:scale-110 transition-transform duration-500"></div>
					
					<div class="flex flex-col items-center text-center gap-4 mb-6 relative">
						<div class="w-24 h-24 rounded-2xl bg-[var(--color-calories)] flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-500/10">
							{#if auth.user.email}
								{auth.user.email.charAt(0).toUpperCase()}
							{:else}
								U
							{/if}
						</div>
						<div>
							<h2 class="text-2xl font-bold tracking-tight mb-1">
								{#if auth.user.name}
									{auth.user.name}
								{:else}
									User
								{/if}
							</h2>
							<p class="text-sm text-muted font-semibold">{auth.user.email}</p>
						</div>
					</div>

					<div class="grid gap-3 py-5 border-t border-[var(--border)]">
						<div class="flex justify-between items-center text-sm">
							<span class="text-muted font-medium">Account ID</span>
							<span class="font-mono text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{auth.user.id}</span>
						</div>
						<div class="flex justify-between items-center text-sm">
							<span class="text-muted font-medium">Verified Status</span>
							{#if auth.user.verified}
								<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400">
									<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
									Verified
								</span>
							{:else}
								<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
									<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
									Pending
								</span>
							{/if}
						</div>
					</div>

					<div class="pt-5 border-t border-[var(--border)]">
						<a 
							href="/logout" 
							class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-500 font-bold hover:bg-red-500/5 transition-all text-sm active:scale-[0.98]"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
							Sign Out Session
						</a>
					</div>
				</div>

				<!-- AI Settings Card -->
				<div class="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm relative overflow-hidden group">
					<!-- Decorative purple circle (AI color themed) -->
					<div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[var(--color-fiber)]/5 group-hover:scale-110 transition-transform duration-500"></div>
					
					<div class="relative">
						<div class="flex items-center gap-3 mb-4">
							<div class="w-10 h-10 rounded-xl bg-[var(--color-fiber)]/10 text-[var(--color-fiber)] flex items-center justify-center font-black">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>
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
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
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
										<svg class="w-4 h-4 text-white animate-bounce" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
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
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
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
									<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
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
							<svg class="h-10 w-10 animate-spin text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<p class="text-sm font-bold text-muted">Retrieving nutritional profile...</p>
						</div>
					{:else}
						{#if saveError}
							<div class="mb-6 rounded-xl bg-red-50 dark:bg-red-950/20 p-4 ring-1 ring-inset ring-red-200 dark:ring-red-900/30" role="alert">
								<p class="text-sm font-medium text-red-800 dark:text-red-200">{saveError}</p>
							</div>
						{/if}

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
									<svg class="h-5 w-5 animate-spin text-white dark:text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									<span>Saving changes...</span>
								{:else}
									{#if saveSuccess}
										<svg class="w-5 h-5 text-white animate-bounce" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
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
	{:else}
		<div class="text-center py-20 bg-[var(--surface)] rounded-3xl border border-[var(--border)] border-dashed">
			<h2 class="text-xl font-bold mb-4">Please log in to view your profile</h2>
			<a href="/login" class="px-8 py-3 rounded-xl bg-[var(--fg)] text-[var(--bg)] font-bold">Log In</a>
		</div>
	{/if}
</main>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
</style>
