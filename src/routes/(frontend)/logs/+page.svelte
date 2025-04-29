<script lang="ts">
	import { onMount } from 'svelte';

	let logs: string[] = [];
	let error = '';

	onMount(async () => {
		try {
			const response = await fetch('/api/log');
			if (!response.ok) {
				throw new Error('Failed to fetch logs');
			}
			logs = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		}
	});
</script>

<h1>Action Log</h1>

{#if error}
    <p style="color: red;">{error}</p>
{:else if logs.length === 0}
    <p>No actions have been logged yet.</p>
{:else}
    <ul>
		{#each logs.reverse() as log}
			<li>{log}</li>
		{/each}
	</ul>
{/if}

<style>
ul {
		list-style-type: none;
		padding: 0;
	}
	li {
		margin-bottom: 0.5rem;
	}	
</style>
