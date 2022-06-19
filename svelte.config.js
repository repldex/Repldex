import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import dotenv from 'dotenv'
dotenv.config()

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),

		// https://vitejs.dev/config/
		vite: {
			build: {
				rollupOptions: {
					external: ['discord-api-types/payloads/v9', 'discord-api-types', 'discord-api-types/v9'],
					output: {
						manualChunks: undefined,
					},
				},
			},
			// if the user is on replit or gitpod, use a secure websocket
			server:
				process.env.REPL_ID || process.env.GITPOD_WORKSPACE_ID
					? {
							hmr: {
								protocol: 'wss',
								port: 443,
							},
					  }
					: {},
		},
	},
}

export default config
