import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request }) => {
	const { amount } = await request.json();

	if (!amount || typeof amount !== 'number' || amount <= 0) {
		return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400 });
	}

	const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
	const user = users.find((u: any) => u.id === 2); // Replace with actual user ID logic

	if (!user) {
		return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
	}

	user.budget += amount;

	// Save changes
	fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

	return new Response(JSON.stringify({ user }), { status: 200 });
};
