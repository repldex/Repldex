import preprocess from 'svelte-preprocess'

import staticAdapter from '@sveltejs/adapter-static'
import vercelAdapter from '@sveltejs/adapter-vercel'
import nodeAdapter from '@sveltejs/adapter-node'

import { minifyHtml } from 'vite-plugin-html'

import dotenv from 'dotenv'

dotenv.config()

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: nodeAdapter(),

		// https://vitejs.dev/config/
		vite: {
			plugins: [minifyHtml()],
			build: {
				rollupOptions: {
					external: ['discord-api-types/payloads/v9', 'discord-api-types', 'discord-api-types/v9'],
				},
			},
		},
	},

	// https://svelte.dev/docs#svelte_compile
	compilerOptions: {
		// enable ssr
		generate: 'ssr',
	},
}

export default config
