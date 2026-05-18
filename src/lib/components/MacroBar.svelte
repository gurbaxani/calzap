<script lang="ts">
	interface Props {
		label: string;
		value: number;
		target: number;
		unit: string;
		color: string;
	}

	let { label, value, target, unit, color }: Props = $props();

	let percentage = $derived(Math.min((value / target) * 100, 100));
	let remaining = $derived(target - value);
</script>

<div 
	class="flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 group hover:scale-[1.01] active:scale-[0.99] hover:shadow-sm"
	style="background-color: oklch(from {color} l c h / 0.04); border-color: oklch(from {color} l c h / 0.15);"
>
	<div class="flex justify-between items-start mb-3">
		<div class="flex items-center gap-1.5">
			<span class="w-2.5 h-2.5 rounded-full" style="background-color: {color};"></span>
			<span class="text-[10px] font-black uppercase tracking-wider" style="color: {color};">{label}</span>
		</div>
	</div>
	
	<div class="flex flex-col gap-0.5 mb-4">
		<div class="flex items-baseline gap-1 tabular-nums">
			<span class="text-2xl font-black tracking-tight">{Math.round(value)}</span>
			<span class="text-sm font-bold text-muted">{unit}</span>
		</div>
		<div class="text-[9px] font-bold text-muted uppercase tracking-tight">
			of {target}{unit} target
		</div>
	</div>

	<div class="flex flex-col gap-2">
		<!-- Progress Bar -->
		<div class="h-1.5 w-full rounded-full overflow-hidden" style="background-color: oklch(from {color} l c h / 0.1);">
			<div 
				class="h-full rounded-full transition-all duration-700 ease-out"
				style="width: {percentage}%; background-color: {color};"
			></div>
		</div>

		<!-- Remaining Stats -->
		<div class="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
			{#if remaining >= 0}
				<span class="text-muted">{Math.round(remaining)}{unit} left</span>
			{:else}
				<span class="text-rose-500">{Math.abs(Math.round(remaining))}{unit} over</span>
			{/if}
			<span class="text-muted/60">{Math.round(percentage)}%</span>
		</div>
	</div>
</div>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
</style>
