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
</script>

<div class="flex flex-col gap-2">
	<div class="flex justify-between items-baseline">
		<span class="text-sm font-semibold tracking-tight text-muted">{label}</span>
		<div class="flex items-baseline gap-1 tabular-nums">
			<span class="text-lg font-bold">{Math.round(value)}</span>
			<span class="text-xs text-muted">/ {target}{unit}</span>
		</div>
	</div>
	
	<div class="h-2 w-full rounded-full bg-[var(--border)] overflow-hidden">
		<div 
			class="h-full rounded-full transition-all duration-500 ease-out"
			style="width: {percentage}%; background-color: {color};"
		></div>
	</div>
</div>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
</style>
