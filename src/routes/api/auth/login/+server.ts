import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request }) => {
	const { name, password } = await request.json();

	const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
	const user = users.find((u: any) => u.name === name);

	if (!user) {
		return new Response(JSON.stringify({ redirect: '/register', error: 'User not found' }), { status: 404 });
	}

	const isValid = await bcrypt.compare(password, user.passwordHash);
	if (!isValid) {
		return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
	}

	const safeUser = { id: user.id, name: user.name, role: user.role };
	return new Response(JSON.stringify({ user: safeUser }), { status: 200 });
};
