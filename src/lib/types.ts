export interface User {
	id: number;
	name: string;
	budget: number;
	passwordHash: string;
	pets: Pet[];
}

export interface SafeUser {
	id: number;
	name: string;
	role: string; // Added role property to SafeUser
}

export interface  Pet{
	id: number;
	name: string;
	hunger: number;
	happiness: number;
	adopted: boolean;
	ownerId?: number; // Optional, as it may not be adopted yet
}