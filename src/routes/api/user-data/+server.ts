import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const usersPath = path.resolve('static/data/users.json');

export const GET: RequestHandler = async ({ url, request }) => {
	const userId = url.searchParams.get('userId') || request.headers.get('x-user-id');
	console.log('Received userId:', userId); // Log the received userId

	if (!userId) {
		return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
	}

	const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
	console.log('Loaded users:', users); // Log the loaded users

	const user = users.find((u: any) => u.id === parseInt(userId));
	if (!user) {
		console.log('User not found for userId:', userId); // Log if user is not found
		return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
	}

	return new Response(JSON.stringify({ user }), { status: 200 });
};