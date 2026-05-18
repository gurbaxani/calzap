<script lang="ts">


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
			question: "Is this actually free, or is there a catch?",
			answer: "It's 100% free. No ads, no popups, no premium upsells. I built this for myself because I was sick of sluggish fitness trackers trying to sell me premium subscriptions just to add a custom food. I'm keeping it free and fast for everyone, no strings attached.",
		},
		{
			question: "How is this faster than other calorie trackers?",
			answer: "By cutting out the junk. When you open Calzap, there is no home feed to load or pop-up warning to dismiss. You search, you select, and you log. Your most frequent foods sit right on your dashboard for a 1-tap quick clone. No spinners, no delays, no nonsense.",
		},
		{
			question: "Can I customize my daily macro targets?",
			answer: "Yes. You can edit your targets for Calories, Protein, Carbs, Fats, and Fiber inside your profile at any time. Whether you're bulking, cutting, or just trying to hit a specific fiber goal, you have full control.",
		},
		{
			question: "Is my data private?",
			answer: "Yes. I don't track your location, harvest your search history, or sell your food habits to advertising networks. Your logs are completely isolated to your authenticated account on a secure cloud database.",
		},
		{
			question: "Does it work on terrible gym Wi-Fi?",
			answer: "Yes. Calzap uses hyper-lightweight code and instant Svelte reactive states. Your inputs register immediately, and the UI doesn't freeze or wait for slow networks to respond. It's built to be fast even in deep basement weight rooms.",
		},
		{
			question: "How does the calorie tracker work?",
			answer: "It's straightforward subtraction. Calzap takes your target and subtracts your logs. Tap the main calorie ring to toggle between 'Remaining' and 'Consumed' calories in a single tap.",
		},
	];

	const ctaPath = "/dashboard";
</script>

