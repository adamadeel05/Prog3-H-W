import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';

const petsPath = path.resolve('static/data/pets.json');

export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type');

	const pets = JSON.parse(fs.readFileSync(petsPath, 'utf-8'));
	const filteredPets = type ? pets.filter((pet: any) => pet.type === type) : pets;

	return new Response(JSON.stringify(filteredPets), { status: 200 });
};

export const POST: RequestHandler = async ({ request }) => {
	const { name, type, age } = await request.json();

	if (!name || !type || !age || isNaN(age)) {
		return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
	}

	const pets = JSON.parse(fs.readFileSync(petsPath, 'utf-8'));
	const newPet = {
		id: pets.length > 0 ? pets[pets.length - 1].id + 1 : 1,
		name,
		type,
		age: parseInt(age, 10),
		hunger: 50,
		happiness: 50,
		adopted: false
	};

	pets.push(newPet);
	fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2));

	return new Response(JSON.stringify({ success: true, pet: newPet }), { status: 201 });
};

// TODO: Handle GET and POST requests for pets
