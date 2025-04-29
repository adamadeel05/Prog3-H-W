<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { currentUser } from '$lib/stores';
	import type { User, Pet } from '$lib/types';
	import { goto } from '$app/navigation';

	const pets = writable<Pet[]>([]);
	const user = writable<User | null>(null);
	const message = writable<string | null>(null); // Store for action messages
	let addBudgetAmount = 0; // Input field for adding budget

	onMount(async () => {
		const userId = $currentUser?.id; // Ensure this is correct
		if (!userId) {
			goto('/login');
			return;
		}

		const res = await fetch(`/api/user-data?userId=${userId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});

		if (!res.ok) {
			const error = await res.json();
			alert(error.error || 'Failed to fetch user data.');
			goto('/login');
			return;
		}

		const data = await res.json();
		user.set(data.user);
		pets.set(data.user.pets);

		if (!data.user) {
			goto('/login');
		}
	});

	async function updatePet(petId: number, action: 'feed' | 'play' | 'return') {
		try {
			const res = await fetch(`/api/pets/${petId}`, {
				method: 'PATCH',
				body: JSON.stringify({ action }),
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				const data = await res.json();
				user.set(data.user);
				pets.set(data.user.pets);
			} else {
				const error = await res.json();
				if (error.error === 'Out of items and budget') {
					goto('/shop'); // Redirect to shop if out of items and budget
				} else {
					alert(error.error || 'Failed to update pet.');
				}
			}
		} catch (err) {
			alert('An error occurred while updating the pet.');
		}
	}

	async function addMoney() {
		if (addBudgetAmount <= 0) {
			alert('Please enter a valid amount.');
			return;
		}

		try {
			const res = await fetch('/api/user-data/add-money', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount: addBudgetAmount })
			});

			if (res.ok) {
				const data = await res.json();
				user.set(data.user);
				alert(`Successfully added $${addBudgetAmount} to your budget!`);
				addBudgetAmount = 0; // Reset input field
			} else {
				const error = await res.json();
				alert(error.error || 'Failed to add money.');
			}
		} catch (err) {
			alert('An error occurred while adding money.');
		}
	}
</script>

<h1>Your Pets</h1>

{#if $message}
	<p style="color: green;">{$message}</p>
{/if}

{#if $user}
	<p>Budget: ${$user.budget}</p>
	{#if $user.budget === 0}
		<div>
			<label>
				Add Budget:
				<input type="number" bind:value={addBudgetAmount} min="1" />
			</label>
			<button on:click={addMoney}>Add Money</button>
		</div>
	{/if}
	<ul>
		{#each $pets as pet}
			<li>
				<h2>{pet.name}</h2>
				<p>Hunger: {pet.hunger}</p>
				<p>Happiness: {pet.happiness}</p>
				<button on:click={() => updatePet(pet.id, 'feed')}>Feed (-$5)</button>
				<button on:click={() => updatePet(pet.id, 'play')}>Play (-$10)</button>
				<button on:click={() => updatePet(pet.id, 'return')}>Return (-$20)</button>
			</li>
		{/each}
	</ul>
{/if}

<style>
	button {
		margin-right: 0.5rem;
	}
	p {
		margin-bottom: 1rem;
	}
	div {
		margin-bottom: 1rem;
	}
</style>
