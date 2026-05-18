<script lang="ts">
	import { store } from "$lib/store.svelte";
	import { onMount } from "svelte";

	let rangeDays = $state(7); // 7, 14, or 30 days
	let activeDetailIndex = $state<number | null>(null);

	// Inline weight inputs
	let inputWeight = $state(70);

	onMount(async () => {
		await store.loadIndexedDB();
		inputWeight = store.userStats.current_weight || 70;
	});

	// Handle weight increment/decrement
	function adjustWeight(amount: number) {
		const newWeight = Number((inputWeight + amount).toFixed(1));
		inputWeight = newWeight;
		store.updateUserStats({ current_weight: newWeight });
	}

	function handleWeightInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const parsed = Number.parseFloat(target.value);
		if (!Number.isNaN(parsed) && parsed > 0) {
			inputWeight = parsed;
			store.updateUserStats({ current_weight: parsed });
		}
	}

	// Calculate range history reactively
	const dailyHistory = $derived.by(() => {
		const history = [];
		const now = new Date();
		
		for (let i = rangeDays - 1; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(now.getDate() - i);
			d.setHours(0, 0, 0, 0);

			// Filter logs on this calendar date
			const dayLogs = store.foodLogs.filter(log => {
				const logDate = new Date(log.consumed_at);
				logDate.setHours(0, 0, 0, 0);
				return logDate.getTime() === d.getTime();
			});

			let calories = 0;
			let proteins = 0;
			let carbs = 0;
			let fats = 0;
			let fiber = 0;

			for (const item of dayLogs) {
				calories = calories + (item.calories ?? 0);
				proteins = proteins + (item.proteins ?? 0);
				carbs = carbs + (item.carbs ?? 0);
				fats = fats + (item.fats ?? 0);
				fiber = fiber + (item.fiber ?? 0);
			}

			history.push({
				date: d,
				dateString: d.toLocaleDateString([], { month: "short", day: "numeric" }),
				weekday: d.toLocaleDateString([], { weekday: "short" }),
				calories,
				proteins,
				carbs,
				fats,
				fiber,
				logged: dayLogs.length > 0,
				logCount: dayLogs.length
			});
		}
		return history;
	});

	// Maximum Calories in range to scale chart
	const maxCalories = $derived.by(() => {
		const values = dailyHistory.map(h => h.calories);
		const target = store.userStats.target_calories || 2500;
		return Math.max(...values, target, 2000);
	});

	// Current Active Details
	const activeDetail = $derived.by(() => {
		if (activeDetailIndex !== null && activeDetailIndex >= 0 && activeDetailIndex < dailyHistory.length) {
			return dailyHistory[activeDetailIndex];
		}
		
		if (dailyHistory.length > 0) {
			return dailyHistory[dailyHistory.length - 1];
		}
		return null;
	});

	// Helper for average calculations
	const summaryStats = $derived.by(() => {
		const history = dailyHistory;
		const totalCalories = history.reduce((sum, h) => sum + h.calories, 0);
		const avgCalories = history.length > 0 ? Math.round(totalCalories / history.length) : 0;

		const totalProtein = history.reduce((sum, h) => sum + h.proteins, 0);
		const avgProtein = history.length > 0 ? Number((totalProtein / history.length).toFixed(1)) : 0;

		const totalCarbs = history.reduce((sum, h) => sum + h.carbs, 0);
		const avgCarbs = history.length > 0 ? Number((totalCarbs / history.length).toFixed(1)) : 0;

		const totalFats = history.reduce((sum, h) => sum + h.fats, 0);
		const avgFats = history.length > 0 ? Number((totalFats / history.length).toFixed(1)) : 0;

		const totalFiber = history.reduce((sum, h) => sum + h.fiber, 0);
		const avgFiber = history.length > 0 ? Number((totalFiber / history.length).toFixed(1)) : 0;

		const target = store.userStats.target_calories;
		const hitDays = history.filter(h => h.logged && h.calories > 0 && h.calories <= target + 100).length;
		const consistencyRate = history.length > 0 ? Math.round((hitDays / history.length) * 100) : 0;

		return {
			avgCalories,
			avgProtein,
			avgCarbs,
			avgFats,
			avgFiber,
			hitDays,
			consistencyRate
		};
	});

	// Streak calculation
	const loggingStreak = $derived.by(() => {
		const logs = store.foodLogs;
		if (logs.length === 0) return 0;

		const loggedDates = new Set<string>();
		for (const log of logs) {
			const d = new Date(log.consumed_at);
			loggedDates.add(d.toDateString());
		}

		let streak = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);

		let checkDate = new Date(today);

		if (!loggedDates.has(today.toDateString())) {
			if (loggedDates.has(yesterday.toDateString())) {
				checkDate = yesterday;
			} else {
				return 0;
			}
		}

		while (true) {
			if (loggedDates.has(checkDate.toDateString())) {
				streak++;
				checkDate.setDate(checkDate.getDate() - 1);
			} else {
				break;
			}
		}
		return streak;
	});

	// Weight variables
	const targetWeight = $derived(store.userStats.target_weight || 70);
	const weightDiff = $derived(Number((inputWeight - targetWeight).toFixed(1)));
