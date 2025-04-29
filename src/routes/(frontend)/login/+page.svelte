<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores';

	let name = '';
	let password = '';
	let error = '';

	async function handleLogin() {
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, password })
			});

			const data = await response.json();
			if (response.ok) {
				currentUser.set(data.user);

				// Redirect to admin page if the user is an admin
				if (data.user.role === 'admin') {
					goto('/admin');
				} else {
					goto('/dashboard');
				}
			} else if (data.redirect) {
				goto(data.redirect);
			} else {
				error = data.error || 'Login failed';
			}
		} catch (err) {
			error = 'An error occurred during login.';
		}
	}
</script>

<h1>Login</h1>

<form on:submit|preventDefault={handleLogin}>
	<label>
		Name:
		<input type="text" bind:value={name} required />
	</label>
	<label>
		Password:
		<input type="password" bind:value={password} required />
	</label>
	<button type="submit">Login</button>
</form>

{#if error}
	<p style="color: red;">{error}</p>
{/if}