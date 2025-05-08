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
					const berlinFormatter = new Intl.DateTimeFormat('en-GB', {
						timeZone: 'Europe/Berlin',
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit',
						hour12: false,
					});

					const berlinTimeParts = berlinFormatter.formatToParts(date);
					const berlinDateString = berlinTimeParts
						.map(({ type, value }) => {
							switch (type) {
								case 'day':
									return `${value}`;
								case 'month':
									return `${value}`;
								case 'year':
									return `${value}`;
								case 'hour':
									return `${value}`;
								case 'minute':
									return `${value}`;
								case 'second':
									return `${value}`;
								default:
									return value;
							}
						})
						.join('');

					// ISO String in UTC
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
