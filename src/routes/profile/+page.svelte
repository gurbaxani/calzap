<script lang="ts">
	import { store } from '$lib/store.svelte';
	import { onMount } from 'svelte';
	import GoalSlider from '$lib/components/GoalSlider.svelte';

	interface BeforeInstallPromptEvent extends Event {
		readonly platforms: string[];
		readonly userChoice: Promise<{
			outcome: 'accepted' | 'dismissed';
			platform: string;
		}>;
		prompt(): Promise<void>;
	}

	let installPrompt = $state<BeforeInstallPromptEvent | null>(null);

	let calories = $state(2000);
	let weight = $state(70);
	let currentWeight = $state(70);

	let dietStyle = $state<'balanced' | 'high_protein' | 'low_carb' | 'custom'>('balanced');
	let showAdvanced = $state(false);

	let customProteins = $state(150);
	let customCarbs = $state(200);
	let customFats = $state(70);
	let customFiber = $state(30);

	let isLoading = $state(false);

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

	// Automatic derived macros based on diet focus & calories
	let computedProteins = $derived.by(() => {
		if (dietStyle === 'custom') return customProteins;
		if (dietStyle === 'high_protein') return Math.round((calories * 0.40) / 4);
		if (dietStyle === 'low_carb') return Math.round((calories * 0.35) / 4);
		return Math.round((calories * 0.30) / 4); // balanced
	});

	let computedCarbs = $derived.by(() => {
		if (dietStyle === 'custom') return customCarbs;
		if (dietStyle === 'high_protein') return Math.round((calories * 0.35) / 4);
		if (dietStyle === 'low_carb') return Math.round((calories * 0.15) / 4);
		return Math.round((calories * 0.40) / 4); // balanced
	});

	let computedFats = $derived.by(() => {
		if (dietStyle === 'custom') return customFats;
		if (dietStyle === 'high_protein') return Math.round((calories * 0.25) / 9);
		if (dietStyle === 'low_carb') return Math.round((calories * 0.50) / 9);
		return Math.round((calories * 0.30) / 9); // balanced
	});

	let computedFiber = $derived.by(() => {
		if (dietStyle === 'custom') return customFiber;
		return Math.round((calories / 1000) * 14);
	});

	let weightDifference = $derived(Number((currentWeight - weight).toFixed(1)));

	function determineDietStyle(p: number, c: number, f: number) {
		const total = (p * 4) + (c * 4) + (f * 9);
		if (total <= 0) return 'balanced';
		const proteinRatio = (p * 4) / total;
		const carbsRatio = (c * 4) / total;
		if (carbsRatio <= 0.22) return 'low_carb';
		if (proteinRatio >= 0.35) return 'high_protein';
		return 'balanced';
	}

	function fetchGoals() {
		calories = store.userStats.target_calories || 2000;
		const p = store.userStats.target_proteins || 150;
		const c = store.userStats.target_carbs || 200;
		const f = store.userStats.target_fats || 70;
		const fib = store.userStats.target_fiber || 30;

		customProteins = p;
		customCarbs = c;
		customFats = f;
		customFiber = fib;

		weight = store.userStats.target_weight || 70;
		currentWeight = store.userStats.current_weight || 70;

		dietStyle = determineDietStyle(p, c, f);
		if (dietStyle === 'custom') {
			showAdvanced = true;
		}
	}

	// Seamless autosaving for numerical goals & weight parameters
	function autosaveGoals() {
		store.updateUserStats({
			target_calories: Number(calories),
			target_proteins: Number(computedProteins),
			target_carbs: Number(computedCarbs),
			target_fats: Number(computedFats),
			target_fiber: Number(computedFiber),
			target_weight: Number(weight),
			current_weight: Number(currentWeight)
		});
	}

	// Autosaving the API Key when user blurs focus or hits Enter
	function autosaveKey() {
		const cleanKey = apiKey.trim();
		store.updateUserStats({ google_ai_studio_api_key: cleanKey });
		isKeySaved = cleanKey !== '';
		keySaveSuccess = true;
		keyDeleteSuccess = false;
		setTimeout(() => {
			keySaveSuccess = false;
		}, 3000);
	}

	function handleDeleteKey() {
		store.updateUserStats({ google_ai_studio_api_key: '' });
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

	onMount(async () => {
		await store.loadIndexedDB();
		fetchGoals();
		
		if (store.userStats.google_ai_studio_api_key) {
			apiKey = store.userStats.google_ai_studio_api_key;
			isKeySaved = true;
		}

		// PWA install handler
		const handleBeforeInstall = (e: Event) => {
			e.preventDefault();
			installPrompt = e as BeforeInstallPromptEvent;
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
		};
	});
</script>

<svelte:head>
	<title>Profile | Calzap</title>
</svelte:head>

<main class="max-w-6xl mx-auto px-6 py-12">
	<!-- Header -->
	<header class="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 reveal-card" style="--delay: 0;">
		<div>
			<h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-2">Your Profile</h1>
			<p class="text-muted font-medium text-lg">Manage your account, macros, and fitness targets</p>
		</div>
		<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 self-start sm:self-center select-none shadow-[0_0_8px_rgba(16,185,129,0.05)]">
			<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
			Autosaved to Browser Storage
		</div>
	</header>

	<!-- Asymmetric Grid Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
		
		<!-- Left Column: Goals Form divided into Sequential Cards (Delightful Navigation) -->
		<div class="lg:col-span-2 flex flex-col gap-6">
			{#if isLoading}
				<div class="p-8 rounded-3xl bg-(--surface) border border-(--border) shadow-sm flex flex-col items-center justify-center py-20 gap-4 reveal-card" style="--delay: 1;">
					<span class="material-symbols-outlined animate-spin text-[40px] leading-none select-none text-zinc-500">sync</span>
					<p class="text-sm font-bold text-muted">Retrieving nutritional profile...</p>
				</div>
			{:else}
				<div class="flex flex-col gap-6">
					
					<!-- Section 1: Calorie Target -->
					<div class="p-8 rounded-3xl bg-(--surface) border border-(--border) shadow-sm space-y-6 reveal-card" style="--delay: 1;">
						<div class="flex items-start gap-4">
							<div class="w-10 h-10 rounded-2xl bg-calories/10 text-calories flex items-center justify-center font-black select-none shrink-0">
								1
							</div>
							<div>
								<h2 class="text-2xl font-bold tracking-tight mb-1">Calorie Budget</h2>
								<p class="text-muted font-medium text-sm">Define your daily baseline energy target</p>
							</div>
						</div>

						<div class="pt-4 border-t border-(--border)/40">
							<GoalSlider
								id="target_calories"
								label="Daily Calorie Budget"
								bind:value={calories}
								min={1000}
								max={5000}
								step={50}
								unit="kcal"
								colorClass="calories"
								description="Your daily energy limit"
								onchange={autosaveGoals}
							/>
						</div>
					</div>

					<!-- Section 2: Nutrition Focus & Automated Balance -->
					<div class="p-8 rounded-3xl bg-(--surface) border border-(--border) shadow-sm space-y-6 reveal-card" style="--delay: 1.5;">
						<div class="flex items-start gap-4">
							<div class="w-10 h-10 rounded-2xl bg-protein/10 text-protein flex items-center justify-center font-black select-none shrink-0">
								2
							</div>
							<div>
								<h2 class="text-2xl font-bold tracking-tight mb-1">Nutrition Focus</h2>
								<p class="text-muted font-medium text-sm">Choose an approach to automatically balance your macronutrients</p>
							</div>
						</div>

						<div class="pt-6 border-t border-(--border)/40 space-y-6">
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<!-- Balanced Focus -->
								<button
									type="button"
									onclick={() => {
										dietStyle = 'balanced';
										showAdvanced = false;
										customProteins = Math.round((calories * 0.30) / 4);
										customCarbs = Math.round((calories * 0.40) / 4);
										customFats = Math.round((calories * 0.30) / 9);
										customFiber = Math.round((calories / 1000) * 14);
										autosaveGoals();
									}}
									class="p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-calories {dietStyle === 'balanced' ? 'border-calories bg-calories/5 shadow-[0_0_12px_var(--color-calories)/10]' : 'border-(--border) bg-zinc-50/20 dark:bg-zinc-800/5 hover:border-zinc-350'}"
								>
									<div>
										<span class="material-symbols-outlined text-[24px] mb-2 block text-calories" style="font-variation-settings: 'FILL' 1;">scale</span>
										<h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-50">Balanced</h4>
										<p class="text-[11px] text-muted mt-1 leading-normal">Standard balance of lean proteins, complex carbs, and healthy fats.</p>
									</div>
									<div class="mt-4 flex items-center justify-between text-[10px] font-black text-calories uppercase tracking-wider">
										<span>30% P / 40% C / 30% F</span>
										{#if dietStyle === 'balanced'}
											<span class="material-symbols-outlined text-[16px] leading-none">check_circle</span>
										{/if}
									</div>
								</button>

								<!-- High Protein Focus -->
								<button
									type="button"
									onclick={() => {
										dietStyle = 'high_protein';
										showAdvanced = false;
										customProteins = Math.round((calories * 0.40) / 4);
										customCarbs = Math.round((calories * 0.35) / 4);
										customFats = Math.round((calories * 0.25) / 9);
										customFiber = Math.round((calories / 1000) * 14);
										autosaveGoals();
									}}
									class="p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-protein {dietStyle === 'high_protein' ? 'border-protein bg-protein/5 shadow-[0_0_12px_var(--color-protein)/10]' : 'border-(--border) bg-zinc-50/20 dark:bg-zinc-800/5 hover:border-zinc-350'}"
								>
									<div>
										<span class="material-symbols-outlined text-[24px] mb-2 block text-protein" style="font-variation-settings: 'FILL' 1;">fitness_center</span>
										<h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-50">High Protein</h4>
										<p class="text-[11px] text-muted mt-1 leading-normal">Higher protein ratio to support active recovery, muscle tone, and fullness.</p>
									</div>
									<div class="mt-4 flex items-center justify-between text-[10px] font-black text-protein uppercase tracking-wider">
										<span>40% P / 35% C / 25% F</span>
										{#if dietStyle === 'high_protein'}
											<span class="material-symbols-outlined text-[16px] leading-none">check_circle</span>
										{/if}
									</div>
								</button>

								<!-- Low Carb Focus -->
								<button
									type="button"
									onclick={() => {
										dietStyle = 'low_carb';
										showAdvanced = false;
										customProteins = Math.round((calories * 0.35) / 4);
										customCarbs = Math.round((calories * 0.15) / 4);
										customFats = Math.round((calories * 0.50) / 9);
										customFiber = Math.round((calories / 1000) * 14);
										autosaveGoals();
									}}
									class="p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-carbs {dietStyle === 'low_carb' ? 'border-carbs bg-carbs/5 shadow-[0_0_12px_var(--color-carbs)/10]' : 'border-(--border) bg-zinc-50/20 dark:bg-zinc-800/5 hover:border-zinc-350'}"
								>
									<div>
										<span class="material-symbols-outlined text-[24px] mb-2 block text-carbs" style="font-variation-settings: 'FILL' 1;">grass</span>
										<h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-50">Carb Conscious</h4>
										<p class="text-[11px] text-muted mt-1 leading-normal">Low carb focus. Ideal for energy stability and carbohydrate awareness.</p>
									</div>
									<div class="mt-4 flex items-center justify-between text-[10px] font-black text-carbs uppercase tracking-wider">
										<span>35% P / 15% C / 50% F</span>
										{#if dietStyle === 'low_carb'}
											<span class="material-symbols-outlined text-[16px] leading-none">check_circle</span>
										{/if}
									</div>
								</button>
							</div>

							<!-- Derived Macro Summary Card -->
							<div class="bg-zinc-50/50 dark:bg-zinc-800/10 p-5 rounded-2xl border border-(--border) space-y-4">
								<div class="flex justify-between items-center text-xs font-bold text-muted">
									<span class="flex items-center gap-1.5">
										<span class="material-symbols-outlined text-[16px] text-calories" style="font-variation-settings: 'FILL' 1;">analytics</span>
										Your Derived Daily Targets
									</span>
									<span class="font-black tabular-nums">{calories} kcal</span>
								</div>

								<div class="grid grid-cols-3 gap-4 border-t border-(--border)/40 pt-4">
									<!-- Protein target -->
									<div class="text-center space-y-1">
										<span class="text-[10px] font-black uppercase tracking-wider text-muted block">Protein</span>
										<span class="text-xl font-extrabold text-protein tabular-nums">{computedProteins}<span class="text-xs font-bold text-muted ml-0.5">g</span></span>
										<span class="text-[9px] font-bold text-muted block">({computedProteins * 4} kcal)</span>
									</div>

									<!-- Carbs target -->
									<div class="text-center space-y-1">
										<span class="text-[10px] font-black uppercase tracking-wider text-muted block">Carbohydrates</span>
										<span class="text-xl font-extrabold text-carbs tabular-nums">{computedCarbs}<span class="text-xs font-bold text-muted ml-0.5">g</span></span>
										<span class="text-[9px] font-bold text-muted block">({computedCarbs * 4} kcal)</span>
									</div>

									<!-- Fats target -->
									<div class="text-center space-y-1">
										<span class="text-[10px] font-black uppercase tracking-wider text-muted block">Fats</span>
										<span class="text-xl font-extrabold text-fats tabular-nums">{computedFats}<span class="text-xs font-bold text-muted ml-0.5">g</span></span>
										<span class="text-[9px] font-bold text-muted block">({computedFats * 9} kcal)</span>
									</div>
								</div>
							</div>

							<!-- Progressive Disclosure Custom Macro Toggle -->
							<div class="flex justify-start">
								<button
									type="button"
									onclick={() => {
										showAdvanced = !showAdvanced;
										if (showAdvanced) {
											dietStyle = 'custom';
										} else {
											dietStyle = 'balanced';
											customProteins = Math.round((calories * 0.30) / 4);
											customCarbs = Math.round((calories * 0.40) / 4);
											customFats = Math.round((calories * 0.30) / 9);
											customFiber = Math.round((calories / 1000) * 14);
										}
										autosaveGoals();
									}}
									class="text-xs font-bold flex items-center gap-1.5 transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none"
								>
									<span class="material-symbols-outlined text-[16px]">
										{showAdvanced ? 'tune' : 'settings'}
									</span>
									{showAdvanced ? 'Use presets instead' : 'Custom Nutrition Targets (Advanced)'}
								</button>
							</div>

							<!-- Collapsible Advanced Sliders -->
							{#if showAdvanced}
								<div class="pt-6 border-t border-(--border)/40 space-y-6">
									<div>
										<h3 class="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Custom targets</h3>
										<p class="text-xs text-muted">Manually adjust specific macronutrient limits</p>
									</div>

									<GoalSlider
										id="target_proteins"
										label="Protein"
										bind:value={customProteins}
										min={0}
										max={300}
										step={1}
										unit="g"
										colorClass="protein"
										kcalFactor={4}
										onchange={autosaveGoals}
									/>

									<GoalSlider
										id="target_carbs"
										label="Carbohydrates"
										bind:value={customCarbs}
										min={0}
										max={500}
										step={1}
										unit="g"
										colorClass="carbs"
										kcalFactor={4}
										onchange={autosaveGoals}
									/>

									<GoalSlider
										id="target_fats"
										label="Fats"
										bind:value={customFats}
										min={0}
										max={200}
										step={1}
										unit="g"
										colorClass="fats"
										kcalFactor={9}
										onchange={autosaveGoals}
									/>

									<GoalSlider
										id="target_fiber"
										label="Dietary Fiber"
										bind:value={customFiber}
										min={0}
										max={100}
										step={1}
										unit="g"
										colorClass="fiber"
										onchange={autosaveGoals}
									/>
								</div>
							{/if}
						</div>
					</div>

					<!-- Section 3: Weight Profile Tracker -->
					<div class="p-8 rounded-3xl bg-(--surface) border border-(--border) shadow-sm space-y-6 reveal-card" style="--delay: 2;">
						<div class="flex items-start gap-4">
							<div class="w-10 h-10 rounded-2xl bg-fats/10 text-fats flex items-center justify-center font-black select-none shrink-0">
								3
							</div>
							<div>
								<h2 class="text-2xl font-bold tracking-tight mb-1">Weight Profile</h2>
								<p class="text-muted font-medium text-sm">Update your starting weight and goal targets</p>
							</div>
						</div>

						<div class="pt-6 border-t border-(--border)/40 space-y-6">
							<div class="grid grid-cols-2 gap-4">
								<!-- Current Weight Card -->
								<div class="bg-zinc-50/50 dark:bg-zinc-800/10 p-4 rounded-xl border border-(--border) focus-within:ring-2 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600 transition-all duration-200 space-y-1">
									<label for="current_weight" class="text-[10px] font-black uppercase tracking-wider text-muted block">Current Weight</label>
									<div class="flex items-baseline gap-1">
										<input 
											type="number" 
											id="current_weight"
											bind:value={currentWeight} 
											step="0.1" 
											min="0"
											required
											oninput={autosaveGoals}
											class="w-full bg-transparent text-xl font-bold focus:outline-none text-zinc-900 dark:text-zinc-100" 
										/>
										<span class="text-xs font-bold text-muted">kg</span>
									</div>
								</div>

								<!-- Goal Weight Card -->
								<div class="bg-zinc-50/50 dark:bg-zinc-800/10 p-4 rounded-xl border border-(--border) focus-within:ring-2 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600 transition-all duration-200 space-y-1">
									<label for="target_weight" class="text-[10px] font-black uppercase tracking-wider text-muted block">Goal Weight</label>
									<div class="flex items-baseline gap-1">
										<input 
											type="number" 
											id="target_weight"
											bind:value={weight} 
											step="0.1" 
											min="0"
											required
											oninput={autosaveGoals}
											class="w-full bg-transparent text-xl font-bold focus:outline-none text-zinc-900 dark:text-zinc-100" 
										/>
										<span class="text-xs font-bold text-muted">kg</span>
									</div>
								</div>
							</div>

							<!-- Encased Friendly Summary Progress sentence -->
							<div class="text-xs font-semibold text-center text-muted py-2.5 px-3 bg-zinc-50/50 dark:bg-zinc-800/10 rounded-xl flex items-center justify-center gap-1.5">
								{#if weightDifference === 0}
									<span>🎉 Congratulations! You have reached your weight goal!</span>
								{:else}
									{#if weightDifference > 0}
										<span>Target status: Lose <strong class="text-zinc-950 dark:text-zinc-50">{weightDifference} kg</strong> to hit your goal. You can do this!</span>
									{:else}
										<span>Target status: Gain <strong class="text-zinc-950 dark:text-zinc-50">{Math.abs(weightDifference)} kg</strong> to hit your goal. You can do this!</span>
									{/if}
								{/if}
							</div>
						</div>
					</div>

				</div>
			{/if}
		</div>

		<!-- Right Column: Personal details, backup, and AI settings (Secondary Focus) -->
		<div class="lg:col-span-1 grid gap-6">
			<!-- PWA Installation Card -->
			{#if installPrompt}
				<div class="p-8 rounded-3xl bg-(--surface) border border-calories/25 shadow-lg relative overflow-hidden group reveal-card" style="--delay: 2.1; background-color: oklch(from var(--color-calories) l c h / 0.03);">
					<!-- Top decorative pulse circle -->
					<div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-calories/8 group-hover:scale-110 transition-transform duration-500"></div>
					
					<div class="relative">
						<div class="flex items-center gap-3 mb-4">
							<div class="w-10 h-10 rounded-xl bg-calories/10 text-calories flex items-center justify-center font-black">
								<span class="material-symbols-outlined text-[20px] select-none leading-none font-bold">install_mobile</span>
							</div>
							<div>
								<h2 class="text-xl font-bold tracking-tight">App Installation</h2>
								<p class="text-xs text-muted font-semibold">Install Calzap to your device</p>
							</div>
						</div>

						<p class="text-xs text-muted mb-5 leading-relaxed">
							Install Calzap to your homescreen for lightning-fast, 1-tap logging. Works 100% offline at the gym, on a flight, or off the grid!
						</p>

						<div class="pt-5 border-t border-(--border)/40">
							<button 
								type="button"
								onclick={async () => {
									if (installPrompt) {
										await installPrompt.prompt();
										const { outcome } = await installPrompt.userChoice;
										if (outcome === 'accepted') {
											installPrompt = null;
										}
									}
								}}
								class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-calories text-white font-black hover:scale-[1.02] active:scale-[0.98] transition-all text-sm shadow-md shadow-calories/25 cursor-pointer"
							>
								<span class="material-symbols-outlined text-[18px] select-none leading-none font-bold">download</span>
								Install Calzap (Free)
							</button>
						</div>
					</div>
				</div>
			{/if}

			<!-- Data Management Card -->
			<div class="p-8 rounded-3xl bg-(--surface) border border-(--border) shadow-sm relative overflow-hidden group reveal-card" style="--delay: 2.3;">
				<!-- Top decorative pulse circle -->
				<div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-calories/5 group-hover:scale-110 transition-transform duration-500"></div>
				
				<div class="relative">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-10 h-10 rounded-xl bg-calories/10 text-calories flex items-center justify-center font-black">
							<span class="material-symbols-outlined text-[20px] select-none leading-none font-bold">database</span>
						</div>
						<div>
							<h2 class="text-xl font-bold tracking-tight">Data Management</h2>
							<p class="text-xs text-muted font-semibold">Import, export, and backup logs</p>
						</div>
					</div>

					<p class="text-xs text-muted mb-5 leading-relaxed">
						All your nutritional records are stored offline directly in your browser's local database. Use the options below to backup or export your stats.
					</p>

					<div class="pt-5 border-t border-(--border) flex flex-col gap-3">
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
			</div>

			<!-- AI Settings Card -->
			<div class="p-8 rounded-3xl bg-(--surface) border border-(--border) shadow-sm relative overflow-hidden group reveal-card" style="--delay: 2.6;">
				<!-- Decorative purple circle (AI color themed) -->
				<div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-fiber/5 group-hover:scale-110 transition-transform duration-500"></div>
				
				<div class="relative">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-10 h-10 rounded-xl bg-fiber/10 text-fiber flex items-center justify-center font-black">
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

					<div class="space-y-4">
						<div class="space-y-2">
							<label for="ai_api_key" class="text-xs font-black uppercase tracking-widest text-fiber block">
								AI Studio API Key
							</label>
							<div class="flex gap-2">
								<div class="relative flex-1 flex items-center bg-zinc-100/50 dark:bg-zinc-800/20 rounded-xl border border-(--border) focus-within:ring-2 focus-within:ring-fiber/50 dark:focus-within:ring-fiber/40 transition-all duration-200">
									<input
										id="ai_api_key"
										type={inputType}
										bind:value={apiKey}
										onchange={autosaveKey}
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
								<button
									type="button"
									onclick={autosaveKey}
									class="px-4 py-3 rounded-xl bg-fiber text-white text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm shadow-fiber/25"
								>
									<span class="material-symbols-outlined text-[16px] select-none leading-none font-bold">save</span>
									<span>Save</span>
								</button>
							</div>
						</div>

						<div class="flex flex-col gap-2">
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

						{#if keySaveSuccess}
							<p class="text-center text-xs font-bold text-emerald-500 animate-pulse mt-1">✓ Saved instantly!</p>
						{/if}

						{#if keyDeleteSuccess}
							<p class="text-center text-xs font-bold text-rose-500 animate-pulse mt-1">API Key deleted from local storage</p>
						{/if}

						<div class="pt-3 border-t border-(--border) text-center">
							<a
								href="https://aistudio.google.com/"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1 text-[11px] font-bold text-fiber hover:underline"
							>
								Get a free API Key from Google AI Studio
								<span class="material-symbols-outlined text-[10px] select-none leading-none font-bold">open_in_new</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>
</main>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}

	@keyframes revealUp {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.reveal-card {
		opacity: 0;
		animation: revealUp 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: calc(var(--delay, 0) * 80ms);
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal-card {
			opacity: 0;
			animation: fadeIn 300ms ease-out forwards;
			animation-delay: 0ms !important;
		}
		@keyframes fadeIn {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
	}
</style>
