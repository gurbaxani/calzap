<script lang="ts">
	import { goto } from '$app/navigation';
	import { foodDraft } from '$lib/foodDraft.svelte';
	const unitsOptions = ["grams", "ml", "oz", "lbs", "cups", "tbsp", "tsp", "pieces", "servings"];

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (foodDraft.quantity > 0) {
			goto('/foods/macros');
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
			onclick={() => goto('/foods')}
			aria-label="Go back to name entry"
			class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
		>
			<span class="material-symbols-outlined text-[20px] select-none leading-none">arrow_back</span>
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
						{#each unitsOptions as unit (unit)}
							<option value={unit}>{unit}</option>
						{/each}
					</select>
					<div class="pointer-events-none absolute inset-y-0 right-4 flex items-center">
						<span class="material-symbols-outlined text-[24px] text-zinc-500 select-none leading-none">keyboard_arrow_down</span>
					</div>
				</div>
			</div>
		</fieldset>

		<!-- Ingredients input field -->
		<div class="flex flex-col gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
			<label for="notes" class="text-xs font-bold uppercase tracking-wider text-zinc-500">Special Ingredients (Optional)</label>
			<input
				type="text"
				id="notes"
				bind:value={foodDraft.notes}
				placeholder="1 tbsp sprouted moong, pnch of moringa powder, mint chutney sweetened with stevia"
				class="w-full rounded-2xl bg-zinc-100/80 px-4 py-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-200 focus:outline-none dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800 dark:placeholder:text-zinc-600 transition-colors"
			/>
		</div>

		<div class="pt-4">
			<button
				type="submit"
				disabled={foodDraft.quantity <= 0}
				class="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 text-lg font-bold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20 active:scale-[0.98]"
			>
				<span>Continue</span>
				<span class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1 select-none leading-none">arrow_forward</span>
			</button>
		</div>
	</form>
</div>
