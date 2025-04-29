import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const petsPath = path.resolve('static/data/pets.json');
const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request }) => {
	const { userId, petId } = await request.json();
	console.log('Received userId:', userId, 'petId:', petId); // Debugging logs

	const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
	const pets = JSON.parse(fs.readFileSync(petsPath, 'utf-8'));

	const user = users.find((u: any) => u.id === userId);
	const pet = pets.find((p: any) => p.id === petId);

	if (!user) {
		console.log('User not found for userId:', userId);
		return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
	}

	if (!pet) {
		console.log('Pet not found for petId:', petId);
		return new Response(JSON.stringify({ error: 'Pet not found' }), { status: 404 });
	}

	if (pet.adopted) {
		console.log('Pet already adopted:', petId);
		return new Response(JSON.stringify({ error: 'Pet is already adopted' }), { status: 400 });
	}

	if (user.budget < 20) {
		console.log('Insufficient budget for userId:', userId);
		return new Response(JSON.stringify({ error: 'Insufficient budget' }), { status: 400 });
	}

	// Update pet and user data
	pet.adopted = true;
	user.budget -= 20;
	user.pets = user.pets || [];
	user.pets.push(pet);

	// Save changes
	fs.writeFileSync(petsPath, JSON.stringify(pets, null, 2));
	fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

	console.log('Pet adopted successfully:', petId);
	return new Response(JSON.stringify({ success: true, user }), { status: 200 });
};
