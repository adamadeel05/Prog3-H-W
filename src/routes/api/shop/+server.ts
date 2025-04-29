import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request }) => {
	const { item } = await request.json();
	const itemCosts = { food: 5, toy: 10, treat: 15 };

	if (!itemCosts[item]) {
		return new Response(JSON.stringify({ error: 'Invalid item' }), { status: 400 });
	}

	const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
	const user = users.find((u: any) => u.id === 2); // Replace with actual user ID logic

	if (!user) {
		return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
	}

	if (user.budget < itemCosts[item]) {
		return new Response(JSON.stringify({ error: 'Insufficient budget' }), { status: 400 });
	}

	// Deduct cost and update inventory
	user.budget -= itemCosts[item];
	user.inventory = user.inventory || { food: 0, toy: 0, treat: 0 };
	user.inventory[item] += 1;

	// Save changes
	fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

	return new Response(JSON.stringify({ inventory: user.inventory, budget: user.budget }), { status: 200 });
};
