<script lang="ts">
	import MacroBar from "$lib/components/MacroBar.svelte";
	import { store } from "$lib/store.svelte";
	import { slide } from "svelte/transition";
	import ConfirmModal from "$lib/components/ConfirmModal.svelte";

	let selectedDate = $state(new Date());
	let isDeleteModalOpen = $state(false);
	let logIdToDelete = $state<string | null>(null);

	// Filter logs for the selected date
	const logsToday = $derived.by(() => {
		const startOfDay = new Date(selectedDate);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(selectedDate);
		endOfDay.setHours(23, 59, 59, 999);

		return store.foodLogs.filter(log => {
			const d = new Date(log.consumed_at);
			return d >= startOfDay && d <= endOfDay;
		}).sort((a, b) => new Date(b.consumed_at).getTime() - new Date(a.consumed_at).getTime());
	});

	// Derive today's macro intake totals dynamically from local store
	const consumed = $derived.by(() => {
		let totalCal = 0;
		let totalProt = 0;
		let totalCarb = 0;
		let totalFat = 0;
		let totalFib = 0;
		for (const item of logsToday) {
			totalCal = totalCal + (item.calories ?? 0);
			totalProt = totalProt + (item.proteins ?? 0);
			totalCarb = totalCarb + (item.carbs ?? 0);
			totalFat = totalFat + (item.fats ?? 0);
			totalFib = totalFib + (item.fiber ?? 0);
		}
		return {
			calories: totalCal,
			protein: Number(totalProt.toFixed(1)),
			carbs: Number(totalCarb.toFixed(1)),
			fats: Number(totalFat.toFixed(1)),
			fiber: Number(totalFib.toFixed(1)),
		};
	});

	const dailyTargets = $derived(store.userStats);

	const remainingCalories = $derived(
		dailyTargets.target_calories - consumed.calories,
	);

	let showConsumedCal = $state(false);

	function deleteLog(id: string) {
		logIdToDelete = id;
		isDeleteModalOpen = true;
	}

	function confirmDelete() {
		if (logIdToDelete) {
			store.deleteFoodLog(logIdToDelete);
		}
		isDeleteModalOpen = false;
		logIdToDelete = null;
	}

	function cancelDelete() {
		isDeleteModalOpen = false;
		logIdToDelete = null;
	}

	function changeDate(days: number) {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() + days);
		selectedDate = newDate;
	}

	function formatSelectedDate(date: Date): string {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0, 0, 0, 0);

		const d = new Date(date);
		d.setHours(0, 0, 0, 0);

		if (d.getTime() === today.getTime()) {
			return "Today";
		} else if (d.getTime() === yesterday.getTime()) {
			return "Yesterday";
		} else {
			return d.toLocaleDateString([], {
				weekday: "short",
				month: "short",
				day: "numeric",
			});
		}
	}
</script>

<svelte:head>
	<title>Dashboard | Calzap</title>
</svelte:head>

<main
	class="max-w-md mx-auto px-6 py-8 flex flex-col gap-8 animate-in fade-in duration-300 relative overflow-hidden"
