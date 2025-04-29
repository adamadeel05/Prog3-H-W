<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores';

	interface Pet {
		id: number;
		name: string;
		type: string;
		age: number;
		adopted: boolean;
	}

	let pets: Pet[] = [];
	let error = '';
	$: user = $currentUser;

	async function loadPets() {
		try {
			const response = await fetch('/api/pets');
			if (!response.ok) {
				throw new Error('Failed to load pets');
			}
			pets = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		}
	}

	async function handleAdopt(petId: number) {
		const userId = $currentUser?.id; // Ensure this is correct
		if (!userId) {
			alert('You must be logged in to adopt a pet.');
			goto('/login');
			return;
		}

		try {
			const res = await fetch('/api/adopt', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, petId })
			});

			if (!res.ok) {
				const error = await res.json();
				alert(error.error || 'Failed to adopt pet.');
				return;
			}

			alert('Pet adopted successfully!');
			await loadPets(); // Refresh the pet list
		} catch (err) {
			alert('An error occurred while adopting the pet.');
		}
	}

	onMount(loadPets);
</script>

<h1>Welcome to the Pet Adoption Center</h1>

{#if error}
	<p style="color: red;">{error}</p>
{:else if pets.length === 0}
	<p>No pets available for adoption.</p>
{:else}
	<ul>
		{#each pets as pet}
			<li>
				<h2>{pet.name} ({pet.type})</h2>
				<p>Age: {pet.age}</p>
				<p>Status: {pet.adopted ? 'Adopted' : 'Available'}</p>
				{#if !pet.adopted}
					<button on:click={() => handleAdopt(pet.id)}>Adopt</button>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
</style>