</script>

<svelte:head>
	<title>Progress | Calzap</title>
</svelte:head>

<main class="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8 reveal-card">
	<!-- Header & Date selector -->
	<header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-2">Progress Tracker</h1>
			<p class="text-muted font-medium text-lg">Analyze your macros, habits, and fitness consistency</p>
		</div>
		
		<!-- Range selector segmented control -->
		<div class="flex bg-zinc-100 dark:bg-zinc-800/80 border border-(--border) rounded-2xl p-1 shadow-xs self-start sm:self-center select-none">
			{#each [7, 14, 30] as days (days)}
				<button
					type="button"
					onclick={() => { rangeDays = days; activeDetailIndex = null; }}
					class="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer {rangeDays === days ? 'bg-calories text-white shadow-xs' : 'text-muted hover:text-(--fg)'}"
				>
					{days} Days
				</button>
			{/each}
		</div>
	</header>

	<!-- High-impact Metrics Grid -->
	<section class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- Streak Card -->
		<div class="p-6 rounded-3xl bg-(--surface) border border-(--border) shadow-xs relative overflow-hidden group">
			<div class="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-protein/5 group-hover:scale-110 transition-transform duration-500"></div>
			<div class="flex items-center gap-3 mb-3">
				<div class="w-9 h-9 rounded-xl bg-protein/10 text-protein flex items-center justify-center font-black">
					<span class="material-symbols-outlined text-[18px] select-none font-bold" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
				</div>
				<span class="text-[10px] font-black uppercase tracking-widest text-muted">Logging Streak</span>
			</div>
			<div class="flex items-baseline gap-1.5 mt-1">
				<span class="text-4xl font-black tracking-tighter text-protein tabular-nums">{loggingStreak}</span>
				<span class="text-sm font-bold text-muted">days</span>
			</div>
			<p class="text-[10px] font-bold text-muted uppercase mt-2">
				{#if loggingStreak > 0}
					Streak is active! Keep it up 🔥
				{:else}
					Log food today to start a streak!
				{/if}
			</p>
		</div>

		<!-- Average Daily Calories -->
		<div class="p-6 rounded-3xl bg-(--surface) border border-(--border) shadow-xs relative overflow-hidden group">
			<div class="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-calories/5 group-hover:scale-110 transition-transform duration-500"></div>
			<div class="flex items-center gap-3 mb-3">
				<div class="w-9 h-9 rounded-xl bg-calories/10 text-calories flex items-center justify-center font-black">
					<span class="material-symbols-outlined text-[18px] select-none font-bold">bolt</span>
				</div>
				<span class="text-[10px] font-black uppercase tracking-widest text-muted">Daily Average</span>
			</div>
			<div class="flex items-baseline gap-1.5 mt-1">
				<span class="text-4xl font-black tracking-tighter text-calories tabular-nums">{summaryStats.avgCalories}</span>
				<span class="text-xs font-bold text-muted">kcal / day</span>
			</div>
			<p class="text-[10px] font-bold text-muted uppercase mt-2">
				Target: {store.userStats.target_calories} kcal budget
			</p>
		</div>

		<!-- Goal Consistency -->
		<div class="p-6 rounded-3xl bg-(--surface) border border-(--border) shadow-xs relative overflow-hidden group">
			<div class="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-carbs/5 group-hover:scale-110 transition-transform duration-500"></div>
			<div class="flex items-center gap-3 mb-3">
				<div class="w-9 h-9 rounded-xl bg-carbs/10 text-carbs flex items-center justify-center font-black">
					<span class="material-symbols-outlined text-[18px] select-none font-bold" style="font-variation-settings: 'FILL' 1;">check_circle</span>
				</div>
				<span class="text-[10px] font-black uppercase tracking-widest text-muted">Consistency Score</span>
			</div>
			<div class="flex items-baseline gap-1.5 mt-1">
				<span class="text-4xl font-black tracking-tighter text-carbs tabular-nums">{summaryStats.consistencyRate}%</span>
				<span class="text-[10px] font-bold text-muted ml-1 uppercase">({summaryStats.hitDays} / {rangeDays} days)</span>
			</div>
			<p class="text-[10px] font-bold text-muted uppercase mt-2">
				Days within calorie budget limits
			</p>
		</div>
	</section>

	<!-- Calorie Trend Chart -->
	<section class="p-8 rounded-3xl bg-(--surface) border border-(--border) shadow-xs flex flex-col gap-6">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
			<div>
				<h2 class="text-xl font-bold tracking-tight">Daily Calorie Trend</h2>
				<p class="text-xs text-muted font-medium mt-0.5">Visualize calorie intake against target budget</p>
			</div>
			<div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest select-none">
				<div class="flex items-center gap-1.5">
					<span class="w-3 h-3 rounded-md bg-calories"></span>
					<span class="text-muted">On Budget</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="w-3 h-3 rounded-md bg-rose-500"></span>
					<span class="text-muted">Over Budget</span>
				</div>
			</div>
		</div>

		<!-- The Chart Area -->
		<div class="relative h-64 w-full flex items-end justify-between gap-1.5 md:gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-1 pt-6 px-1">
			
			<!-- Target Calorie Line (Dashed) -->
			<div 
				class="absolute left-0 right-0 border-t border-dashed border-zinc-400 dark:border-zinc-600 z-10 pointer-events-none flex items-center transition-all duration-300"
				style="bottom: {(store.userStats.target_calories / maxCalories) * 100}%"
			>
				<span class="bg-zinc-200/90 dark:bg-zinc-800/90 text-[8px] font-black uppercase tracking-wider text-muted px-1.5 py-0.5 rounded-md ml-2 border border-zinc-300 dark:border-zinc-700 shadow-xs select-none">
					Goal: {store.userStats.target_calories} kcal
				</span>
			</div>

			<!-- Bars -->
			{#each dailyHistory as day, index (day.date.toDateString())}
				{@const barHeight = Math.min((day.calories / maxCalories) * 100, 100)}
				{@const isOver = day.calories > store.userStats.target_calories}
				<button
					type="button"
					onclick={() => activeDetailIndex = index}
					onmouseenter={() => activeDetailIndex = index}
					class="flex-1 group flex flex-col items-center gap-2 h-full justify-end focus:outline-hidden cursor-pointer"
				>
					<div class="w-full flex-1 flex flex-col justify-end relative h-full">
						{#if day.logged}
							<div 
								class="w-full rounded-t-md transition-all duration-500 ease-out relative group-hover:scale-x-105 {isOver ? 'bg-rose-500 shadow-xs shadow-rose-500/20' : 'bg-calories shadow-xs shadow-(--color-calories)/20'} {activeDetailIndex === index ? 'ring-2 ring-(--fg) scale-x-105' : ''}"
								style="height: {barHeight}%"
							>
							</div>
						{:else}
							<!-- Empty day track -->
							<div class="w-full h-1 rounded-t-xs bg-zinc-200 dark:bg-zinc-800 transition-all {activeDetailIndex === index ? 'bg-zinc-300 dark:bg-zinc-700' : ''}"></div>
						{/if}
					</div>

					<!-- X-axis Label -->
					<div class="flex flex-col items-center">
						<span class="text-[9px] font-black uppercase tracking-tight text-muted/80">{day.weekday}</span>
						<span class="text-[8px] font-bold text-muted/60">{day.date.getDate()}</span>
					</div>
				</button>
			{/each}
		</div>

		<!-- Day Details Expanded Panel -->
		{#if activeDetail}
			<div class="bg-zinc-50/50 dark:bg-zinc-800/10 p-5 rounded-2xl border border-(--border) animate-in fade-in slide-in-from-bottom-2 duration-300">
				<div class="flex items-center justify-between border-b border-(--border)/40 pb-3 mb-4">
					<div class="flex items-center gap-2">
						<span class="material-symbols-outlined text-[18px] text-calories select-none">calendar_today</span>
						<h3 class="font-black text-sm uppercase tracking-wider text-muted">
							{#if activeDetail.dateString === new Date().toLocaleDateString([], { month: "short", day: "numeric" })}
								Today ({activeDetail.dateString})
							{:else}
								{activeDetail.dateString}
							{/if}
						</h3>
					</div>
					
					{#if activeDetail.logged}
						<span class="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-calories/10 text-calories border border-calories/20 shadow-[0_0_8px_var(--color-calories)/5]">{activeDetail.logCount} items logged</span>
					{:else}
						<span class="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-150 dark:bg-zinc-800 text-muted border border-(--border)">No Logs</span>
					{/if}
				</div>

				{#if activeDetail.logged}
					<div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
						<!-- Calories Detail -->
						<div class="p-3 bg-(--surface) border border-(--border) rounded-xl flex flex-col gap-0.5">
							<span class="text-[9px] font-black uppercase tracking-wider text-muted">Calories</span>
							<span class="text-lg font-black text-calories tabular-nums">{activeDetail.calories} <span class="text-[10px] font-bold text-muted">kcal</span></span>
							<span class="text-[9px] font-semibold text-muted/70">
								{#if activeDetail.calories > store.userStats.target_calories}
									Over by {activeDetail.calories - store.userStats.target_calories}
								{:else}
									Left: {store.userStats.target_calories - activeDetail.calories}
								{/if}
							</span>
						</div>
						
						<!-- Protein Detail -->
						<div class="p-3 bg-(--surface) border border-(--border) rounded-xl flex flex-col gap-0.5">
							<span class="text-[9px] font-black uppercase tracking-wider text-protein">Protein</span>
							<span class="text-lg font-black text-protein tabular-nums">{Math.round(activeDetail.proteins)} <span class="text-[10px] font-bold text-muted">g</span></span>
							<span class="text-[9px] font-semibold text-muted/70">Goal: {store.userStats.target_proteins}g</span>
						</div>

						<!-- Carbs Detail -->
						<div class="p-3 bg-(--surface) border border-(--border) rounded-xl flex flex-col gap-0.5">
							<span class="text-[9px] font-black uppercase tracking-wider text-carbs">Carbs</span>
							<span class="text-lg font-black text-carbs tabular-nums">{Math.round(activeDetail.carbs)} <span class="text-[10px] font-bold text-muted">g</span></span>
							<span class="text-[9px] font-semibold text-muted/70">Goal: {store.userStats.target_carbs}g</span>
						</div>

						<!-- Fats Detail -->
						<div class="p-3 bg-(--surface) border border-(--border) rounded-xl flex flex-col gap-0.5">
							<span class="text-[9px] font-black uppercase tracking-wider text-fats">Fats</span>
							<span class="text-lg font-black text-fats tabular-nums">{Math.round(activeDetail.fats)} <span class="text-[10px] font-bold text-muted">g</span></span>
							<span class="text-[9px] font-semibold text-muted/70">Goal: {store.userStats.target_fats}g</span>
						</div>

						<!-- Fiber Detail -->
						<div class="p-3 bg-(--surface) border border-(--border) rounded-xl flex flex-col gap-0.5">
							<span class="text-[9px] font-black uppercase tracking-wider text-fiber">Fiber</span>
							<span class="text-lg font-black text-fiber tabular-nums">{Math.round(activeDetail.fiber)} <span class="text-[10px] font-bold text-muted">g</span></span>
							<span class="text-[9px] font-semibold text-muted/70">Goal: {store.userStats.target_fiber}g</span>
						</div>
					</div>
				{:else}
					<div class="text-center py-6 text-zinc-400 dark:text-zinc-500 font-bold text-sm">
						No nutritional intake logged for this date.
					</div>
				{/if}
			</div>
		{/if}
	</section>

	<!-- Macro Averages & Weight Journey Dual-Column layout -->
	<section class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
		
		<!-- Macro Average Goals Progress -->
		<div class="p-8 rounded-3xl bg-(--surface) border border-(--border) shadow-xs space-y-6">
			<div>
				<h2 class="text-xl font-bold tracking-tight">Nutrient Averages</h2>
				<p class="text-xs text-muted font-medium mt-0.5">Average daily macronutrient targets achieved</p>
			</div>

			<div class="space-y-4 pt-4 border-t border-(--border)/40">
				<!-- Protein Avg -->
				<div class="space-y-1.5">
					<div class="flex justify-between items-center text-xs font-bold">
						<span class="text-protein flex items-center gap-1.5">
							<span class="w-2.5 h-2.5 rounded-full bg-protein"></span>
							Protein Average
						</span>
						<span class="tabular-nums font-black text-zinc-950 dark:text-zinc-50">{summaryStats.avgProtein}g <span class="text-[10px] text-muted font-normal">/ {store.userStats.target_proteins}g</span></span>
					</div>
					<div class="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-(--border)/50">
						<div class="h-full rounded-full bg-protein transition-all duration-500" style="width: {Math.min((summaryStats.avgProtein / store.userStats.target_proteins) * 100, 100)}%"></div>
					</div>
					<div class="flex justify-between text-[9px] font-black uppercase tracking-tight text-muted">
						<span>{Math.round(Math.min((summaryStats.avgProtein / store.userStats.target_proteins) * 100, 100))}% Met</span>
						<span>
							{#if store.userStats.target_proteins - summaryStats.avgProtein > 0}
								{Math.round(store.userStats.target_proteins - summaryStats.avgProtein)}g short
							{:else}
								Target Achieved!
							{/if}
						</span>
					</div>
				</div>

				<!-- Carbs Avg -->
				<div class="space-y-1.5 pt-2">
					<div class="flex justify-between items-center text-xs font-bold">
						<span class="text-carbs flex items-center gap-1.5">
							<span class="w-2.5 h-2.5 rounded-full bg-carbs"></span>
							Carbs Average
						</span>
						<span class="tabular-nums font-black text-zinc-950 dark:text-zinc-50">{summaryStats.avgCarbs}g <span class="text-[10px] text-muted font-normal">/ {store.userStats.target_carbs}g</span></span>
					</div>
					<div class="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-(--border)/50">
						<div class="h-full rounded-full bg-carbs transition-all duration-500" style="width: {Math.min((summaryStats.avgCarbs / store.userStats.target_carbs) * 100, 100)}%"></div>
					</div>
					<div class="flex justify-between text-[9px] font-black uppercase tracking-tight text-muted">
						<span>{Math.round(Math.min((summaryStats.avgCarbs / store.userStats.target_carbs) * 100, 100))}% Met</span>
						<span>
							{#if store.userStats.target_carbs - summaryStats.avgCarbs > 0}
								{Math.round(store.userStats.target_carbs - summaryStats.avgCarbs)}g short
							{:else}
								Target Achieved!
							{/if}
						</span>
					</div>
				</div>

				<!-- Fats Avg -->
				<div class="space-y-1.5 pt-2">
					<div class="flex justify-between items-center text-xs font-bold">
						<span class="text-fats flex items-center gap-1.5">
							<span class="w-2.5 h-2.5 rounded-full bg-fats"></span>
							Fats Average
						</span>
						<span class="tabular-nums font-black text-zinc-950 dark:text-zinc-50">{summaryStats.avgFats}g <span class="text-[10px] text-muted font-normal">/ {store.userStats.target_fats}g</span></span>
					</div>
					<div class="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-(--border)/50">
						<div class="h-full rounded-full bg-fats transition-all duration-500" style="width: {Math.min((summaryStats.avgFats / store.userStats.target_fats) * 100, 100)}%"></div>
					</div>
					<div class="flex justify-between text-[9px] font-black uppercase tracking-tight text-muted">
						<span>{Math.round(Math.min((summaryStats.avgFats / store.userStats.target_fats) * 100, 100))}% Met</span>
						<span>
							{#if store.userStats.target_fats - summaryStats.avgFats > 0}
								{Math.round(store.userStats.target_fats - summaryStats.avgFats)}g short
							{:else}
								Target Achieved!
							{/if}
						</span>
					</div>
				</div>

				<!-- Fiber Avg -->
				<div class="space-y-1.5 pt-2">
					<div class="flex justify-between items-center text-xs font-bold">
						<span class="text-fiber flex items-center gap-1.5">
							<span class="w-2.5 h-2.5 rounded-full bg-fiber"></span>
							Fiber Average
						</span>
						<span class="tabular-nums font-black text-zinc-950 dark:text-zinc-50">{summaryStats.avgFiber}g <span class="text-[10px] text-muted font-normal">/ {store.userStats.target_fiber}g</span></span>
					</div>
					<div class="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-(--border)/50">
						<div class="h-full rounded-full bg-fiber transition-all duration-500" style="width: {Math.min((summaryStats.avgFiber / store.userStats.target_fiber) * 100, 100)}%"></div>
					</div>
					<div class="flex justify-between text-[9px] font-black uppercase tracking-tight text-muted">
						<span>{Math.round(Math.min((summaryStats.avgFiber / store.userStats.target_fiber) * 100, 100))}% Met</span>
						<span>
							{#if store.userStats.target_fiber - summaryStats.avgFiber > 0}
								{Math.round(store.userStats.target_fiber - summaryStats.avgFiber)}g short
							{:else}
								Target Achieved!
							{/if}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Weight Journey Tracker -->
		<div class="p-8 rounded-3xl bg-(--surface) border border-(--border) shadow-xs space-y-6 relative overflow-hidden group">
			<div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-calories/5 group-hover:scale-110 transition-transform duration-500"></div>

			<div class="relative">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-xl bg-calories/10 text-calories flex items-center justify-center font-black">
						<span class="material-symbols-outlined text-[20px] select-none font-bold">monitor_weight</span>
					</div>
					<div>
						<h2 class="text-xl font-bold tracking-tight">Weight Journey</h2>
						<p class="text-xs text-muted font-semibold">Track weight parameters and goals</p>
					</div>
				</div>

				<p class="text-xs text-muted leading-relaxed mb-6">
					Logging your weight helps align your food targets with your body mass goal. Log your current parameters below.
				</p>

				<div class="pt-6 border-t border-(--border)/40 space-y-6">
					<!-- Stepper Controls -->
					<div class="flex flex-col gap-2">
						<span class="text-[10px] font-black uppercase tracking-widest text-calories">Log Current Weight</span>
						<div class="flex items-center justify-between bg-zinc-150/40 dark:bg-zinc-850/20 border border-(--border) rounded-2xl p-1.5">
							<button
								type="button"
								onclick={() => adjustWeight(-0.1)}
								class="h-10 px-3 bg-(--surface) border border-(--border) text-zinc-600 dark:text-zinc-400 hover:text-(--fg) rounded-xl font-black text-sm active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
							>
								-0.1 kg
							</button>

							<div class="flex items-baseline gap-1 text-center justify-center flex-1">
								<input
									type="number"
									step="0.1"
									min="10"
									max="300"
									value={inputWeight}
									oninput={handleWeightInput}
									class="w-20 text-center bg-transparent font-extrabold text-xl focus:outline-hidden text-zinc-950 dark:text-zinc-50"
								/>
								<span class="text-xs font-bold text-muted">kg</span>
							</div>

							<button
								type="button"
								onclick={() => adjustWeight(0.1)}
								class="h-10 px-3 bg-(--surface) border border-(--border) text-zinc-600 dark:text-zinc-400 hover:text-(--fg) rounded-xl font-black text-sm active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
							>
								+0.1 kg
							</button>
						</div>
					</div>

					<!-- Goal Weight Comparison -->
					<div class="bg-zinc-50/50 dark:bg-zinc-800/10 p-5 rounded-2xl border border-(--border) space-y-4">
						<div class="flex justify-between items-center text-xs font-bold">
							<span class="text-muted">Target Goal Weight:</span>
							<span class="font-extrabold text-calories">{targetWeight} kg</span>
						</div>

						<div class="grid grid-cols-2 gap-4 border-t border-(--border)/40 pt-4 text-center">
							<div class="space-y-0.5">
								<span class="text-[9px] font-black uppercase tracking-wider text-muted block">Current</span>
								<span class="text-xl font-extrabold tabular-nums text-zinc-950 dark:text-zinc-50">{inputWeight} <span class="text-xs font-bold text-muted">kg</span></span>
							</div>
							<div class="space-y-0.5">
								<span class="text-[9px] font-black uppercase tracking-wider text-muted block">Goal Progress</span>
								{#if weightDiff === 0}
									<span class="text-lg font-black text-emerald-500 block">Goal Met! 🎉</span>
								{:else}
									{#if weightDiff > 0}
										<span class="text-lg font-black text-calories tabular-nums block">-{weightDiff} kg remaining</span>
									{:else}
										<span class="text-lg font-black text-calories tabular-nums block">+{Math.abs(weightDiff)} kg remaining</span>
									{/if}
								{/if}
							</div>
						</div>
					</div>

				</div>
			</div>
		</div>

	</section>
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
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal-card {
			opacity: 1;
			animation: none;
		}
	}
</style>