<svelte:head>
	<title>Calzap | Log macros in 10 seconds. No bloat.</title>
	<meta
		name="description"
		content="Calzap is a lightning-fast, zero-bloat macro tracker built for lifters. Log your macros in 10 seconds, hit your targets, and get back to the gym."
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
					Zero Bloat. Pure Math.
				</div>

				<h1
					class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-2xl text-balance"
				>
					Log your macros in <span
						class="text-[var(--color-calories)]"
						>10 raw seconds</span
					>. Stop wasting time.
				</h1>

				<p
					class="text-lg sm:text-xl text-muted max-w-[62ch] font-medium leading-relaxed"
				>
					No feeds, no premium upsells, no ads. Calzap is a lightning-fast macro tracker designed to keep your diet mathematically perfect so you can get back to the gym.
				</p>

				<div class="w-full sm:w-auto">
					<a
						id="hero-cta-button"
						href={ctaPath}
						class="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-(--fg) text-(--bg) font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 group"
					>
						<span>Start Logging (Free)</span>
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
							100% Hit Rate
						</div>
						<p
							class="text-xs text-muted leading-relaxed font-semibold"
						>
							Remaining calories and macro bars adjust instantly so you hit your daily targets to the single gram.
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
							Zero Lag
						</div>
						<p
							class="text-xs text-muted leading-relaxed font-semibold"
						>
							Instant search and 1-tap history duplications make it physically impossible to quit logging.
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
							No Social Junk
						</div>
						<p
							class="text-xs text-muted leading-relaxed font-semibold"
						>
							No social feeds, no influence pushers, and no popups. Just pure utility that respects your time.
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
					The Friction Bloat
				</div>
				<h2
					class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-balance"
				>
					Why every other macro tracker sucks.
				</h2>
			</div>

			<!-- Right: Deep Dive Analysis paragraphs (Asymmetric layout) -->
			<div
				class="lg:col-span-7 flex flex-col gap-6 text-muted text-base sm:text-lg leading-relaxed font-medium max-w-[65ch]"
			>
				<p>
					Tracking macros shouldn't feel like a chore. The apps you know have turned into bloatware: noisy social feeds, 30-second video ads, and constant pop-ups trying to upsell you. You just want to log your lunch, but you're forced to dodge upgrade screens and watch fitness influencers instead.
				</p>
				<p>
					Picture standing in the kitchen after a heavy training session, tired and hungry. You spend five minutes fighting a laggy interface just to log a single scoop of whey. Or worse, you get hit with a $12/month paywall just to input a custom meal or see your fiber intake. This annoyance builds up until you eventually quit tracking altogether and lose your gains.
				</p>
				<p class="text-(--fg) font-bold">
					I built Calzap to fix this. It is a completely free, lightning-fast tracker designed for lifters who value their time. No social junk, zero ads, no paywalls. You can search, log, and monitor your five core metrics (Calories, Protein, Carbs, Fats, and Fiber) in under 10 seconds. It's just pure, fast utility to help you hit your numbers.
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
					No Bullshit Features
				</div>
				<h2
					class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
				>
					Track without thinking.
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
							Get your numbers in one glance
						</h3>
						<p
							class="text-sm text-muted leading-relaxed font-semibold"
						>
							A high-contrast calorie ring and macro grid showing your remaining protein, carbs, fats, and fiber instantly. No complex menus needed.
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
							Log in two taps. Literally.
						</h3>
						<p
							class="text-sm text-muted leading-relaxed font-semibold"
						>
							A lightning-fast search box and 1-tap quick logs to copy your recurring meals instantly. Zero load states or delay.
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
							>restaurant</span
						>
					</div>
					<div class="flex flex-col gap-2">
						<h3 class="text-xl font-bold tracking-tight">
							Add custom foods instantly
						</h3>
						<p
							class="text-sm text-muted leading-relaxed font-semibold"
						>
							Define custom foods and meals in five seconds. Enter the weight, drop the macros, save it to your library, and get out.
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
					Zero Fat. All Muscle.
				</div>
				<h2
					class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
				>
					Exactly what you need. Nothing you don't.
				</h2>
			</div>

			<!-- Uniquely Structured Non-Identical Feature List (asymmetrical, categorized to prevent monoculture card grids) -->
			<div class="grid md:grid-cols-3 gap-8 md:gap-12">
				<!-- Column 1: Logging Speed -->
				<div class="flex flex-col gap-6 md:gap-8">
					<h3
						class="text-xs font-black uppercase tracking-wider text-[var(--color-calories)] pb-3 border-b border-[var(--border)]"
					>
						01. Lightning Logging
					</h3>
					<div class="flex flex-col gap-6">
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F1</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									10-Second Quick Log
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Search the library, find your food, enter the weight, and hit save. Done in under 10 seconds.
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
									1-Tap Food Clone
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Log your daily breakfast or chicken-and-rice bowl straight from the history feed in one tap.
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
									5-Second Food Creator
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									No barcode scans or complex wizards. Type the name, input the weight and macros, and save it.
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
						02. Visual Math
					</h3>
					<div class="flex flex-col gap-6">
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F4</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									5 Core Metrics
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Track your Calories, Protein, Carbs, Fats, and Fiber directly on the dashboard. No hidden metrics.
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
									Consumed vs. Remaining
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Tap the calorie ring to switch between remaining allowance and total consumed calories instantly.
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
									Frictionless History
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Swipe or tap to go back in time to review past days or pre-plan tomorrow's meals.
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
						03. Zero Lock-in
					</h3>
					<div class="flex flex-col gap-6">
						<div class="flex items-start gap-3">
							<span
								class="text-sm font-bold text-muted tabular-nums pt-0.5"
								>F7</span
							>
							<div class="flex flex-col gap-1">
								<h4 class="font-bold text-base">
									Custom Targets
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Set exact targets for calories, protein, carbs, fats, and fiber to match your bulking or cutting targets.
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
									PocketBase Cloud Sync
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									Your private database stays isolated, locked, and completely secure. Syncs across all of your devices instantly.
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
									Perfect Dark Mode
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									High-contrast light and dark mode styles tailored for early morning lifting or late night recovery meals.
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
						Calzap is completely open-source under the AGPL-3.0 license—I
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
					No Secrets
				</div>
				<h2
					class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
				>
					FAQs
				</h2>
				<p
					class="text-sm text-muted font-semibold leading-relaxed max-w-[30ch] mt-2"
				>
					Got questions? Here are honest, direct answers about how Calzap works, pricing, and your data.
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
					Stop wasting time.
				</div>
				<h2
					class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-balance max-w-2xl"
				>
					Start hitting your numbers today.
				</h2>
			</div>

			<p
				class="text-lg text-muted max-w-[50ch] font-medium leading-relaxed z-10"
			>
				No paywalls. No sponsored feeds. No ads. Just a pure macro calculator built for high performance. Start logging now.
			</p>

			<div class="w-full sm:w-auto z-10">
				<a
					id="bottom-cta-button"
					href={ctaPath}
					class="inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 rounded-2xl bg-(--fg) text-(--bg) font-black text-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/10 hover:shadow-black/25 group"
				>
					<span>Start Logging (It's Free)</span>
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
				<p>© {new Date().getFullYear()} Calzap by KH Systems Pvt Ltd.</p>
				<p class="text-[11px] text-muted/70 font-semibold">Licensed under the <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer" class="underline hover:text-(--fg) transition-colors">GNU AGPL v3.0</a>.</p>
			</div>
			<div class="flex items-center gap-6">
				<a href="/dashboard" class="hover:text-(--fg) transition-colors"
					>Dashboard</a
				>
				<a href="/foods" class="hover:text-(--fg) transition-colors"
					>Foods</a
				>
				<a href="/profile" class="hover:text-(--fg) transition-colors"
					>Profile</a
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
