<script lang="ts">
	import MacroBar from '$lib/components/MacroBar.svelte';

	// Mock state for demonstration
	let dailyTargets = $state({
		calories: 2500,
		protein: 180,
		carbs: 250,
		fats: 70,
		fiber: 35
	});

	let consumed = $state({
		calories: 1450,
		protein: 110,
		carbs: 160,
		fats: 45,
		fiber: 22
	});

	let remainingCalories = $derived(dailyTargets.calories - consumed.calories);
</script>

<svelte:head>
	<title>Dashboard | Food Factor</title>
</svelte:head>

<main class="max-w-md mx-auto px-6 py-12 flex flex-col gap-12">
	<!-- Header / Summary -->
	<header class="flex flex-col gap-1">
		<h1 class="text-sm font-bold tracking-widest uppercase text-muted">Daily Summary</h1>
		<div class="flex items-baseline gap-2">
			<span class="text-6xl font-black tracking-tighter tabular-nums" style="color: var(--color-calories)">
				{remainingCalories}
			</span>
			<span class="text-xl font-bold text-muted">kcal left</span>
		</div>
	</header>

	<!-- Macros Grid -->
	<section class="grid gap-8">
		<MacroBar 
			label="Protein" 
			value={consumed.protein} 
			target={dailyTargets.protein} 
			unit="g" 
			color="var(--color-protein)" 
		/>
		<MacroBar 
			label="Carbs" 
			value={consumed.carbs} 
			target={dailyTargets.carbs} 
			unit="g" 
			color="var(--color-carbs)" 
		/>
		<MacroBar 
			label="Fats" 
			value={consumed.fats} 
			target={dailyTargets.fats} 
			unit="g" 
			color="var(--color-fats)" 
		/>
		<MacroBar 
			label="Fiber" 
			value={consumed.fiber} 
			target={dailyTargets.fiber} 
			unit="g" 
			color="var(--color-fiber)" 
		/>
	</section>

	<!-- Actions -->
	<section class="flex flex-col gap-4 mt-4">
		<button 
			type="button"
			class="w-full py-4 rounded-2xl bg-[var(--fg)] text-[var(--bg)] font-bold text-lg shadow-xl shadow-black/10 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
			Log Meal
		</button>
		
		<div class="grid grid-cols-2 gap-4">
			<button 
				type="button"
				class="py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] font-semibold text-sm active:scale-[0.98] transition-transform"
			>
				Quick Add
			</button>
			<button 
				type="button"
				class="py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] font-semibold text-sm active:scale-[0.98] transition-transform"
			>
				Scanner
			</button>
		</div>
	</section>
</main>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
</style>
