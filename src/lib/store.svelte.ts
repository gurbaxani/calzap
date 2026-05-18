import { browser } from '$app/environment';

export interface Food {
	id: string;
	name: string;
	calories: number;
	proteins: number;
	carbs: number;
	fats: number;
	fiber: number;
	quantity: number;
	units: string;
	notes?: string;
}

export interface FoodLog {
	id: string;
	name: string;
	calories: number;
	proteins: number;
	carbs: number;
	fats: number;
	fiber: number;
	consumed_at: string;
}

export interface UserStats {
	target_calories: number;
	target_proteins: number;
	target_carbs: number;
	target_fats: number;
	target_fiber: number;
	target_weight: number;
	current_weight: number;
}

function generateId() {
	return Math.random().toString(36).substring(2, 9);
}

class Store {
	foods = $state<Food[]>([]);
	foodLogs = $state<FoodLog[]>([]);
	userStats = $state<UserStats>({
		target_calories: 2500,
		target_proteins: 180,
		target_carbs: 250,
		target_fats: 70,
		target_fiber: 35,
		target_weight: 70,
		current_weight: 70,
	});

	constructor() {
		if (browser) {
			const storedFoods = localStorage.getItem('foods');
			if (storedFoods) this.foods = JSON.parse(storedFoods);

			const storedLogs = localStorage.getItem('foodLogs');
			if (storedLogs) this.foodLogs = JSON.parse(storedLogs);

			const storedStats = localStorage.getItem('userStats');
			if (storedStats) this.userStats = JSON.parse(storedStats);
		}
	}

	save() {
		if (browser) {
			localStorage.setItem('foods', JSON.stringify(this.foods));
			localStorage.setItem('foodLogs', JSON.stringify(this.foodLogs));
			localStorage.setItem('userStats', JSON.stringify(this.userStats));
		}
	}

	addFood(food: Omit<Food, "id">) {
		const newFood = { ...food, id: generateId() };
		this.foods.push(newFood);
		this.save();
	}

	deleteFood(id: string) {
		this.foods = this.foods.filter(f => f.id !== id);
		this.save();
	}

	addFoodLog(log: Omit<FoodLog, "id">) {
		const newLog = { ...log, id: generateId() };
		this.foodLogs.push(newLog);
		this.save();
	}

	deleteFoodLog(id: string) {
		this.foodLogs = this.foodLogs.filter(l => l.id !== id);
		this.save();
	}

	updateUserStats(stats: Partial<UserStats>) {
		this.userStats = { ...this.userStats, ...stats };
		this.save();
	}

	exportCSV() {
		if (!browser) return;
		const now = new Date();
		const currentMonthLogs = this.foodLogs.filter(log => {
			const logDate = new Date(log.consumed_at);
			return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
		});

		const headers = ["Date", "Name", "Calories", "Protein (g)", "Carbs (g)", "Fats (g)", "Fiber (g)"];
		const rows = currentMonthLogs.map(log => [
			new Date(log.consumed_at).toLocaleString(),
			`"${log.name}"`,
			log.calories,
			log.proteins,
			log.carbs,
			log.fats,
			log.fiber
		]);

		const csvContent = "data:text/csv;charset=utf-8," 
			+ [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `calzap_logs_${now.getFullYear()}_${now.getMonth() + 1}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

export const store = new Store();
