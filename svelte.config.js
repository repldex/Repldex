import preprocess from 'svelte-preprocess'

import staticAdapter from '@sveltejs/adapter-static'
import vercelAdapter from '@sveltejs/adapter-vercel'

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
		adapter: staticAdapter(),

		// https://vitejs.dev/config/
		vite: {
			plugins: [minifyHtml()],
		},
	},

	// https://svelte.dev/docs#svelte_compile
	compilerOptions: {
		// enable ssr
		generate: 'ssr',
	},
}

export default config
