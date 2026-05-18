<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { store } from '$lib/store.svelte';
	import GoalSlider from '$lib/components/GoalSlider.svelte';

	// Reactive state variables for the onboarding steps
	let currentStep = $state(1);

	// PWA Install Prompt State
	interface BeforeInstallPromptEvent extends Event {
		readonly platforms: string[];
		readonly userChoice: Promise<{
			outcome: 'accepted' | 'dismissed';
			platform: string;
		}>;
		prompt(): Promise<void>;
	}

	let installPrompt = $state<BeforeInstallPromptEvent | null>(null);
	let isStandalone = $state(false);
	let iosInstructionsVisible = $state(false);

	const isIOS = $derived.by(() => {
		if (typeof window === 'undefined') return false;
		return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
	});

	// Step 1: Base Physical Stats
	let sex = $state<'male' | 'female'>('male');
	let age = $state<number | ''>('');
	let height = $state<number | ''>('');
	let currentWeight = $state<number | ''>('');
	let targetWeight = $state<number | ''>('');

	// Step 2: Activity & Weight Goals
	let activityLevel = $state<'sedentary' | 'light' | 'moderate' | 'active'>('moderate');
	let goal = $state<'lose' | 'maintain' | 'gain'>('lose');
	let proteinFocus = $state<'standard' | 'balanced' | 'high'>('balanced');

	// Step 3: Customized baseline targets (set initially by calculation)
	let customProtein = $state(150);
	let customCarbs = $state(200);
	let customFats = $state(65);
	let customFiber = $state(30);

	// Derived calories calculated directly from macronutrient inputs
	const customCalories = $derived(customProtein * 4 + customCarbs * 4 + customFats * 9);

	// Static data structures for options to support clean layouts and unique keys
	interface ActivityOption {
		id: 'sedentary' | 'light' | 'moderate' | 'active';
		label: string;
		desc: string;
		multiplier: number;
		icon: string;
	}

	const activityOptions: ActivityOption[] = [
		{ id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise; desk job', multiplier: 1.2, icon: 'bed' },
		{ id: 'light', label: 'Lightly Active', desc: 'Light exercise or active hobbies 1-3 days/week', multiplier: 1.375, icon: 'directions_walk' },
		{ id: 'moderate', label: 'Moderately Active', desc: 'Moderate workouts or cardio 3-5 days/week', multiplier: 1.55, icon: 'fitness_center' },
		{ id: 'active', label: 'Very Active', desc: 'Heavy sports or physical training 6-7 days/week', multiplier: 1.725, icon: 'bolt' }
	];

	interface GoalOption {
		id: 'lose' | 'maintain' | 'gain';
		label: string;
		desc: string;
		icon: string;
		colorClass: string;
	}

	const goalOptions: GoalOption[] = [
		{ id: 'lose', label: 'Lose Weight (Cut)', desc: 'Focus on fat loss while retaining lean muscle', icon: 'trending_down', colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
		{ id: 'maintain', label: 'Maintain Weight', desc: 'Optimize physical energy & body composition', icon: 'scale', colorClass: 'text-calories bg-calories/10 border-calories/20' },
		{ id: 'gain', label: 'Build Muscle (Bulk)', desc: 'Caloric surplus to support strength and size gains', icon: 'trending_up', colorClass: 'text-protein bg-protein/10 border-protein/20' }
	];

	interface ProteinOption {
		id: 'standard' | 'balanced' | 'high';
		label: string;
		desc: string;
		ratio: number;
	}

	const proteinOptions: ProteinOption[] = [
		{ id: 'standard', label: 'Standard Focus (1.6g / kg)', desc: 'Meets basic clinical guidelines for active lifters', ratio: 1.6 },
		{ id: 'balanced', label: 'Optimal Recovery (2.2g / kg)', desc: 'Gold standard for lifters to protect & build muscle', ratio: 2.2 },
		{ id: 'high', label: 'Elite Density (2.6g / kg)', desc: 'High-satiety focus for deep deficit cuts', ratio: 2.6 }
	];

	// Validation rule computed properties for progressive wizard validation
	const isStep1Valid = $derived(
		age !== '' && age >= 12 && age <= 100 &&
		height !== '' && height >= 100 && height <= 250 &&
		currentWeight !== '' && currentWeight >= 30 && currentWeight <= 300 &&
		targetWeight !== '' && targetWeight >= 30 && targetWeight <= 300
	);

	// Event handler transitions and baseline calculations
	function calculateBaselineTargets() {
		if (!isStep1Valid) return;

		const w = Number(currentWeight);
		const h = Number(height);
		const a = Number(age);

		// Mifflin-St Jeor BMR Equation
		let bmr = 0;
		if (sex === 'male') {
			bmr = 10 * w + 6.25 * h - 5 * a + 5;
		} else {
			bmr = 10 * w + 6.25 * h - 5 * a - 161;
		}

		// Calculate Total Daily Energy Expenditure (TDEE)
		const selectedActivity = activityOptions.find(o => o.id === activityLevel);
		const multiplier = selectedActivity ? selectedActivity.multiplier : 1.55;
		const tdee = bmr * multiplier;

		// Calculate Daily Calories target based on primary fitness goal
		let caloriesTarget = 2000;
		if (goal === 'lose') {
			caloriesTarget = Math.round(tdee - 450);
		} else if (goal === 'gain') {
			caloriesTarget = Math.round(tdee + 300);
		} else {
			caloriesTarget = Math.round(tdee);
		}

		// Enforce safety floor
		if (caloriesTarget < 1200) {
			caloriesTarget = 1200;
		}

		// Macro Calculations
		// 1. Protein based on target weight & selected protein level focus
		const tw = Number(targetWeight);
		const selectedProt = proteinOptions.find(o => o.id === proteinFocus);
		const proteinRatio = selectedProt ? selectedProt.ratio : 2.2;
		customProtein = Math.round(tw * proteinRatio);

		// 2. Fiber: 14g per 1000 calories baseline (minimum 25g, max 60g)
		customFiber = Math.max(25, Math.min(60, Math.round(14 * (caloriesTarget / 1000))));

		// 3. Fats: 25% of total calories budget (1g of fat = 9 calories)
		customFats = Math.round((caloriesTarget * 0.25) / 9);

		// 4. Carbs: Fill the remaining calorie budget (1g of carb = 4 calories)
		const proteinKcal = customProtein * 4;
		const fatsKcal = customFats * 9;
		customCarbs = Math.max(30, Math.round((caloriesTarget - proteinKcal - fatsKcal) / 4));

		currentStep = 3;
	}

	function handleBackStep() {
		if (currentStep > 1) {
			currentStep = currentStep - 1;
		}
	}

	function handleFinishOnboarding() {
		// Save strictly calculated and tweaked targets to browser database via store
		store.updateUserStats({
			target_calories: customCalories,
			target_proteins: customProtein,
			target_carbs: customCarbs,
			target_fats: customFats,
			target_fiber: customFiber,
			target_weight: Number(targetWeight),
			current_weight: Number(currentWeight),
			onboarded: true
		});

		// Skip PWA step if already running inside standalone app
		if (isStandalone) {
			goto('/dashboard');
		} else {
			currentStep = 4;
		}
	}

	async function handleInstallYes() {
		if (installPrompt) {
			await installPrompt.prompt();
			const { outcome } = await installPrompt.userChoice;
			store.updateUserStats({ pwa_prompt_choice: 'yes' });
			installPrompt = null;
			goto('/dashboard');
		} else if (isIOS) {
			iosInstructionsVisible = true;
		} else {
			// fallback/desktop manual install prompt instructions
			iosInstructionsVisible = true;
		}
	}

	function handleInstallNo() {
		store.updateUserStats({ pwa_prompt_choice: 'no' });
		goto('/dashboard');
	}

	function handleInstallLater() {
		store.updateUserStats({ pwa_prompt_choice: 'later' });
		goto('/dashboard');
	}

	onMount(() => {
		isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

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
	<title>Welcome to Calzap | Setup Baseline</title>
	<meta name="description" content="Set up your physical baseline stats and get recommended macro targets instantly in Calzap." />
</svelte:head>

<div class="min-h-screen bg-(--bg) text-(--fg) py-8 px-6 flex flex-col justify-between relative overflow-hidden">
	<!-- Ambient Background Glows -->
	<div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.03)] blur-[120px] pointer-events-none"></div>
	<div class="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[oklch(from_var(--color-protein)_l_c_h/0.02)] blur-[160px] pointer-events-none"></div>

	<!-- Header Brand section -->
	<header class="max-w-xl mx-auto w-full flex flex-col items-center gap-4 text-center z-10 pt-4">
		<div class="flex items-center gap-2 group">
			<div class="w-9 h-9 rounded-xl bg-calories flex items-center justify-center text-white shadow-lg shadow-(--color-calories)/20">
				<span class="material-symbols-outlined text-[20px] select-none font-bold" style="font-variation-settings: 'FILL' 1;">bolt</span>
			</div>
			<span class="font-black text-xl tracking-tight select-none">Calzap</span>
		</div>
		
		<!-- Step Wizard Progress Bar -->
		<div class="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2 relative">
			<div 
				class="h-full bg-calories rounded-full transition-all duration-500 ease-out-quart" 
				style="width: {((currentStep - 1) / (isStandalone ? 2 : 3)) * 100}%"
			></div>
		</div>
		<div class="flex justify-between w-full text-[9px] font-black uppercase tracking-wider text-muted px-1">
			<span class={currentStep >= 1 ? "text-calories" : ""}>1. Profile</span>
			<span class={currentStep >= 2 ? "text-calories" : ""}>2. Goals</span>
			<span class={currentStep >= 3 ? "text-calories" : ""}>3. Baseline</span>
			{#if !isStandalone}
				<span class={currentStep >= 4 ? "text-calories" : ""}>4. Add App</span>
			{/if}
		</div>
	</header>

	<!-- Main Wizard Card content -->
	<main class="grow flex items-center justify-center my-8 z-10">
		<div class="w-full max-w-xl bg-(--surface) border border-(--border) rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
			
			<!-- STEP 1: PHYSICAL PROFILE -->
			{#if currentStep === 1}
				<div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
					<div>
						<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-calories/8 border border-calories/12 text-calories text-[10px] font-black uppercase tracking-wider mb-2">
							Step 1 of 3
						</div>
						<h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">Define Your Body Profile</h1>
						<p class="text-xs sm:text-sm text-muted font-medium mt-1">We'll use these metrics to calculate your custom metabolic baseline.</p>
					</div>

					<div class="pt-4 border-t border-(--border)/40 space-y-6">
						<!-- Sex Selection cards -->
						<div class="space-y-2">
							<span class="text-[10px] font-black uppercase tracking-widest text-muted block">Biological Sex</span>
							<div class="grid grid-cols-2 gap-4">
								<button
									type="button"
									onclick={() => sex = 'male'}
									class="p-4.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer {sex === 'male' ? 'border-calories bg-calories/5 shadow-[0_0_12px_var(--color-calories)/8]' : 'border-(--border) bg-zinc-50/20 dark:bg-zinc-800/5 hover:border-zinc-350'}"
								>
									<span class="material-symbols-outlined text-[24px] {sex === 'male' ? 'text-calories' : 'text-zinc-400'}" style="font-variation-settings: 'FILL' 1;">male</span>
									<span class="font-black text-sm {sex === 'male' ? 'text-calories' : 'text-zinc-500'}">Male</span>
								</button>
								<button
									type="button"
									onclick={() => sex = 'female'}
									class="p-4.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer {sex === 'female' ? 'border-calories bg-calories/5 shadow-[0_0_12px_var(--color-calories)/8]' : 'border-(--border) bg-zinc-50/20 dark:bg-zinc-800/5 hover:border-zinc-350'}"
								>
									<span class="material-symbols-outlined text-[24px] {sex === 'female' ? 'text-calories' : 'text-zinc-400'}" style="font-variation-settings: 'FILL' 1;">female</span>
									<span class="font-black text-sm {sex === 'female' ? 'text-calories' : 'text-zinc-500'}">Female</span>
								</button>
							</div>
							<p class="text-[9px] text-muted/80 font-semibold italic leading-normal">Used exclusively for BMR calculations according to the Mifflin-St Jeor formula.</p>
						</div>

						<!-- Numerical details grid -->
						<div class="grid grid-cols-2 gap-4">
							<!-- Age Input Card -->
							<div class="bg-zinc-50/50 dark:bg-zinc-800/10 p-4 rounded-xl border border-(--border) focus-within:ring-2 focus-within:ring-calories/40 transition-all duration-200 space-y-1">
								<label for="age" class="text-[10px] font-black uppercase tracking-wider text-muted block">Age</label>
								<div class="flex items-baseline gap-1">
									<input 
										type="number" 
										id="age"
										bind:value={age} 
										min="12"
										max="100"
										placeholder="24"
										required
										class="w-full bg-transparent text-xl font-black focus:outline-none text-zinc-900 dark:text-zinc-100" 
									/>
									<span class="text-xs font-bold text-muted">years</span>
								</div>
							</div>

							<!-- Height Input Card -->
							<div class="bg-zinc-50/50 dark:bg-zinc-800/10 p-4 rounded-xl border border-(--border) focus-within:ring-2 focus-within:ring-calories/40 transition-all duration-200 space-y-1">
								<label for="height" class="text-[10px] font-black uppercase tracking-wider text-muted block">Height</label>
								<div class="flex items-baseline gap-1">
									<input 
										type="number" 
										id="height"
										bind:value={height} 
										min="100"
										max="250"
										placeholder="175"
										required
										class="w-full bg-transparent text-xl font-black focus:outline-none text-zinc-900 dark:text-zinc-100" 
									/>
									<span class="text-xs font-bold text-muted">cm</span>
								</div>
							</div>

							<!-- Current Weight Card -->
							<div class="bg-zinc-50/50 dark:bg-zinc-800/10 p-4 rounded-xl border border-(--border) focus-within:ring-2 focus-within:ring-calories/40 transition-all duration-200 space-y-1">
								<label for="current_weight" class="text-[10px] font-black uppercase tracking-wider text-muted block">Current Weight</label>
								<div class="flex items-baseline gap-1">
									<input 
										type="number" 
										id="current_weight"
										bind:value={currentWeight} 
										step="0.1"
										min="30"
										max="300"
										placeholder="78.5"
										required
										class="w-full bg-transparent text-xl font-black focus:outline-none text-zinc-900 dark:text-zinc-100" 
									/>
									<span class="text-xs font-bold text-muted">kg</span>
								</div>
							</div>

							<!-- Target Weight Card -->
							<div class="bg-zinc-50/50 dark:bg-zinc-800/10 p-4 rounded-xl border border-(--border) focus-within:ring-2 focus-within:ring-calories/40 transition-all duration-200 space-y-1">
								<label for="target_weight" class="text-[10px] font-black uppercase tracking-wider text-muted block">Target Weight</label>
								<div class="flex items-baseline gap-1">
									<input 
										type="number" 
										id="target_weight"
										bind:value={targetWeight} 
										step="0.1"
										min="30"
										max="300"
										placeholder="75.0"
										required
										class="w-full bg-transparent text-xl font-black focus:outline-none text-zinc-900 dark:text-zinc-100" 
									/>
									<span class="text-xs font-bold text-muted">kg</span>
								</div>
							</div>
						</div>
					</div>

					<div class="pt-6 border-t border-(--border)/40 flex justify-end">
						<button
							type="button"
							onclick={() => currentStep = 2}
							disabled={!isStep1Valid}
							class="px-6.5 py-3.5 rounded-xl bg-calories text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-md shadow-calories/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
						>
							<span>Next: Focus Goals</span>
							<span class="material-symbols-outlined text-[16px] leading-none select-none">arrow_forward</span>
						</button>
					</div>
				</div>
			{/if}

			<!-- STEP 2: ACTIVITY & WEIGHT GOALS -->
			{#if currentStep === 2}
				<div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
					<div>
						<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-calories/8 border border-calories/12 text-calories text-[10px] font-black uppercase tracking-wider mb-2">
							Step 2 of 3
						</div>
						<h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">Goals & Focus</h1>
						<p class="text-xs sm:text-sm text-muted font-medium mt-1">Specify how active you are and your body focus target.</p>
					</div>

					<div class="pt-4 border-t border-(--border)/40 space-y-6">
						<!-- Activity Level cards -->
						<div class="space-y-2">
							<span class="text-[10px] font-black uppercase tracking-widest text-muted block">Daily Activity Level</span>
							<div class="flex flex-col gap-2.5">
								{#each activityOptions as opt (opt.id)}
									<button
										type="button"
										onclick={() => activityLevel = opt.id}
										class="w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3.5 hover:scale-[1.005] active:scale-[0.995] cursor-pointer {activityLevel === opt.id ? 'border-calories bg-calories/5 shadow-[0_0_12px_var(--color-calories)/6]' : 'border-(--border) bg-zinc-50/20 dark:bg-zinc-800/5 hover:border-zinc-350'}"
									>
										<div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 {activityLevel === opt.id ? 'bg-calories/15 text-calories' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'}">
											<span class="material-symbols-outlined text-[20px] select-none">{opt.icon}</span>
										</div>
										<div class="flex flex-col gap-0.5">
											<span class="font-extrabold text-sm {activityLevel === opt.id ? 'text-calories' : 'text-zinc-900 dark:text-zinc-100'}">{opt.label}</span>
											<span class="text-[11px] text-muted leading-tight font-medium">{opt.desc}</span>
										</div>
									</button>
								{/each}
							</div>
						</div>

						<!-- Goal options selection -->
						<div class="space-y-2">
							<span class="text-[10px] font-black uppercase tracking-widest text-muted block">Fitness Goal Direction</span>
							<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
								{#each goalOptions as opt (opt.id)}
									<button
										type="button"
										onclick={() => goal = opt.id}
										class="p-4 rounded-2xl border text-center transition-all flex flex-col justify-between items-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer {goal === opt.id ? opt.colorClass + ' shadow-sm' : 'border-(--border) bg-zinc-50/20 dark:bg-zinc-800/5 hover:border-zinc-350'}"
									>
										<span class="material-symbols-outlined text-[22px] {goal === opt.id ? '' : 'text-zinc-400'}">{opt.icon}</span>
										<div class="flex flex-col items-center">
											<span class="font-extrabold text-xs {goal === opt.id ? '' : 'text-zinc-900 dark:text-zinc-50'}">{opt.label}</span>
											<span class="text-[9px] text-muted mt-1 leading-normal font-semibold max-w-[15ch]">{opt.desc}</span>
										</div>
									</button>
								{/each}
							</div>
						</div>

						<!-- Protein target options -->
						<div class="space-y-2">
							<span class="text-[10px] font-black uppercase tracking-widest text-muted block">Protein Focus Level</span>
							<div class="flex flex-col gap-2">
								{#each proteinOptions as opt (opt.id)}
									<button
										type="button"
										onclick={() => proteinFocus = opt.id}
										class="w-full px-4 py-3 rounded-xl border text-left transition-all flex items-center justify-between hover:scale-[1.005] active:scale-[0.995] cursor-pointer {proteinFocus === opt.id ? 'border-protein bg-protein/5 shadow-[0_0_8px_var(--color-protein)/6]' : 'border-(--border) bg-zinc-50/20 dark:bg-zinc-800/5 hover:border-zinc-350'}"
									>
										<div class="flex flex-col">
											<span class="font-bold text-xs {proteinFocus === opt.id ? 'text-protein' : 'text-zinc-900 dark:text-zinc-100'}">{opt.label}</span>
											<span class="text-[10px] text-muted font-medium mt-0.5">{opt.desc}</span>
										</div>
										{#if proteinFocus === opt.id}
											<span class="material-symbols-outlined text-[16px] text-protein font-bold">check</span>
										{/if}
									</button>
								{/each}
							</div>
						</div>
					</div>

					<div class="pt-6 border-t border-(--border)/40 flex items-center justify-between">
						<button
							type="button"
							onclick={handleBackStep}
							class="px-5 py-3.5 rounded-xl border border-zinc-500/20 text-zinc-500 font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-500/5 active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer"
						>
							<span class="material-symbols-outlined text-[16px] leading-none select-none">arrow_back</span>
							<span>Back</span>
						</button>

						<button
							type="button"
							onclick={calculateBaselineTargets}
							class="px-6.5 py-3.5 rounded-xl bg-calories text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-md shadow-calories/20 cursor-pointer"
						>
							<span>Calculate Baseline</span>
							<span class="material-symbols-outlined text-[16px] leading-none select-none">calculate</span>
						</button>
					</div>
				</div>
			{/if}

			<!-- STEP 3: CUSTOMIZE METRIC BASELINE -->
			{#if currentStep === 3}
				<div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
					<div>
						<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-calories/8 border border-calories/12 text-calories text-[10px] font-black uppercase tracking-wider mb-2">
							Step 3 of 3
						</div>
						<h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">Review & Tweak Baseline</h1>
						<p class="text-xs sm:text-sm text-muted font-medium mt-1">Here is your customized baseline recommendation. Fine-tune it to fit your exact targets.</p>
					</div>

					<div class="pt-4 border-t border-(--border)/40 space-y-6">
						<!-- Big Energy Target Card -->
						<div 
							class="p-5.5 rounded-2xl border transition-all duration-300 relative overflow-hidden text-center"
							style="background-color: oklch(from var(--color-calories) l c h / 0.04); border-color: oklch(from var(--color-calories) l c h / 0.15);"
						>
							<div class="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.08)] blur-2xl pointer-events-none"></div>

							<div class="flex items-baseline justify-center gap-2 relative z-10">
								<span class="text-5xl font-black tracking-tighter tabular-nums transition-all text-calories">
									{customCalories}
								</span>
								<span class="text-sm font-bold text-muted">kcal budget</span>
							</div>
							<p class="text-[9.5px] font-black text-muted/65 uppercase tracking-widest relative z-10 mt-1.5 leading-normal">
								Calculated baseline daily energy limit based on Mifflin-St Jeor equation.
							</p>
						</div>

						<!-- Macronutrient Goal Sliders Grid -->
						<div class="space-y-5 bg-zinc-50/50 dark:bg-zinc-800/10 p-5 rounded-2xl border border-(--border) shrink-0">
							<GoalSlider
								id="onboard_protein"
								label="Protein Target"
								bind:value={customProtein}
								min={50}
								max={250}
								step={1}
								unit="g"
								colorClass="protein"
								kcalFactor={4}
							/>

							<GoalSlider
								id="onboard_carbs"
								label="Carbohydrates Target"
								bind:value={customCarbs}
								min={50}
								max={400}
								step={1}
								unit="g"
								colorClass="carbs"
								kcalFactor={4}
							/>

							<GoalSlider
								id="onboard_fats"
								label="Fats Target"
								bind:value={customFats}
								min={20}
								max={150}
								step={1}
								unit="g"
								colorClass="fats"
								kcalFactor={9}
							/>

							<GoalSlider
								id="onboard_fiber"
								label="Dietary Fiber Target"
								bind:value={customFiber}
								min={10}
								max={60}
								step={1}
								unit="g"
								colorClass="fiber"
							/>
						</div>
					</div>

					<div class="pt-6 border-t border-(--border)/40 flex items-center justify-between">
						<button
							type="button"
							onclick={handleBackStep}
							class="px-5 py-3.5 rounded-xl border border-zinc-500/20 text-zinc-500 font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-500/5 active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer"
						>
							<span class="material-symbols-outlined text-[16px] leading-none select-none">arrow_back</span>
							<span>Back</span>
						</button>

						<button
							type="button"
							onclick={handleFinishOnboarding}
							class="px-7 py-3.5 rounded-xl bg-calories text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-calories/25 cursor-pointer"
						>
							<span>{isStandalone ? 'Launch Calzap' : 'Next: Add App'}</span>
							<span class="material-symbols-outlined text-[18px] leading-none select-none font-bold">
								{isStandalone ? 'rocket_launch' : 'arrow_forward'}
							</span>
						</button>
					</div>
				</div>
			{/if}

			<!-- STEP 4: PWA APP INSTALL PROMPT -->
			{#if currentStep === 4}
				<div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
					<div class="text-center space-y-2">
						<div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-calories/10 text-calories mb-2 shadow-[0_0_15px_oklch(from_var(--color-calories)_l_c_h/0.08)]">
							<span class="material-symbols-outlined text-[32px] select-none leading-none font-bold">install_mobile</span>
						</div>
						<h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">Install Calzap App?</h1>
						<p class="text-xs sm:text-sm text-muted font-medium max-w-sm mx-auto">
							Install Calzap to your device for 1-tap tracking, a dedicated full screen window, and 100% offline support.
						</p>
					</div>

					<div class="pt-4 border-t border-(--border)/40 space-y-4">
						{#if iosInstructionsVisible}
							<div class="p-5 rounded-2xl border border-calories/15 bg-calories/5 space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
								<h3 class="text-xs font-black uppercase tracking-wider text-calories flex items-center gap-1.5">
									<span class="material-symbols-outlined text-[16px]">info</span>
									{#if isIOS}Safari Installation Instructions{:else}Add App to Home Screen{/if}
								</h3>
								<ol class="text-xs text-zinc-650 dark:text-zinc-300 font-semibold space-y-2.5 list-decimal list-inside leading-relaxed">
									{#if isIOS}
										<li>Tap the Safari share button <span class="material-symbols-outlined text-[15px] inline-block align-middle font-bold text-calories">ios_share</span> at the bottom of your browser screen.</li>
										<li>Scroll down and select <strong class="text-zinc-950 dark:text-zinc-50">Add to Home Screen</strong> <span class="material-symbols-outlined text-[15px] inline-block align-middle font-bold text-calories">add_box</span>.</li>
										<li>Tap <strong class="text-calories">Add</strong> in the top-right corner to complete.</li>
									{:else}
										<li>Open your browser's options menu (usually three vertical dots <span class="font-black text-calories">⋮</span> in the top-right or address bar).</li>
										<li>Select <strong class="text-zinc-950 dark:text-zinc-50">Install App</strong> or <strong class="text-zinc-950 dark:text-zinc-50">Add to Home screen</strong> <span class="material-symbols-outlined text-[15px] inline-block align-middle font-bold text-calories">install_mobile</span>.</li>
										<li>Follow the browser prompt to complete.</li>
									{/if}
								</ol>
							</div>
						{/if}

						<div class="flex flex-col gap-3">
							{#if iosInstructionsVisible}
								<button
									type="button"
									onclick={handleFinishOnboarding}
									class="w-full py-3.5 rounded-xl bg-calories text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-calories/25 cursor-pointer"
								>
									<span>Open Dashboard</span>
									<span class="material-symbols-outlined text-[18px] leading-none select-none font-bold">rocket_launch</span>
								</button>
							{:else}
								<button
									type="button"
									onclick={handleInstallYes}
									class="w-full py-3.5 rounded-xl bg-calories text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-calories/25 cursor-pointer"
								>
									<span class="material-symbols-outlined text-[18px] leading-none select-none font-bold">download</span>
									<span>Yes, Install Calzap</span>
								</button>
							{/if}

							<div class="grid grid-cols-2 gap-3">
								<button
									type="button"
									onclick={handleInstallLater}
									class="py-3 rounded-xl border border-zinc-500/20 text-zinc-500 font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-500/5 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
								>
									<span class="material-symbols-outlined text-[15px] leading-none select-none font-bold">schedule</span>
									<span>Ask Me Later</span>
								</button>

								<button
									type="button"
									onclick={handleInstallNo}
									class="py-3 rounded-xl border border-zinc-500/20 text-zinc-500 font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-500/5 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
								>
									<span class="material-symbols-outlined text-[15px] leading-none select-none font-bold">cancel</span>
									<span>No, Don't Ask</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</main>

	<!-- Footer note -->
	<footer class="max-w-xl mx-auto w-full text-center text-[10px] text-muted font-semibold z-10 leading-normal pb-4">
		Calzap is a completely offline, 100% private application. All baseline data entered is stored securely inside your browser's local memory and is never transmitted to any servers.
	</footer>
</div>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
</style>
