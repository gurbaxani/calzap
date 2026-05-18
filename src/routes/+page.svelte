<script lang="ts">
	import { auth } from "$lib/user.svelte";

	// Interactive widget type definitions and reactive state
	interface DemoFood {
		id: string;
		name: string;
		calories: number;
		protein: number;
		carbs: number;
		fats: number;
		fiber: number;
	}

	let demoLogs = $state<DemoFood[]>([]);
	let idCounter = $state(0);

	const demoTotals = $derived.by(() => {
		let cal = 0;
		let prot = 0;
		let carb = 0;
		let fat = 0;
		let fib = 0;
		for (const item of demoLogs) {
			cal = cal + item.calories;
			prot = prot + item.protein;
			carb = carb + item.carbs;
			fat = fat + item.fats;
			fib = fib + item.fiber;
		}
		return {
			calories: cal,
			protein: prot,
			carbs: carb,
			fats: fat,
			fiber: fib,
		};
	});

	const demoRemaining = $derived(2500 - demoTotals.calories);

	function addDemoFood(food: Omit<DemoFood, "id">) {
		idCounter = idCounter + 1;
		demoLogs.push({
			id: "demo-" + idCounter,
			...food,
		});
	}

	function clearDemoLogs() {
		demoLogs = [];
	}

	// Preset foods for the interactive widget
	const presetWhey = {
		name: "Double Scoop Whey",
		calories: 240,
		protein: 50,
		carbs: 3,
		fats: 2,
		fiber: 0,
	};

	const presetOats = {
		name: "Large Bowl of Oats",
		calories: 380,
		protein: 13,
		carbs: 66,
		fats: 7,
		fiber: 10,
	};

	const presetAlmonds = {
		name: "Handful of Almonds",
		calories: 160,
		protein: 6,
		carbs: 6,
		fats: 14,
		fiber: 4,
	};

	// FAQ interactive accordion state
	let activeFaqIndex = $state<number | null>(null);

	function toggleFaq(index: number) {
		if (activeFaqIndex === index) {
			activeFaqIndex = null;
		} else {
			activeFaqIndex = index;
		}
	}

	const faqs = [
		{
			question: "Is Fuel really free of ads and social feeds?",
			answer: "Yes, absolutely. I believe that utility tools should remain utility tools. Fuel contains zero social elements, zero newsfeeds, and zero advertisements. Every pixel and line of code is dedicated solely to helping you track your nutrition as efficiently as possible.",
		},
		{
			question: "How does the 10-second logging system work?",
			answer: "It is built on optimization. When you open the app, you can search for a food or tap any of your recent items on the dashboard to log them instantly. There are no confirmation popups, no loading spinner delays, and no complex menus—just immediate data entries.",
		},
		{
			question:
				"Can I set different nutrient targets for my bulking and cutting phases?",
			answer: "Yes, you have complete control over your goals. From your profile tab, you can customize your target metrics for calories, protein, carbohydrates, fats, and fiber at any time to seamlessly match your evolving physical requirements and training phases.",
		},
		{
			question: "Is my tracking data secure and private?",
			answer: "Your privacy is my priority. I employ strict data isolation protocols: every single database query is filtered securely by your unique, authenticated user ID to prevent any data leakage. Your data belongs solely to you.",
		},
		{
			question: "Does the app support offline usage or slow connections?",
			answer: "Fuel is engineered with lightweight code and client-side reactive states. The Svelte 5 structure ensures that inputs are registered instantaneously with zero lag, providing snappy visual feedback even when you are on a weak gym Wi-Fi connection.",
		},
		{
			question: "How is the daily calorie budget calculated?",
			answer: "The app dynamically tracks your remaining calories by subtracting your logged food values from your daily target. A simple tap on the main calorie dashboard toggles between showing how many calories you have left to eat versus your total consumed amount.",
		},
	];

	// Derive the CTA path based on user login status to avoid ternary operators
	const ctaPath = $derived.by(() => {
		if (auth.isValid) {
			return "/dashboard";
		} else {
			return "/signup";
		}
	});
</script>

<svelte:head>
	<title>Fuel | Reach Your Peak Physical Potential</title>
	<meta
		name="description"
		content="Fuel is the zero-bloat, distraction-free macro tracker that cuts through the noise so you can log your fuel, hit your targets, and get back to your workout."
	/>
</svelte:head>

<div
	class="min-h-screen flex flex-col overflow-x-hidden relative bg-(--bg) text-(--fg)"
