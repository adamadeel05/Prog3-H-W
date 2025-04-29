<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores';

	let name = '';
	let password = '';
	let confirmPassword = '';
	let error = '';

	async function handleRegister() {
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		const response = await fetch('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, password })
		});

		const data = await response.json();
		if (response.ok) {
			currentUser.set(data.user);
			goto('/dashboard');
		} else {
			error = data.error || 'Registration failed';
		}
	}
</script>

<h1>Register</h1>

<form on:submit|preventDefault={handleRegister}>
	<label>
		Name:
		<input type="text" bind:value={name} required />
	</label>
	<label>
		Password:
		<input type="password" bind:value={password} required />
	</label>
	<label>
		Confirm Password:
		<input type="password" bind:value={confirmPassword} required />
	</label>
	<button type="submit">Register</button>
</form>

{#if error}
	<p style="color: red;">{error}</p>
{/if}