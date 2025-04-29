import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request }) => {
	const { name, password } = await request.json();

	const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
	if (users.find((u: any) => u.name === name)) {
		return new Response(JSON.stringify({ error: 'Username already exists' }), { status: 400 });
	}

	const passwordHash = await bcrypt.hash(password, 10);
	const newUser = {
		id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
		name,
		passwordHash,
		role: 'user',
		budget: 100, // Default budget for new users
		inventory: { food: 0, toy: 0, treat: 0 }, // Default inventory
		pets: [] // Default empty pets array
	};

	users.push(newUser);
	fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

	const safeUser = { id: newUser.id, name: newUser.name, role: newUser.role };
	return new Response(JSON.stringify({ user: safeUser }), { status: 201 });
};