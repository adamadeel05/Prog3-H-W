<script lang="ts">
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let inventory = { food: 0, toy: 0, treat: 0 };
	let budget = 0;
	let error = '';
	let success = '';

	onMount(() => {
		currentUser.subscribe((user) => {
			if (!user) {
				goto('/login');
				return;
			}
			inventory = user.inventory || { food: 0, toy: 0, treat: 0 };
			budget = user.budget || 0;
		});
	});

	async function buyItem(item: 'food' | 'toy' | 'treat') {
		try {
			const response = await fetch('/api/shop', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ item })
			});

			if (response.ok) {
				const data = await response.json();
				inventory = data.inventory;
				budget = data.budget;
				success = `Successfully bought ${item}!`;
			} else {
				const data = await response.json();
				error = data.error || 'Failed to buy item.';
			}
		} catch (err) {
			error = 'An error occurred while buying the item.';
		} finally {
			setTimeout(() => {
				error = '';
				success = '';
			}, 3000); // Clear messages after 3 seconds
		}
	}
</script>

<h1>Shop</h1>

<p>Budget: ${budget}</p>

<ul>
	<li>Food: {inventory.food} <button on:click={() => buyItem('food')}>Buy Food (-$5)</button></li>
	<li>Toy: {inventory.toy} <button on:click={() => buyItem('toy')}>Buy Toy (-$10)</button></li>
	<li>Treat: {inventory.treat} <button on:click={() => buyItem('treat')}>Buy Treat (-$15)</button></li>
</ul>

{#if error}
	<p style="color: red;">{error}</p>
{/if}

{#if success}
	<p style="color: green;">{success}</p>
{/if}

<style>
	button {
		margin-left: 1rem;
	}
</style>
