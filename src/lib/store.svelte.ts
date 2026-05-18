import { browser } from '$app/environment';
import { dbManager } from './db';

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
	google_ai_studio_api_key?: string;
}

function generateId() {
	return Math.random().toString(36).substring(2, 9);
}

class Store {
	foods = $state<Food[]>([]);
	foodLogs = $state<FoodLog[]>([]);
	userStats = $state<UserStats>({
		target_calories: 2000,
		target_proteins: 150,
		target_carbs: 200,
		target_fats: 65,
		target_fiber: 30,
		target_weight: 70,
		current_weight: 70,
		google_ai_studio_api_key: '',
	});

	constructor() {
		if (browser) {
			// Async load fully complete database from IndexedDB to ensure consistency & durability
			this.loadIndexedDB();
		}
	}

	async loadIndexedDB() {
		if (!dbManager) return;
		try {
			const idbFoods = await dbManager.getFoods();
			if (idbFoods && idbFoods.length > 0) {
				this.foods = idbFoods;
			}

			const idbLogs = await dbManager.getFoodLogs();
			if (idbLogs && idbLogs.length > 0) {
				this.foodLogs = idbLogs;
			}

			const idbStats = await dbManager.getUserStats();
			if (idbStats) {
				this.userStats = idbStats;
			}
		} catch (err) {
			console.error("Failed to load from IndexedDB:", err);
		}
	}

	save() {
		if (browser && dbManager) {
			// Write strictly to IndexedDB
			dbManager.saveFoods(this.foods).catch(console.error);
			dbManager.saveFoodLogs(this.foodLogs).catch(console.error);
			dbManager.saveUserStats(this.userStats).catch(console.error);
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

	exportBackup() {
		if (!browser) return;
		const backupData = {
			version: 1,
			foods: this.foods,
			foodLogs: this.foodLogs,
			userStats: this.userStats,
			exportedAt: new Date().toISOString()
		};

		const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `calzap_backup_${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	async importBackup(jsonData: string): Promise<boolean> {
		try {
			const parsed = JSON.parse(jsonData);
			if (!parsed || typeof parsed !== 'object') return false;

			// Simple validation
			if (parsed.foods && Array.isArray(parsed.foods)) {
				this.foods = parsed.foods;
			}
			if (parsed.foodLogs && Array.isArray(parsed.foodLogs)) {
				this.foodLogs = parsed.foodLogs;
			}
			if (parsed.userStats && typeof parsed.userStats === 'object') {
				this.userStats = { ...this.userStats, ...parsed.userStats };
			}

			this.save();
			return true;
		} catch (err) {
			console.error("Failed to import backup:", err);
			return false;
		}
	}
}

export const store = new Store();
