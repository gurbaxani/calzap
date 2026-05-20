<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	import { store } from "$lib/store.svelte";


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

	const demoRemaining = $derived(2000 - demoTotals.calories);

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
			answer: "It's 100% free. No ads, no popups, and no premium upsells. I built Calzap for myself because I was tired of calorie trackers that make you watch video ads just to log a banana. It's free and fast for everyone, no strings attached.",
		},
		{
			question: "Is my data private?",
			answer: "Completely. Everything you track is stored directly on your own device—inside your web browser. There are no servers, no databases in the sky, and no tracking scripts. Your logs never leave your device, giving you absolute privacy.",
		},
		{
			question: "Does it work offline or in basement gyms?",
			answer: "Yes! Since the app lives entirely in your browser and saves data on your device, it doesn't need an internet connection to work. You can log your meals in a deep basement weight room, on a flight, or off the grid without any lag or loading screens.",
		},
		{
			question: "Can I back up or transfer my data?",
			answer: "Yes, easily. You can download a backup file of all your foods and logs at any time from your profile, or export them to a spreadsheet. If you change phones or clear your browser, just import your backup file and pick up right where you left off.",
		},
		{
			question: "How is this faster than other calorie trackers?",
			answer: "By removing all the clutter. When you open Calzap, there are no loading screens, no social feeds, and no popup notifications. You search, tap to log, and get on with your day. Your favorite foods sit right on your dashboard for instant logging.",
		},
		{
			question: "Can I customize my daily targets?",
			answer: "Yes. You have total control over your calorie, protein, carb, fat, and fiber targets. You can tweak them in your profile whenever your goals change, whether you are building muscle, cutting down, or just focusing on eating well.",
		},
	];

	const ctaPath = $derived(store.userStats.onboarded ? "/dashboard" : "/hello");
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
		class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.03)] blur-[120px] pointer-events-none"
	></div>
	<div
		class="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[oklch(from_var(--color-protein)_l_c_h/0.02)] blur-[160px] pointer-events-none"
	></div>

	<!-- Main Container -->
	<main
		class="grow w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-24 md:gap-32"
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
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.08)] text-calories text-[11px] font-extrabold uppercase tracking-widest border border-[oklch(from_var(--color-calories)_l_c_h/0.15)] select-none"
				>
					<span class="relative flex h-2 w-2">
						<span
							class="animate-ping absolute inline-flex h-full w-full rounded-full bg-calories opacity-75"
						></span>
						<span
							class="relative inline-flex rounded-full h-2 w-2 bg-calories"
						></span>
					</span>
					Zero Accounts. 100% Private.
				</div>

				<h1
					class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-2xl text-balance"
				>
					Log your macros in <span
						class="text-calories"
						>10 raw seconds</span
					>. Stop wasting time.
				</h1>

				<p
					class="text-lg sm:text-xl text-muted max-w-[62ch] font-medium leading-relaxed"
				>
					No sign-ups, no ads, and no cloud databases. Calzap is a lightning-fast macro tracker that lives entirely on your device. Keep your diet on track with absolute privacy.
				</p>

				<div class="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
					<a
						id="hero-cta-button"
						href={ctaPath}
						class="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-(--fg) text-(--bg) font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 group shrink-0"
					>
						<span>Start Logging (Free)</span>
						<span
							class="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-1 select-none text-[20px] leading-none"
							>arrow_forward</span
						>
					</a>

					<a
						href="https://www.producthunt.com/products/calzap-ai-calorie-tracking-super-quick?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-calzap"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
					>
						<img
							alt="Calzap - An AI calorie tracking app that wants you to live your life. | Product Hunt"
							width="250"
							height="54"
							src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1150619&amp;theme=light&amp;t=1779258404693"
							class="w-[250px] h-[54px]"
						/>
					</a>
				</div>

				<!-- Hero Results Bullet Points -->
				<div
					class="grid sm:grid-cols-3 gap-6 pt-6 border-t border-(--border) w-full mt-2"
				>
					<div class="flex flex-col gap-1.5">
						<div
							class="text-protein font-black text-sm uppercase tracking-wider flex items-center gap-1.5"
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
							class="text-carbs font-black text-sm uppercase tracking-wider flex items-center gap-1.5"
						>
							<span
								class="material-symbols-outlined text-[18px] leading-none"
								style="font-variation-settings: 'FILL' 1;"
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
							class="text-fats font-black text-sm uppercase tracking-wider flex items-center gap-1.5"
						>
							<span
								class="material-symbols-outlined text-[18px] leading-none"
								>lock</span
							>
							100% Private
						</div>
						<p
							class="text-xs text-muted leading-relaxed font-semibold"
						>
							No cloud servers, no tracking, and no accounts. Everything you eat is saved privately on your device and nowhere else.
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
					class="w-full max-w-[380px] bg-(--surface) border border-(--border) rounded-[2.5rem] p-6.5 shadow-2xl relative overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
				>
					<!-- Interactive Demo Header -->
					<div
						class="flex items-center justify-between mb-6 pb-4 border-b border-(--border)"
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

					<!-- Calorie Intake Card Mockup -->
					<div 
						class="p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden mb-6 w-full text-center"
						style="background-color: oklch(from var(--color-calories) l c h / 0.04); border-color: oklch(from var(--color-calories) l c h / 0.15);"
					>
						<!-- Accent glow inside card -->
						<div class="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.08)] blur-2xl pointer-events-none"></div>

						<div class="flex items-baseline justify-center gap-2 relative z-10">
							<span
								class="text-5xl font-black tracking-tighter tabular-nums transition-all text-calories"
							>
								{demoRemaining}
							</span>
							<span class="text-sm font-bold text-muted"
								>kcal left</span
							>
						</div>
						<div
							class="text-[9px] font-bold text-muted/60 uppercase tracking-widest relative z-10 mt-1"
						>
							Budget: 2000 kcal • Consumed: {demoTotals.calories} kcal
						</div>
					</div>

					<!-- Custom High-Contrast Segmented Macro Grid -->
					<div class="grid grid-cols-2 gap-3.5 mb-7">
						<!-- Protein Card -->
						<div
							class="p-3 rounded-2xl border flex flex-col gap-1.5 transition-all duration-300 hover:scale-[1.01]"
							style="background-color: oklch(from var(--color-protein) l c h / 0.04); border-color: oklch(from var(--color-protein) l c h / 0.15);"
						>
							<div class="flex justify-between items-baseline">
								<span
									class="text-xs font-black uppercase text-protein"
									>Protein</span
								>
								<span
									class="text-[10px] font-bold text-muted tabular-nums"
									>{demoTotals.protein}g / 180g</span
								>
							</div>
							<div
								class="h-1.5 w-full rounded-full overflow-hidden"
								style="background-color: oklch(from var(--color-protein) l c h / 0.1);"
							>
								<div
									class="h-full bg-protein rounded-full transition-all duration-500 ease-out-quart"
									style="width: {Math.min(
										100,
										(demoTotals.protein / 180) * 100,
									)}%"
								></div>
							</div>
						</div>

						<!-- Carbs Card -->
						<div
							class="p-3 rounded-2xl border flex flex-col gap-1.5 transition-all duration-300 hover:scale-[1.01]"
							style="background-color: oklch(from var(--color-carbs) l c h / 0.04); border-color: oklch(from var(--color-carbs) l c h / 0.15);"
						>
							<div class="flex justify-between items-baseline">
								<span
									class="text-xs font-black uppercase text-carbs"
									>Carbs</span
								>
								<span
									class="text-[10px] font-bold text-muted tabular-nums"
									>{demoTotals.carbs}g / 250g</span
								>
							</div>
							<div
								class="h-1.5 w-full rounded-full overflow-hidden"
								style="background-color: oklch(from var(--color-carbs) l c h / 0.1);"
							>
								<div
									class="h-full bg-carbs rounded-full transition-all duration-500 ease-out-quart"
									style="width: {Math.min(
										100,
										(demoTotals.carbs / 250) * 100,
									)}%"
								></div>
							</div>
						</div>

						<!-- Fats Card -->
						<div
							class="p-3 rounded-2xl border flex flex-col gap-1.5 transition-all duration-300 hover:scale-[1.01]"
							style="background-color: oklch(from var(--color-fats) l c h / 0.04); border-color: oklch(from var(--color-fats) l c h / 0.15);"
						>
							<div class="flex justify-between items-baseline">
								<span
									class="text-xs font-black uppercase text-fats"
									>Fats</span
								>
								<span
									class="text-[10px] font-bold text-muted tabular-nums"
									>{demoTotals.fats}g / 70g</span
								>
							</div>
							<div
								class="h-1.5 w-full rounded-full overflow-hidden"
								style="background-color: oklch(from var(--color-fats) l c h / 0.1);"
							>
								<div
									class="h-full bg-fats rounded-full transition-all duration-500 ease-out-quart"
									style="width: {Math.min(
										100,
										(demoTotals.fats / 70) * 100,
									)}%"
								></div>
							</div>
						</div>

						<!-- Fiber Card -->
						<div
							class="p-3 rounded-2xl border flex flex-col gap-1.5 transition-all duration-300 hover:scale-[1.01]"
							style="background-color: oklch(from var(--color-fiber) l c h / 0.04); border-color: oklch(from var(--color-fiber) l c h / 0.15);"
						>
							<div class="flex justify-between items-baseline">
								<span
									class="text-xs font-black uppercase text-fiber"
									>Fiber</span
								>
								<span
									class="text-[10px] font-bold text-muted tabular-nums"
									>{demoTotals.fiber}g / 35g</span
								>
							</div>
							<div
								class="h-1.5 w-full rounded-full overflow-hidden"
								style="background-color: oklch(from var(--color-fiber) l c h / 0.1);"
							>
								<div
									class="h-full bg-fiber rounded-full transition-all duration-500 ease-out-quart"
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
								class="w-full text-left p-3 rounded-xl border transition-all active:scale-[0.98] group flex justify-between items-center cursor-pointer"
								style="background-color: oklch(from var(--color-calories) l c h / 0.025); border-color: oklch(from var(--color-calories) l c h / 0.12);"
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
									class="material-symbols-outlined text-[16px] text-calories group-hover:translate-x-0.5 transition-transform select-none"
									>add</span
								>
							</button>

							<button
								type="button"
								id="demo-add-oats"
								onclick={() => addDemoFood(presetOats)}
								class="w-full text-left p-3 rounded-xl border transition-all active:scale-[0.98] group flex justify-between items-center cursor-pointer"
								style="background-color: oklch(from var(--color-calories) l c h / 0.025); border-color: oklch(from var(--color-calories) l c h / 0.12);"
							>
								<div class="flex flex-col">
									<span class="font-bold text-xs"
										>Large Bowl of Oats</span
									>
									<span class="text-[9px] text-muted mt-0.5"
										>380 kcal • 13g P • 66g C • 7g F • 10g Fib</span
									>
								</div>
								<span
									class="material-symbols-outlined text-[16px] text-calories group-hover:translate-x-0.5 transition-transform select-none"
									>add</span
								>
							</button>

							<button
								type="button"
								id="demo-add-almonds"
								onclick={() => addDemoFood(presetAlmonds)}
								class="w-full text-left p-3 rounded-xl border transition-all active:scale-[0.98] group flex justify-between items-center cursor-pointer"
								style="background-color: oklch(from var(--color-calories) l c h / 0.025); border-color: oklch(from var(--color-calories) l c h / 0.12);"
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
									class="material-symbols-outlined text-[16px] text-calories group-hover:translate-x-0.5 transition-transform select-none"
									>add</span
								>
							</button>
						</div>
					</div>

					<!-- Visual Confirmation Logged List inside Mockup -->
					{#if demoLogs.length > 0}
						<div
							class="flex flex-col gap-2 mt-4 pt-4 border-t border-(--border) max-h-[140px] overflow-y-auto"
						>
							<h5
								class="text-[9px] font-black uppercase tracking-wider text-muted"
							>
								Currently Logged ({demoLogs.length}):
							</h5>
							{#each demoLogs as log (log.id)}
								<div
									class="flex justify-between items-center text-xs py-2 px-3 rounded-lg border transition-all duration-300"
									style="background-color: oklch(from var(--color-calories) l c h / 0.025); border-color: oklch(from var(--color-calories) l c h / 0.1);"
								>
									<span
										class="font-bold truncate max-w-[160px]"
										>{log.name}</span
									>
									<span
										class="text-calories text-[10px] tabular-nums font-black"
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
			<hr class="w-full border-(--border)" />
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
					class="text-protein font-black text-xs uppercase tracking-widest select-none"
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
			<hr class="w-full border-(--border)" />
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
					class="text-carbs font-black text-xs uppercase tracking-widest select-none"
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
				<!-- Benefit 1 (Protein) -->
				<div
					class="flex flex-col items-start gap-5 p-6.5 rounded-3xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-sm"
					style="background-color: oklch(from var(--color-protein) l c h / 0.035); border-color: oklch(from var(--color-protein) l c h / 0.15);"
				>
					<div
						class="w-12 h-12 rounded-2xl bg-[oklch(from_var(--color-protein)_l_c_h/0.08)] flex items-center justify-center text-protein"
					>
						<span
							class="material-symbols-outlined text-[24px] select-none"
							>analytics</span
						>
					</div>
					<div class="flex flex-col gap-2">
						<h3 class="text-xl font-bold tracking-tight" style="color: var(--color-protein);">
							Get your numbers in one glance
						</h3>
						<p
							class="text-sm text-muted leading-relaxed font-semibold"
						>
							A high-contrast calorie ring and macro grid showing your remaining protein, carbs, fats, and fiber instantly. No complex menus needed.
						</p>
					</div>
				</div>

				<!-- Benefit 2 (Calories) -->
				<div
					class="flex flex-col items-start gap-5 p-6.5 rounded-3xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-sm"
					style="background-color: oklch(from var(--color-calories) l c h / 0.035); border-color: oklch(from var(--color-calories) l c h / 0.15);"
				>
					<div
						class="w-12 h-12 rounded-2xl bg-[oklch(from_var(--color-calories)_l_c_h/0.08)] flex items-center justify-center text-calories"
					>
						<span
							class="material-symbols-outlined text-[24px] select-none"
							style="font-variation-settings: 'FILL' 1;"
							>bolt</span
						>
					</div>
					<div class="flex flex-col gap-2">
						<h3 class="text-xl font-bold tracking-tight" style="color: var(--color-calories);">
							Log in two taps. Literally.
						</h3>
						<p
							class="text-sm text-muted leading-relaxed font-semibold"
						>
							A lightning-fast search box and 1-tap quick logs to copy your recurring meals instantly. Zero load states or delay.
						</p>
					</div>
				</div>

				<!-- Benefit 3 (Fiber) -->
				<div
					class="flex flex-col items-start gap-5 p-6.5 rounded-3xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-sm"
					style="background-color: oklch(from var(--color-fiber) l c h / 0.035); border-color: oklch(from var(--color-fiber) l c h / 0.15);"
				>
					<div
						class="w-12 h-12 rounded-2xl bg-[oklch(from_var(--color-fiber)_l_c_h/0.08)] flex items-center justify-center text-fiber"
					>
						<span
							class="material-symbols-outlined text-[24px] select-none"
							>restaurant</span
						>
					</div>
					<div class="flex flex-col gap-2">
						<h3 class="text-xl font-bold tracking-tight" style="color: var(--color-fiber);">
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
			<hr class="w-full border-(--border)" />
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
					class="text-fats font-black text-xs uppercase tracking-widest select-none"
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
						class="text-xs font-black uppercase tracking-wider text-calories pb-3 border-b border-(--border)"
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
						class="text-xs font-black uppercase tracking-wider text-protein pb-3 border-b border-(--border)"
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
						class="text-xs font-black uppercase tracking-wider text-fiber pb-3 border-b border-(--border)"
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
									100% Local Storage
								</h4>
								<p
									class="text-xs text-muted leading-relaxed font-semibold"
								>
									No servers, no accounts, and no databases in the sky. Your logs stay right on your device, completely private to you.
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
			<hr class="w-full border-(--border)" />
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
					class="text-calories font-black text-xs uppercase tracking-widest select-none"
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
				class="lg:col-span-7 p-8 md:p-10 rounded-[2.5rem] border border-(--border) bg-[oklch(from_var(--color-calories)_l_c_h/0.015)] relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 group"
			>
				<div
					class="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.025)] blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none"
				></div>

				<div class="flex flex-col gap-4 max-w-[40ch]">
					<div
						class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[oklch(from_var(--color-calories)_l_c_h/0.08)] text-calories text-[10px] font-black uppercase tracking-wider border border-[oklch(from_var(--color-calories)_l_c_h/0.15)] select-none self-start"
					>
						100% Free Forever
					</div>
					<h3 class="text-2xl font-black tracking-tight">
						Just for the Good of People
					</h3>
					<p class="text-sm text-muted leading-relaxed font-semibold">
						There are no hidden fees, no paywalls, and no corporate tracking scripts. 
						Calzap runs completely on your own device, meaning there are no expensive server bills to pay—so we never have a reason to charge you a single penny. It is built purely to help you hit your goals.
					</p>
				</div>

				<div
					class="flex flex-col items-start gap-1 p-5 rounded-2xl border shadow-lg shadow-black/5 min-w-[160px] self-stretch justify-center text-center sm:text-left transition-all duration-300"
					style="background-color: oklch(from var(--color-calories) l c h / 0.035); border-color: oklch(from var(--color-calories) l c h / 0.15);"
				>
					<div
						class="text-[9px] font-black uppercase tracking-wider text-muted mb-1 w-full text-center sm:text-left"
					>
						Monthly Cost
					</div>
					<div
						class="text-4xl font-black tracking-tighter text-calories w-full text-center sm:text-left tabular-nums"
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
			<hr class="w-full border-(--border)" />
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
					class="text-fiber font-black text-xs uppercase tracking-widest select-none"
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
				class="lg:col-span-8 flex flex-col border-t border-(--border)"
			>
				{#each faqs as faq, index (faq.question)}
					<div
						class="border-b border-(--border) py-4 sm:py-5 flex flex-col"
					>
						<button
							type="button"
							id="faq-button-{index}"
							onclick={() => toggleFaq(index)}
							class="flex justify-between items-center w-full text-left font-bold text-base sm:text-lg hover:text-calories transition-colors focus:outline-hidden group py-1"
						>
							<span class="pr-6">{faq.question}</span>
							<span
								class="material-symbols-outlined text-muted group-hover:text-calories transition-all select-none text-[20px] leading-none"
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
			<hr class="w-full border-(--border)" />
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
				class="absolute inset-0 bg-radial from-[oklch(from_var(--color-calories)_l_c_h/0.04)] to-transparent rounded-[3rem] blur-xl pointer-events-none"
			></div>

			<div class="flex flex-col items-center gap-4 z-10">
				<div
					class="text-calories font-black text-xs uppercase tracking-widest select-none"
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
				No paywalls, no ads, and no sign-ups. Just a private, lightning-fast tracker stored directly on your own device. Start logging now.
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
						style="font-variation-settings: 'FILL' 1;"
						>bolt</span
					>
				</a>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<Footer />
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
