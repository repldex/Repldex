import preprocess from 'svelte-preprocess'

import staticAdapter from '@sveltejs/adapter-static'
import vercelAdapter from '@sveltejs/adapter-vercel'

import css from 'rollup-plugin-css-only'
import { minifyHtml } from 'vite-plugin-html'

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
			plugins: [css({ output: 'bundle.css' }), minifyHtml()],
		},
	},

	// https://svelte.dev/docs#svelte_compile
	compilerOptions: {
		// enable ssr
		generate: 'ssr',
	},
}

export default config
