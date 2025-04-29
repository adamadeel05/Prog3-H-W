<script lang="ts">
	import { currentUser } from '$lib/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let name = '';
	let type = '';
	let age = '';
	let error = '';
	let success = '';

	onMount(() => {
		currentUser.subscribe((user) => {
			if (!user || user.role !== 'admin') {
				goto('/'); // Redirect non-admin users
			}
		});
	});

	async function addPet() {
		try {
			const response = await fetch('/api/pets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, type, age: parseInt(age, 10) })
			});

			if (response.ok) {
				success = 'Pet added successfully!';
				name = '';
				type = '';
				age = '';
			} else {
				const data = await response.json();
				error = data.error || 'Failed to add pet.';
			}
		} catch (err) {
			error = 'An error occurred while adding the pet.';
		} finally {
			setTimeout(() => {
				error = '';
				success = '';
			}, 3000); // Clear messages after 3 seconds
		}
	}
</script>

<h1>Admin Panel</h1>

<form on:submit|preventDefault={addPet}>
	<label>
		Name:
		<input type="text" bind:value={name} required />
	</label>
	<label>
		Type:
		<input type="text" bind:value={type} required />
	</label>
	<label>
		Age:
		<input type="number" bind:value={age} required />
	</label>
	<button type="submit">Add Pet</button>
</form>

{#if error}
	<p style="color: red;">{error}</p>
{/if}

{#if success}
	<p style="color: green;">{success}</p>
{/if}

<style>
	form {
		display: grid;
		gap: 0.75rem;
		max-width: 300px;
	}
	button {
		padding: 0.5rem;
		font-size: 1rem;
	}
</style>
