import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const logPath = path.resolve('static/data/log.json');

export const GET: RequestHandler = async () => {
	try {
		const logs: string[] = JSON.parse(await fs.readFile(logPath, 'utf-8'));
		return new Response(JSON.stringify(logs), { status: 200 });
	} catch (err) {
		return new Response('Failed to load log.', { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { log } = await request.json();
		if (!log) {
			return new Response('Log content is required.', { status: 400 });
		}

		const logs: string[] = JSON.parse(await fs.readFile(logPath, 'utf-8'));
		logs.push(log);
		await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

		return new Response('Log added successfully.', { status: 201 });
	} catch (err) {
		return new Response('Failed to add log.', { status: 500 });
	}
};