>
	<!-- Ambient Background Glows -->
	<div
		class="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.05)] blur-[120px] pointer-events-none z-0"
	></div>
	<div
		class="absolute bottom-[20%] right-[-10%] w-[70%] h-[50%] rounded-full bg-[oklch(from_var(--color-protein)_l_c_h/0.03)] blur-[160px] pointer-events-none z-0"
	></div>

	<!-- Date Switcher Segmented Control -->
	<header class="flex flex-col gap-6 relative z-10">
		<div
			class="flex items-center justify-between border rounded-2xl p-1.5 shadow-sm transition-all duration-300"
			style="background-color: oklch(from var(--color-calories) l c h / 0.02); border-color: oklch(from var(--color-calories) l c h / 0.1);"
		>
			<button
				type="button"
				onclick={() => changeDate(-1)}
				class="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-[oklch(from_var(--color-calories)_l_c_h/0.08)] transition-colors cursor-pointer text-muted hover:text-(--fg)"
				aria-label="Previous day"
			>
				<span class="material-symbols-outlined text-[20px] select-none leading-none">chevron_left</span>
			</button>

			<span
				class="font-extrabold text-sm tracking-wider uppercase"
				style="color: var(--color-calories);"
			>
				{formatSelectedDate(selectedDate)}
			</span>

			<button
				type="button"
				onclick={() => changeDate(1)}
				class="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-[oklch(from_var(--color-calories)_l_c_h/0.08)] transition-colors cursor-pointer text-muted hover:text-(--fg)"
				aria-label="Next day"
			>
				<span class="material-symbols-outlined text-[20px] select-none leading-none">chevron_right</span>
			</button>
		</div>

		<!-- Calorie Intake Dashboard Card -->
		<div 
			class="p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden"
			style="background-color: oklch(from var(--color-calories) l c h / 0.04); border-color: oklch(from var(--color-calories) l c h / 0.15);"
		>
			<!-- Accent glow inside card -->
			<div class="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.08)] blur-3xl pointer-events-none"></div>

			<button
				type="button"
				onclick={() => {
					showConsumedCal = !showConsumedCal;
				}}
				class="group flex flex-col items-start bg-transparent border-0 p-0 text-left cursor-pointer focus:outline-hidden w-full relative z-10"
			>
				<div
					class="flex items-baseline gap-2 group-hover:opacity-90 transition-opacity"
				>
					{#if showConsumedCal}
						<span
							class="text-6xl font-black tracking-tighter tabular-nums"
							style="color: var(--color-calories)"
						>
							{consumed.calories}
						</span>
						<span class="text-lg font-bold text-muted"
							>/ {dailyTargets.target_calories} kcal</span
						>
					{:else if remainingCalories >= 0}
						<span
							class="text-6xl font-black tracking-tighter tabular-nums"
							style="color: var(--color-calories)"
						>
							{remainingCalories}
						</span>
						<span class="text-lg font-bold text-muted"
							>kcal left</span
						>
					{:else}
						<span
							class="text-6xl font-black tracking-tighter tabular-nums text-rose-500"
						>
							{Math.abs(remainingCalories)}
						</span>
						<span class="text-lg font-bold text-rose-500"
							>kcal over</span
						>
					{/if}
				</div>
				<span
					class="text-[10px] font-black text-muted/60 uppercase tracking-widest mt-1"
				>
					{#if showConsumedCal}
						Showing Total Consumed • Tap to view left
					{:else if remainingCalories >= 0}
						Showing Remaining • Tap to view consumed
					{:else}
						Exceeded Daily Target • Tap to view consumed
					{/if}
				</span>
			</button>
		</div>
	</header>

	<!-- Macros Grid (2x2) -->
	<section class="grid grid-cols-2 gap-4 relative z-10">
		<MacroBar
			label="Protein"
			value={consumed.protein}
			target={dailyTargets.target_proteins}
			unit="g"
			color="var(--color-protein)"
		/>
		<MacroBar
			label="Carbs"
			value={consumed.carbs}
			target={dailyTargets.target_carbs}
			unit="g"
			color="var(--color-carbs)"
		/>
		<MacroBar
			label="Fats"
			value={consumed.fats}
			target={dailyTargets.target_fats}
			unit="g"
			color="var(--color-fats)"
		/>
		<MacroBar
			label="Fiber"
			value={consumed.fiber}
			target={dailyTargets.target_fiber}
			unit="g"
			color="var(--color-fiber)"
		/>
	</section>

	<!-- Logged Today Section -->
	<section class="flex flex-col gap-4 mt-2 animate-in fade-in duration-300 relative z-10">
		<div class="flex items-center justify-between">
			<h2
				class="text-[10px] font-black uppercase tracking-wider text-muted"
			>
				Tracked for this Date ({logsToday.length})
			</h2>
			{#if logsToday.length > 0}
				<span
					class="text-xs font-black text-calories uppercase tracking-tight"
					>{consumed.calories} kcal consumed</span
				>
			{/if}
		</div>

		{#if logsToday.length === 0}
			<div
				class="rounded-3xl border-2 border-dashed p-8 text-center transition-colors duration-300"
				style="background-color: oklch(from var(--color-calories) l c h / 0.015); border-color: oklch(from var(--color-calories) l c h / 0.12);"
			>
				<p class="font-bold text-sm text-muted">No food tracked for this date</p>
				<p class="text-xs text-muted/80 mt-1">
					Tap the <span class="font-black text-calories">+</span> icon to start tracking!
				</p>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each logsToday as entry (entry.id)}
					<div
						id="dashboard-log-{entry.id}"
						class="p-4 rounded-2xl flex flex-col gap-2 relative group transition-all duration-300 border hover:scale-[1.01]"
						style="background-color: oklch(from var(--color-calories) l c h / 0.025); border-color: oklch(from var(--color-calories) l c h / 0.12);"
					>
						<div class="flex items-start justify-between gap-4">
							<div class="flex flex-col">
								<h4
									class="font-bold text-base tracking-tight leading-tight"
								>
									{entry.name}
								</h4>
								<div class="flex items-center gap-2 mt-0.5">
									<span class="text-[10px] text-zinc-400 font-semibold">
										{#if entry.consumed_at}
											{new Date(
												entry.consumed_at,
											).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										{/if}
									</span>
									{#if entry.mealType}
										{@const badgeColors = 
											entry.mealType === 'Breakfast' ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' :
											entry.mealType === 'Lunch' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30' :
											entry.mealType === 'Dinner' ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30' :
											'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30'
										}
										<span class="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border {badgeColors}">
											{entry.mealType}
										</span>
									{/if}
								</div>
							</div>

							<button
								type="button"
								onclick={() => deleteLog(entry.id)}
								class="h-8 w-8 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-(--border) text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
								title="Delete log"
								aria-label="Delete log entry"
							>
								<span class="material-symbols-outlined text-[16px] select-none leading-none">delete</span>
							</button>
						</div>

						<!-- Mini macro labels -->
						<div
							class="flex items-center gap-3 text-xs font-bold text-zinc-500 pt-1.5 border-t border-zinc-100 dark:border-zinc-900"
						>
							<span class="tabular-nums text-calories"
								>{entry.calories} kcal</span
							>
							<span>•</span>
							<span class="text-protein tabular-nums"
								>{entry.proteins}g P</span
							>
							<span>•</span>
							<span class="text-carbs tabular-nums"
								>{entry.carbs}g C</span
							>
							<span>•</span>
							<span class="text-fats tabular-nums"
								>{entry.fats}g F</span
							>
							{#if entry.fiber !== undefined && entry.fiber > 0}
								<span>•</span>
								<span class="text-fiber tabular-nums"
									>{entry.fiber}g Fib</span
								>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</main>

<ConfirmModal
	isOpen={isDeleteModalOpen}
	title="Delete Log Entry"
	message="Are you sure you want to delete this log entry?"
	onConfirm={confirmDelete}
	onCancel={cancelDelete}
/>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
</style>
