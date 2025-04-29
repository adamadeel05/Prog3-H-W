import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const petsPath = path.resolve('static/data/pets.json');
const usersPath = path.resolve('static/data/users.json');
const logPath = path.resolve('static/data/log.json');

function logAction(action: string) {
	const logs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
	logs.push(action);
	fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
}

export const PATCH: RequestHandler = async ({ params, request }) => {
	if (!params.id) {
		return new Response(JSON.stringify({ error: 'Pet ID is required' }), { status: 400 });
	}

	const petId = parseInt(params.id);
	if (isNaN(petId)) {
		return new Response(JSON.stringify({ error: 'Invalid Pet ID' }), { status: 400 });
	}

	const { action } = await request.json();

	const pets = JSON.parse(fs.readFileSync(petsPath, 'utf-8'));
	const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

	const pet = pets.find((p: any) => p.id === petId);
	if (!pet) {
		return new Response(JSON.stringify({ error: 'Pet not found' }), { status: 404 });
	}

	const user = users.find((u: any) => u.pets.some((p: any) => p.id === petId));
	if (!user) {
		return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
	}

	// Validate user's budget
	if (typeof user.budget !== 'number' || user.budget < 0) {
		return new Response(JSON.stringify({ error: 'Invalid or insufficient budget' }), { status: 400 });
	}

	if (action === 'feed') {
		if (user.budget < 5) {
			return new Response(JSON.stringify({ error: 'Insufficient budget' }), { status: 400 });
		}
		pet.hunger = Math.max(0, pet.hunger - 20);
		user.budget -= 5;
		logAction(`${user.name} fed ${pet.name} (−$5)`);
	} else if (action === 'play') {
		if (user.budget < 10) {
			return new Response(JSON.stringify({ error: 'Insufficient budget' }), { status: 400 });
		}
		pet.happiness = Math.min(100, pet.happiness + 30);
		user.budget -= 10;
		logAction(`${user.name} played with ${pet.name} (−$10)`);
	} else if (action === 'return') {
		if (user.budget < 20) {
			return new Response(JSON.stringify({ error: 'Insufficient budget' }), { status: 400 });
		}
		user.pets = user.pets.filter((p: any) => p.id !== petId);
		pets.splice(pets.indexOf(pet), 1);
		user.budget -= 20;
		logAction(`${user.name} returned ${pet.name} (−$20)`);
	} else {
		return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
	}

	fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2));
	fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

	return new Response(JSON.stringify({ user }), { status: 200 });
};