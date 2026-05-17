<script lang="ts">
	import { goto } from '$app/navigation';
	import { foodDraft } from '$lib/foodDraft.svelte';
	import { FoodsUnitsOptions } from '../../../../pocketbase-types';

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (foodDraft.quantity > 0) {
			goto('/add/macros');
		}
	}
</script>

<div class="mx-auto max-w-lg pb-12 pt-4 px-4 sm:px-6 md:pt-8">
	<header class="mb-8 flex items-center justify-between">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
				Set Quantity
			</h1>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">
				Step 2 of 3
			</p>
		</div>
		
		<button 
			type="button" 
			onclick={() => goto('/add')}
			class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
		>
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
			</svg>
		</button>
	</header>

	<form onsubmit={handleSubmit} class="flex flex-col gap-6">
		<fieldset class="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
			<div class="flex flex-col gap-2">
				<label for="quantity" class="text-xs font-bold uppercase tracking-wider text-zinc-500">Quantity</label>
				<input
					type="number"
					id="quantity"
					bind:value={foodDraft.quantity}
					min="0"
					step="0.1"
					autofocus
					class="w-full rounded-2xl bg-zinc-100/80 px-4 py-4 text-2xl font-bold text-zinc-900 focus:bg-zinc-200 focus:outline-none dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800 transition-colors"
				/>
			</div>
			
			<div class="flex flex-col gap-2">
				<label for="units" class="text-xs font-bold uppercase tracking-wider text-zinc-500">Units</label>
				<div class="relative">
					<select
						id="units"
						bind:value={foodDraft.units}
						class="w-full appearance-none rounded-2xl bg-zinc-100/80 px-4 py-4 text-2xl font-bold text-zinc-900 focus:bg-zinc-200 focus:outline-none dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800 transition-colors"
					>
						{#each Object.values(FoodsUnitsOptions) as unit (unit)}
							<option value={unit}>{unit}</option>
						{/each}
					</select>
					<div class="pointer-events-none absolute inset-y-0 right-4 flex items-center">
						<svg class="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
						</svg>
					</div>
				</div>
			</div>
		</fieldset>

		<div class="pt-4">
			<button
				type="submit"
				disabled={foodDraft.quantity <= 0}
				class="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 text-lg font-bold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20 active:scale-[0.98]"
			>
				<span>Continue</span>
				<svg class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</button>
		</div>
	</form>
</div>
