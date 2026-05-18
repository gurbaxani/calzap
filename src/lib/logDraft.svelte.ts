import type { Food } from './store.svelte';

export const logDraft = $state({
	mealType: '' as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | '',
	selectedFood: null as Food | null,
	quantity: 100,
});

export function resetLogDraft() {
	logDraft.mealType = '';
	logDraft.selectedFood = null;
	logDraft.quantity = 100;
}