>
	<!-- Ambient Background Glows -->
	<div
		class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(from_var(--color-calories)_l_c_h_/_0.03)] blur-[120px] pointer-events-none"
	></div>
	<div
		class="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[oklch(from_var(--color-protein)_l_c_h_/_0.02)] blur-[160px] pointer-events-none"
	></div>

	<!-- Main Container -->
	<main
		class="flex-grow w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-24 md:gap-32"
	>
		<!-- ================= SECTION 1: HERO & HOOK ================= -->
		<section
			class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-4 md:pt-8"
			id="hero-section"
		>
			<!-- Hero Left: Content -->
			<div
				class="lg:col-span-7 flex flex-col items-start text-left gap-6 md:gap-8"
			>
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[oklch(from_var(--color-calories)_l_c_h_/_0.08)] text-[var(--color-calories)] text-[11px] font-extrabold uppercase tracking-widest border border-[oklch(from_var(--color-calories)_l_c_h_/_0.15)] select-none"
				>
					<span class="relative flex h-2 w-2">
						<span
							class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-calories)] opacity-75"
						></span>
						<span
							class="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-calories)]"
						></span>
					</span>
					Performance Grade Utility
				</div>

				<h1
					class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-2xl text-balance"
				>
					Reach Your Peak Physical Potential in <span
						class="text-[var(--color-calories)]"
						>10 Snappy Seconds</span
					> a Day.
				</h1>

				<p
					class="text-lg sm:text-xl text-muted max-w-[62ch] font-medium leading-relaxed"
				>
					Fuel is the zero-bloat, distraction-free macro tracker that
					cuts through the noise so you can log your fuel, hit your
					targets, and get back to your workout.
				</p>

				<div class="w-full sm:w-auto">
					<a
						id="hero-cta-button"
						href={ctaPath}
						class="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-(--fg) text-(--bg) font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 group"
					>
						<span>Get Started Instantly</span>
						<span
							class="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-1 select-none text-[20px] leading-none"
							>arrow_forward</span
						>
					</a>
				</div>

				<!-- Hero Results Bullet Points -->
				<div
					class="grid sm:grid-cols-3 gap-6 pt-6 border-t border-[var(--border)] w-full mt-2"
				>
					<div class="flex flex-col gap-1.5">
						<div
							class="text-[var(--color-protein)] font-black text-sm uppercase tracking-wider flex items-center gap-1.5"
						>
							<span
								class="material-symbols-outlined text-[18px] leading-none"
								>done_all</span
							>
							100% Adherence
						</div>
						<p
							class="text-xs text-muted leading-relaxed font-semibold"
						>
							Real-time remaining calorie and macro feedback helps
							you hit your daily goals down to the single gram.
						</p>
					</div>
					<div class="flex flex-col gap-1.5">
						<div
							class="text-[var(--color-carbs)] font-black text-sm uppercase tracking-wider flex items-center gap-1.5"
						>
							<span
								class="material-symbols-outlined text-[18px] leading-none"
								>bolt</span
							>
							Zero Fatigue
						</div>
						<p
							class="text-xs text-muted leading-relaxed font-semibold"
						>
							High-frequency search and 1-tap quick logs ensure
							you never abandon your food tracking routine.
						</p>
					</div>
					<div class="flex flex-col gap-1.5">
						<div
							class="text-[var(--color-fats)] font-black text-sm uppercase tracking-wider flex items-center gap-1.5"
						>
							<span
								class="material-symbols-outlined text-[18px] leading-none"
								>do_not_disturb_on</span
							>
							Clutter-Free
						</div>
						<p
							class="text-xs text-muted leading-relaxed font-semibold"
						>
							No social feeds, no sponsored ads, and no
							popups—just high-fidelity data that respects your
							time.
						</p>
					</div>
				</div>
			</div>

			<!-- Hero Right: Interactive Dashboard Widget Mockup -->
			<div
				class="lg:col-span-5 flex justify-center w-full"
				id="hero-widget-container"
			>
				<div
					class="w-full max-w-[380px] bg-(--surface) border border-[var(--border)] rounded-[2.5rem] p-6.5 shadow-2xl relative overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
				>
					<!-- Interactive Demo Header -->
					<div
						class="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]"
					>
						<span
							class="text-[10px] font-black tracking-widest text-muted uppercase"
							>Interactive Demo Dashboard</span
						>
						<button
							type="button"
							id="demo-reset-logs"
							onclick={clearDemoLogs}
							class="text-[9px] font-black tracking-wider text-rose-500 hover:text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 px-2 py-1 rounded-lg uppercase transition-colors"
						>
							Reset Log
						</button>
					</div>

					<!-- Calorie Ring Widget -->
					<div
						class="flex flex-col items-center gap-1 text-center mb-6"
					>
						<div class="flex items-baseline justify-center gap-2">
							<span
								class="text-5xl font-black tracking-tighter tabular-nums transition-all text-[var(--color-calories)]"
							>
								{demoRemaining}
							</span>
							<span class="text-sm font-bold text-muted"
								>kcal left</span
							>
						</div>
						<div
							class="text-[9px] font-bold text-muted/60 uppercase tracking-widest"
						>
							Daily Budget: 2500 kcal • Consumed: {demoTotals.calories}
							kcal
						</div>
					</div>

					<!-- Custom High-Contrast Segmented Macro Grid -->
					<div class="grid grid-cols-2 gap-3.5 mb-7">
						<!-- Protein Card -->
						<div
							class="p-3 rounded-2xl bg-[oklch(from_var(--color-protein)_l_c_h_/_0.03)] border border-[oklch(from_var(--color-protein)_l_c_h_/_0.08)] flex flex-col gap-1.5"
						>
							<div class="flex justify-between items-baseline">
								<span
									class="text-xs font-black uppercase text-[var(--color-protein)]"
									>Protein</span
								>
								<span
									class="text-[10px] font-bold text-muted tabular-nums"
									>{demoTotals.protein}g / 180g</span
								>
							</div>
							<div
								class="h-2 w-full rounded-full bg-[oklch(from_var(--color-protein)_l_c_h_/_0.08)] overflow-hidden"
							>
								<div
									class="h-full bg-[var(--color-protein)] rounded-full transition-all duration-500 ease-out-quart"
									style="width: {Math.min(
										100,
										(demoTotals.protein / 180) * 100,
									)}%"
								></div>
							</div>
						</div>

						<!-- Carbs Card -->
						<div
							class="p-3 rounded-2xl bg-[oklch(from_var(--color-carbs)_l_c_h_/_0.03)] border border-[oklch(from_var(--color-carbs)_l_c_h_/_0.08)] flex flex-col gap-1.5"
						>
							<div class="flex justify-between items-baseline">
								<span
									class="text-xs font-black uppercase text-[var(--color-carbs)]"
									>Carbs</span
								>
								<span
									class="text-[10px] font-bold text-muted tabular-nums"
									>{demoTotals.carbs}g / 250g</span
								>
							</div>
							<div
								class="h-2 w-full rounded-full bg-[oklch(from_var(--color-carbs)_l_c_h_/_0.08)] overflow-hidden"
							>
								<div
									class="h-full bg-[var(--color-carbs)] rounded-full transition-all duration-500 ease-out-quart"
									style="width: {Math.min(
										100,
										(demoTotals.carbs / 250) * 100,
									)}%"
								></div>
							</div>
						</div>

						<!-- Fats Card -->
						<div
							class="p-3 rounded-2xl bg-[oklch(from_var(--color-fats)_l_c_h_/_0.03)] border border-[oklch(from_var(--color-fats)_l_c_h_/_0.08)] flex flex-col gap-1.5"
						>
							<div class="flex justify-between items-baseline">
								<span
									class="text-xs font-black uppercase text-[var(--color-fats)]"
									>Fats</span
								>
								<span
									class="text-[10px] font-bold text-muted tabular-nums"
									>{demoTotals.fats}g / 70g</span
								>
							</div>
							<div
								class="h-2 w-full rounded-full bg-[oklch(from_var(--color-fats)_l_c_h_/_0.08)] overflow-hidden"
							>
								<div
									class="h-full bg-[var(--color-fats)] rounded-full transition-all duration-500 ease-out-quart"
									style="width: {Math.min(
										100,
										(demoTotals.fats / 70) * 100,
									)}%"
								></div>
							</div>
						</div>

						<!-- Fiber Card -->
						<div
							class="p-3 rounded-2xl bg-[oklch(from_var(--color-fiber)_l_c_h_/_0.03)] border border-[oklch(from_var(--color-fiber)_l_c_h_/_0.08)] flex flex-col gap-1.5"
						>
							<div class="flex justify-between items-baseline">
								<span
									class="text-xs font-black uppercase text-[var(--color-fiber)]"
									>Fiber</span
								>
								<span
									class="text-[10px] font-bold text-muted tabular-nums"
									>{demoTotals.fiber}g / 35g</span
								>
							</div>
							<div
								class="h-2 w-full rounded-full bg-[oklch(from_var(--color-fiber)_l_c_h_/_0.08)] overflow-hidden"
							>
								<div
									class="h-full bg-[var(--color-fiber)] rounded-full transition-all duration-500 ease-out-quart"
									style="width: {Math.min(
										100,
										(demoTotals.fiber / 35) * 100,
									)}%"
								></div>
							</div>
						</div>
					</div>

					<!-- 1-Tap Logging Presets Panel -->
					<div class="flex flex-col gap-3">
						<h4
							class="text-[10px] font-black uppercase tracking-wider text-muted"
						>
							Test 1-Tap Log Options:
						</h4>
						<div class="flex flex-col gap-2">
							<button
								type="button"
								id="demo-add-whey"
								onclick={() => addDemoFood(presetWhey)}
								class="w-full text-left p-3 rounded-xl border border-[var(--border)] hover:border-zinc-300 dark:hover:border-zinc-700 bg-[oklch(from_var(--border)_l_c_h_/_0.15)] flex justify-between items-center transition-all active:scale-[0.98] group"
							>
								<div class="flex flex-col">
									<span class="font-bold text-xs"
										>Double Scoop Whey</span
									>
									<span class="text-[9px] text-muted mt-0.5"
										>240 kcal • 50g P • 3g C • 2g F</span
									>
								</div>
								<span
									class="material-symbols-outlined text-[16px] text-[var(--color-calories)] group-hover:translate-x-0.5 transition-transform select-none"
									>add</span
								>
							</button>

							<button
								type="button"
								id="demo-add-oats"
								onclick={() => addDemoFood(presetOats)}
								class="w-full text-left p-3 rounded-xl border border-[var(--border)] hover:border-zinc-300 dark:hover:border-zinc-700 bg-[oklch(from_var(--border)_l_c_h_/_0.15)] flex justify-between items-center transition-all active:scale-[0.98] group"
							>
								<div class="flex flex-col">
									<span class="font-bold text-xs"
										>Large Bowl of Oats</span
									>
									<span class="text-[9px] text-muted mt-0.5"
										>380 kcal • 13g P • 66g C • 7g F • 10g
										Fib</span
									>
								</div>
								<span
									class="material-symbols-outlined text-[16px] text-[var(--color-calories)] group-hover:translate-x-0.5 transition-transform select-none"
									>add</span
								>
							</button>

							<button
								type="button"
								id="demo-add-almonds"
								onclick={() => addDemoFood(presetAlmonds)}
								class="w-full text-left p-3 rounded-xl border border-[var(--border)] hover:border-zinc-300 dark:hover:border-zinc-700 bg-[oklch(from_var(--border)_l_c_h_/_0.15)] flex justify-between items-center transition-all active:scale-[0.98] group"
							>
								<div class="flex flex-col">
									<span class="font-bold text-xs"
										>Handful of Almonds</span
									>
									<span class="text-[9px] text-muted mt-0.5"
										>160 kcal • 6g P • 6g C • 14g F • 4g Fib</span
									>
								</div>
								<span
									class="material-symbols-outlined text-[16px] text-[var(--color-calories)] group-hover:translate-x-0.5 transition-transform select-none"
									>add</span
								>
							</button>
						</div>
					</div>

					<!-- Visual Confirmation Logged List inside Mockup -->
					{#if demoLogs.length > 0}
						<div
							class="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--border)] max-h-[140px] overflow-y-auto"
						>
							<h5
								class="text-[9px] font-black uppercase tracking-wider text-muted"
							>
								Currently Logged ({demoLogs.length}):
							</h5>
							{#each demoLogs as log (log.id)}
								<div
									class="flex justify-between items-center text-xs py-1 border-b border-zinc-100 dark:border-zinc-900"
								>
									<span
										class="font-bold truncate max-w-[160px]"
										>{log.name}</span
									>
									<span
										class="text-muted text-[10px] tabular-nums font-bold"
										>+{log.calories} kcal</span
									>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Horizontal Divider 1 -->
		<div
			class="w-full flex items-center justify-center pointer-events-none select-none"
		>
			<hr class="w-full border-[var(--border)]" />
			<span
				class="absolute px-4 bg-(--bg) text-muted font-extrabold text-[10px] tracking-widest uppercase"
				>SECTION 01 / 06</span
			>
		</div>

		<!-- ================= SECTION 2: PROBLEM & SOLUTION ================= -->
		<section
			class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start"
			id="problem-solution-section"
		>
			<!-- Left: Big Typography Section Header -->
			<div class="lg:col-span-5 flex flex-col items-start gap-4">
				<div
					class="text-[var(--color-protein)] font-black text-xs uppercase tracking-widest select-none"
				>
					The Friction Problem
				</div>
				<h2
					class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-balance"
				>
					Why Traditional Macro Trackers Fail Gym-Goers
				</h2>
			</div>

			<!-- Right: Deep Dive Analysis paragraphs (Asymmetric layout) -->
			<div
				class="lg:col-span-7 flex flex-col gap-6 text-muted text-base sm:text-lg leading-relaxed font-medium max-w-[65ch]"
			>
				<p>
					Tracking your macros shouldn't feel like a part-time job.
					Most fitness apps on the market today have lost their way,
					morphing from simple logs into noisy social networks packed
					with bloated feeds, intrusive ads, and pop-up paywalls.
					Instead of quickly entering your lunch, you are forced to
					watch video ads, dismiss upgrade screens, and scroll past
					influencers.
				</p>
				<p>
					Imagine standing in the kitchen after a grueling workout,
					exhausted and hungry, only to spend five minutes fighting
					with a sluggish UI just to log a scoop of whey protein. Or
					worse, being hit with a paywall when trying to input a
					custom meal or view your basic fiber intake. This log
					fatigue builds up day after day, eventually causing you to
					abandon tracking altogether and stall your physical
					progress.
				</p>
				<p class="text-(--fg) font-bold">
					Fuel changes the game by returning to absolute utility. I
					built a hyper-focused, lightning-fast tracking interface
					specifically for gym-goers, lifters, and busy professionals.
					With no social feeds, zero ads, and an ultra-responsive,
					mobile-first design, you can search, log, and analyze your
					five core metrics (Calories, Protein, Carbs, Fats, and
					Fiber) in under 10 seconds. It is the raw utility you need
					to power your performance.
				</p>
			</div>
		</section>

		<!-- Horizontal Divider 2 -->
		<div
			class="w-full flex items-center justify-center pointer-events-none select-none"
		>
			<hr class="w-full border-[var(--border)]" />
			<span
				class="absolute px-4 bg-(--bg) text-muted font-extrabold text-[10px] tracking-widest uppercase"
				>SECTION 02 / 06</span
			>
		</div>

		<!-- ================= SECTION 3: BENEFITS ================= -->
		<section class="flex flex-col gap-12 md:gap-16" id="benefits-section">
			<!-- Header -->
			<div class="flex flex-col items-start gap-4">
				<div
					class="text-[var(--color-carbs)] font-black text-xs uppercase tracking-widest select-none"
				>
					Engineered for Success
				</div>
				<h2
					class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
				>
					Engineered for Peak Performance
				</h2>
			</div>

			<!-- Dynamic Asymmetric Benefits Flow (No side stripes, no cards in cards, premium layout) -->
			<div class="grid md:grid-cols-3 gap-8 md:gap-10">
				<!-- Benefit 1 -->
				<div
					class="flex flex-col items-start gap-5 p-6.5 rounded-3xl border border-[var(--border)] bg-(--surface)/40 hover:bg-(--surface) transition-colors"
				>
					<div
						class="w-12 h-12 rounded-2xl bg-[oklch(from_var(--color-protein)_l_c_h_/_0.08)] flex items-center justify-center text-[var(--color-protein)]"
					>
						<span
							class="material-symbols-outlined text-[24px] select-none"
							>analytics</span
						>
					</div>
					<div class="flex flex-col gap-2">
						<h3 class="text-xl font-bold tracking-tight">
							Master Your Macros Without the Mental Fatigue
						</h3>
						<p
							class="text-sm text-muted leading-relaxed font-semibold"
						>
							An instant, high-contrast, dual-mode calorie ring
							and segmented grid that visualizes your protein,
							carbs, fats, and fiber intake in one glance.
						</p>
					</div>
				</div>

				<!-- Benefit 2 -->
				<div
					class="flex flex-col items-start gap-5 p-6.5 rounded-3xl border border-[var(--border)] bg-(--surface)/40 hover:bg-(--surface) transition-colors"
				>
					<div
						class="w-12 h-12 rounded-2xl bg-[oklch(from_var(--color-calories)_l_c_h_/_0.08)] flex items-center justify-center text-[var(--color-calories)]"
					>
						<span
							class="material-symbols-outlined text-[24px] select-none"
							>bolt</span
						>
					</div>
					<div class="flex flex-col gap-2">
						<h3 class="text-xl font-bold tracking-tight">
							Log Meals in the Blink of an Eye
						</h3>
						<p
							class="text-sm text-muted leading-relaxed font-semibold"
						>
							An ultra-responsive global search log paired with a
							1-tap recent meal logging system that instantly
							copies recurring meals.
						</p>
					</div>
				</div>

				<!-- Benefit 3 -->
				<div
					class="flex flex-col items-start gap-5 p-6.5 rounded-3xl border border-[var(--border)] bg-(--surface)/40 hover:bg-(--surface) transition-colors"
				>
					<div
						class="w-12 h-12 rounded-2xl bg-[oklch(from_var(--color-fiber)_l_c_h_/_0.08)] flex items-center justify-center text-[var(--color-fiber)]"
					>
						<span
							class="material-symbols-outlined text-[24px] select-none"
							>recipe</span
						>
					</div>
					<div class="flex flex-col gap-2">
						<h3 class="text-xl font-bold tracking-tight">
							Create Custom Recipes and Foods Effortlessly
						</h3>
						<p
							class="text-sm text-muted leading-relaxed font-semibold"
						>
							A streamlined 3-step wizard that lets you name your
							foods, define custom portions, and assign exact
							macronutrient distributions to build a personalized
							library.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Horizontal Divider 3 -->
		<div
			class="w-full flex items-center justify-center pointer-events-none select-none"
		>
			<hr class="w-full border-[var(--border)]" />
			<span
				class="absolute px-4 bg-(--bg) text-muted font-extrabold text-[10px] tracking-widest uppercase"
				>SECTION 03 / 06</span
			>
		</div>

		<!-- ================= SECTION 4: LIST OF FEATURES ================= -->
		<section class="flex flex-col gap-12 md:gap-16" id="features-section">
			<!-- Header -->
			<div class="flex flex-col items-start gap-4">
				<div
					class="text-[var(--color-fats)] font-black text-xs uppercase tracking-widest select-none"
				>
					Complete Feature Set
				</div>
				<h2
					class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
				>
					Every Feature Built for Speed and Utility
				</h2>
			</div>

			<!-- Uniquely Structured Non-Identical Feature List (asymmetrical, categorized to prevent monoculture card grids) -->
			<div class="grid md:grid-cols-3 gap-8 md:gap-12">
				<!-- Column 1: Logging Speed -->
				<div class="flex flex-col gap-6 md:gap-8">
					<h3
						class="text-xs font-black uppercase tracking-wider text-[var(--color-calories)] pb-3 border-b border-[var(--border)]"
					>
						01. Logging Speed
					</h3>
					<div class="flex flex-col gap-6">
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F1</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									10-Second Search & Quick-Log
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Locate any food instantly or input a custom
									meal description to update your dashboard in
									real-time.
								</p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F2</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									1-Tap Recent Food Duplicator
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Instantly re-log your regular meals from the
									dashboard with a single tap, completely
									bypassing search.
								</p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F3</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									3-Step Custom Food Creator
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									A logical, friction-free wizard to add
									custom grocery items, meals, or supplements
									to your personal database.
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Column 2: Dashboard Visualization -->
				<div class="flex flex-col gap-6 md:gap-8">
					<h3
						class="text-xs font-black uppercase tracking-wider text-[var(--color-protein)] pb-3 border-b border-[var(--border)]"
					>
						02. Data & Analytics
					</h3>
					<div class="flex flex-col gap-6">
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F4</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									5-Core Nutrient Tracking
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Visual progress indicators for Calories,
									Protein, Carbs, Fats, and Fiber to keep your
									nutrition balanced.
								</p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F5</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									Interactive Calorie Toggle
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									One-tap toggle to switch the dashboard view
									between remaining calorie allowance and
									total consumed calories.
								</p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F6</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									Segmented Date Navigation
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Effortlessly flip back and forth between
									dates to review past fuel logs and plan your
									future intake.
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Column 3: Customization & Security -->
				<div class="flex flex-col gap-6 md:gap-8">
					<h3
						class="text-xs font-black uppercase tracking-wider text-[var(--color-fiber)] pb-3 border-b border-[var(--border)]"
					>
						03. Control & Sync
					</h3>
					<div class="flex flex-col gap-6">
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F7</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									Custom Caloric & Macro Targets
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Set your unique daily nutritional targets to
									match your exact cutting, bulking, or
									body-recomposition phases.
								</p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F8</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									Secure Cloud Sync & Isolation
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Robust PocketBase infrastructure that
									ensures your data is private, secured, and
									accessible on any device.
								</p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F9</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									Automatic Dual-Theme Styling
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Premium responsive CSS variables with
									support for beautiful light and dark modes
									tailored for dawn cardio or midnight feeds.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Horizontal Divider 4 -->
		<div
			class="w-full flex items-center justify-center pointer-events-none select-none"
		>
			<hr class="w-full border-[var(--border)]" />
			<span
				class="absolute px-4 bg-(--bg) text-muted font-extrabold text-[10px] tracking-widest uppercase"
				>SECTION 04 / 06</span
			>
		</div>

		<!-- ================= SECTION 5: PRICING (COMMUNITY GOODWILL) ================= -->
		<section
			class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center"
			id="pricing-section"
		>
			<!-- Left Column: Simple typography declaration -->
			<div class="lg:col-span-5 flex flex-col items-start gap-4">
				<div
					class="text-[var(--color-calories)] font-black text-xs uppercase tracking-widest select-none"
				>
					Absolute Freedom
				</div>
				<h2
					class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-balance"
				>
					A Premium Tool That Costs Zero Dollars.
				</h2>
				<p
					class="text-sm text-muted font-semibold leading-relaxed max-w-[36ch] mt-2"
				>
					I believe high-fidelity performance utility should be
					accessible to everyone—without corporate greed,
					subscriptions, or strings attached.
				</p>
			</div>

			<!-- Right Column: Asymmetric, premium focus presentation (No duplicate card grid) -->
			<div
				class="lg:col-span-7 p-8 md:p-10 rounded-[2.5rem] border border-[var(--border)] bg-[oklch(from_var(--color-calories)_l_c_h_/_0.015)] relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 group"
			>
				<div
					class="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[oklch(from_var(--color-calories)_l_c_h_/_0.025)] blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none"
				></div>

				<div class="flex flex-col gap-4 max-w-[40ch]">
					<div
						class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[oklch(from_var(--color-calories)_l_c_h_/_0.08)] text-[var(--color-calories)] text-[10px] font-black uppercase tracking-wider border border-[oklch(from_var(--color-calories)_l_c_h_/_0.15)] select-none self-start"
					>
						100% Free Forever
					</div>
					<h3 class="text-2xl font-black tracking-tight">
						Just for the Good of People
					</h3>
					<p class="text-sm text-muted leading-relaxed font-semibold">
						There are no hidden in-app purchases, no premium
						features locked behind paywalls, and no tracking scripts.
						Fuel is completely open-source under the AGPL-3.0 license—I
						built it strictly to help lifters and health-conscious
						individuals track their nutrition at maximum velocity.
					</p>
				</div>

				<div
					class="flex flex-col items-start gap-1 p-5 rounded-2xl border border-[var(--border)] bg-(--surface) shadow-lg shadow-black/5 min-w-[160px] self-stretch justify-center text-center sm:text-left"
				>
					<div
						class="text-[9px] font-black uppercase tracking-wider text-muted mb-1 w-full text-center sm:text-left"
					>
						Monthly Cost
					</div>
					<div
						class="text-4xl font-black tracking-tighter text-[var(--color-calories)] w-full text-center sm:text-left tabular-nums"
					>
						$0.00
					</div>
					<div
						class="text-[9px] font-bold text-muted/80 uppercase tracking-widest mt-1 w-full text-center sm:text-left"
					>
						No Strings Attached
					</div>
				</div>
			</div>
		</section>

		<!-- Horizontal Divider 5 -->
		<div
			class="w-full flex items-center justify-center pointer-events-none select-none"
		>
			<hr class="w-full border-[var(--border)]" />
			<span
				class="absolute px-4 bg-(--bg) text-muted font-extrabold text-[10px] tracking-widest uppercase"
				>SECTION 05 / 06</span
			>
		</div>

		<!-- ================= SECTION 5: FAQs ================= -->
		<section
			class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start"
			id="faq-section"
		>
			<!-- FAQ Left Info -->
			<div class="lg:col-span-4 flex flex-col items-start gap-4">
				<div
					class="text-[var(--color-fiber)] font-black text-xs uppercase tracking-widest select-none"
				>
					Clear Answers
				</div>
				<h2
					class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
				>
					FAQs
				</h2>
				<p
					class="text-sm text-muted font-semibold leading-relaxed max-w-[30ch] mt-2"
				>
					Have questions? I've got quick, honest answers about the
					performance, security, and utility of Fuel.
				</p>
			</div>

			<!-- FAQ Right Accordions -->
			<div
				class="lg:col-span-8 flex flex-col border-t border-[var(--border)]"
			>
				{#each faqs as faq, index (faq.question)}
					<div
						class="border-b border-[var(--border)] py-4 sm:py-5 flex flex-col"
					>
						<button
							type="button"
							id="faq-button-{index}"
							onclick={() => toggleFaq(index)}
							class="flex justify-between items-center w-full text-left font-bold text-base sm:text-lg hover:text-[var(--color-calories)] transition-colors focus:outline-hidden group py-1"
						>
							<span class="pr-6">{faq.question}</span>
							<span
								class="material-symbols-outlined text-muted group-hover:text-[var(--color-calories)] transition-all select-none text-[20px] leading-none"
								class:rotate-180={activeFaqIndex === index}
							>
								expand_more
							</span>
						</button>

						{#if activeFaqIndex === index}
							<div
								class="mt-3.5 pr-8 animate-in fade-in slide-in-from-top-1 duration-200"
							>
								<p
									class="text-muted text-sm sm:text-base leading-relaxed font-semibold"
								>
									{faq.answer}
								</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<!-- Horizontal Divider 6 -->
		<div
			class="w-full flex items-center justify-center pointer-events-none select-none"
		>
			<hr class="w-full border-[var(--border)]" />
			<span
				class="absolute px-4 bg-(--bg) text-muted font-extrabold text-[10px] tracking-widest uppercase"
				>SECTION 06 / 06</span
			>
		</div>

		<!-- ================= SECTION 6: SUPER DIRECT CTA ================= -->
		<section
			class="py-12 md:py-20 flex flex-col items-center text-center gap-8 md:gap-10 max-w-4xl mx-auto w-full relative"
			id="bottom-cta-section"
		>
			<!-- Background Glow overlay -->
			<div
				class="absolute inset-0 bg-radial from-[oklch(from_var(--color-calories)_l_c_h_/_0.04)] to-transparent rounded-[3rem] blur-xl pointer-events-none"
			></div>

			<div class="flex flex-col items-center gap-4 z-10">
				<div
					class="text-[var(--color-calories)] font-black text-xs uppercase tracking-widest select-none"
				>
					Instant Activation
				</div>
				<h2
					class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-balance max-w-2xl"
				>
					Ready to Track at the Speed of Light?
				</h2>
			</div>

			<p
				class="text-lg text-muted max-w-[50ch] font-medium leading-relaxed z-10"
			>
				Stop wasting time on ads, menus, and feeds. Sign up in seconds,
				set your personal targets, and begin logging your daily macros
				instantly.
			</p>

			<div class="w-full sm:w-auto z-10">
				<a
					id="bottom-cta-button"
					href={ctaPath}
					class="inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 rounded-2xl bg-(--fg) text-(--bg) font-black text-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/10 hover:shadow-black/25 group"
				>
					<span>Start Logging Your Fuel Now</span>
					<span
						class="material-symbols-outlined ml-2.5 transition-transform group-hover:translate-x-1 select-none text-[22px] leading-none"
						>bolt</span
					>
				</a>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer
		class="py-12 border-t border-[var(--border)] text-center bg-(--surface)/20 relative z-10"
	>
		<div
			class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-bold text-muted"
		>
			<div class="flex flex-col sm:items-start gap-1">
				<p>© {new Date().getFullYear()} Fuel by KH Systems Pvt Ltd.</p>
				<p class="text-[11px] text-muted/70 font-semibold">Licensed under the <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer" class="underline hover:text-(--fg) transition-colors">GNU AGPL v3.0</a>.</p>
			</div>
			<div class="flex items-center gap-6">
				<a href="/login" class="hover:text-(--fg) transition-colors"
					>Log In</a
				>
				<a href="/signup" class="hover:text-(--fg) transition-colors"
					>Sign Up</a
				>
				<a href="/dashboard" class="hover:text-(--fg) transition-colors"
					>Dashboard</a
				>
			</div>
		</div>
	</footer>
</div>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}

	h1,
	h2,
	h3,
	h4 {
		font-family: var(--font-sans);
	}

	.rotate-180 {
		transform: rotate(180deg);
	}

	/* Easing function helper for smooth slider animations */
	.ease-out-quart {
		transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
	}
</style>
