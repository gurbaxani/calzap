import { FoodsUnitsOptions } from '../../pocketbase-types';

export const foodDraft = $state({
	name: '',
	quantity: 100,
	units: FoodsUnitsOptions.grams,
	calories: undefined as number | undefined,
	proteins: undefined as number | undefined,
	carbs: undefined as number | undefined,
	fats: undefined as number | undefined,
	fiber: undefined as number | undefined,
	notes: '',
});

export function resetFoodDraft() {
	foodDraft.name = '';
	foodDraft.quantity = 100;
	foodDraft.units = FoodsUnitsOptions.grams;
	foodDraft.calories = undefined;
	foodDraft.proteins = undefined;
	foodDraft.carbs = undefined;
	foodDraft.fats = undefined;
	foodDraft.fiber = undefined;
	foodDraft.notes = '';
}
