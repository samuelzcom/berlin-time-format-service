/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		switch (url.pathname) {
			case '/api/berlin-time':
				// takes an optional datetime parameter as input
				// returns a JSON object with berlinTime as berlin time
				const datetimeParam = url.searchParams.get('datetime') || new Date().toISOString();

				if (datetimeParam) {
					const date = new Date(datetimeParam);
					if (isNaN(date.getTime())) {
						return new Response('Invalid date format', { status: 400 });
					}

					// Convert to Berlin time
					const berlinTimeZone = 'Europe/Berlin';
					const berlinIsoString = new Intl.DateTimeFormat('sv-SE', {
						timeZone: berlinTimeZone,
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit',
						hour12: false,
					})
						.format(date)
						.replace(' ', 'T');

					// Get Berlin offset in minutes
					const berlinOffset = new Date()
						.toLocaleTimeString('en-us', {
							timeZone: berlinTimeZone,
							timeZoneName: 'shortOffset',
						})
						.split(' ')[2];

					// Convert offset to correct ISO format
					const offsetSign = berlinOffset.startsWith('-') ? '-' : '+';
					const offsetParts = berlinOffset.replace(/[A-Z]/g, '').split(':');
					const offsetHours = String(Math.abs(parseInt(offsetParts[0], 10))).padStart(2, '0');
					const offsetMinutes = offsetParts[1] ? String(Math.abs(parseInt(offsetParts[1], 10))).padStart(2, '0') : '00';
					const berlinOffsetFormatted = `${offsetSign}${offsetHours}:${offsetMinutes}`;

					// Combine ISO date and offset
					const berlinDateString = `${berlinIsoString}${berlinOffsetFormatted}`;
					const isoTime = date.toISOString();

					return new Response(JSON.stringify({ isoTime, berlinDateString }), { status: 200 });
				}

				return new Response('Internal Server Error', { status: 500 });
			case '/api/message':
				return new Response('Hello, World!');
			case '/api/random':
				return new Response(crypto.randomUUID());
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
