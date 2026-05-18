<script lang="ts">
	interface Props {
		id: string;
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		unit: string;
		colorClass: 'calories' | 'protein' | 'carbs' | 'fats' | 'fiber';
		description?: string;
		kcalFactor?: number;
		onchange?: () => void;
	}

	let {
		id,
		label,
		value = $bindable(),
		min,
		max,
		step = 1,
		unit,
		colorClass,
		description,
		kcalFactor = 0,
		onchange
	}: Props = $props();
</script>

<div class="space-y-2">
	<div class="flex justify-between items-center text-xs font-bold">
		<label for={id} class="text-{colorClass} flex items-center gap-1.5 cursor-pointer">
			<span class="w-2 h-2 rounded-full bg-{colorClass}"></span>
			{label}
		</label>
		<div class="flex items-baseline gap-1">
			<input 
				type="number" 
				{id}
				bind:value={value} 
				{min}
				{max}
				{step}
				required
				oninput={onchange}
				class="w-12 text-right bg-transparent font-extrabold text-{colorClass} focus:outline-none" 
			/>
			<span class="text-[10px] text-{colorClass}/75">{unit}</span>
			{#if kcalFactor > 0}
				<span class="text-[10px] text-muted font-medium ml-1">({value * kcalFactor} kcal)</span>
			{/if}
		</div>
	</div>
	{#if description}
		<p class="text-[10px] text-muted font-semibold mt-0.5 leading-relaxed">{description}</p>
	{/if}
	<input
		type="range"
		bind:value={value}
		{min}
		{max}
		{step}
		oninput={onchange}
		class="w-full accent-{colorClass} cursor-pointer h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700"
	/>
</div>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
</style>
