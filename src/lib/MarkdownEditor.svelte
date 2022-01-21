<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'
	import { browser } from '$app/env'
	import {
		keymap,
		highlightSpecialChars,
		drawSelection,
		highlightActiveLine,
		EditorView,
		ViewPlugin
	} from '@codemirror/view'
	import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
	import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
	import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
	import { rectangularSelection } from '@codemirror/rectangular-selection'
	import { EditorState, Compartment, Extension } from '@codemirror/state'
	import { defaultKeymap, indentWithTab } from '@codemirror/commands'
	import { defaultHighlightStyle } from '@codemirror/highlight'
	import { history, historyKeymap } from '@codemirror/history'
	import { bracketMatching } from '@codemirror/matchbrackets'
	import { indentOnInput } from '@codemirror/language'
	import { commentKeymap } from '@codemirror/comment'
	import { markdown } from '@codemirror/lang-markdown'
	import { foldKeymap } from '@codemirror/fold'
	import { lintKeymap } from '@codemirror/lint'

	const dispatch = createEventDispatcher()
	let tabSize = new Compartment()
	export let value: string = ''

	// whether the editor has user focus
	let focused = false
	let container: HTMLDivElement
	const extensions: Extension[] = [
		highlightSpecialChars(),
		history(),
		drawSelection(),
		EditorState.allowMultipleSelections.of(true),
		indentOnInput(),
		defaultHighlightStyle.fallback,
		bracketMatching(),
		closeBrackets(),
		autocompletion(),
		rectangularSelection(),
		highlightActiveLine(),
		highlightSelectionMatches(),
		keymap.of([
			...closeBracketsKeymap,
			...defaultKeymap,
			...searchKeymap,
			...historyKeymap,
			...foldKeymap,
			...commentKeymap,
			...completionKeymap,
			...lintKeymap,
			indentWithTab,
		]),
		EditorView.lineWrapping,
		tabSize.of(EditorState.tabSize.of(2)),
		EditorView.theme(
			{
				'.cm-content': {
					fontFamily: 'var(--font)',
					// caretColor: 'var(--caret-color)',
				},
				//'.cm-activeLine': { background: 'var(--background-color-alt)' },
				'.cm-activeLine': { background: '#0000' },
				// '.cm-cursor': { borderColor: 'var(--caret-color)' },
				'&': { height: '100%', background: 'var(--alternate-background-color)' },
			},
			{ dark: true }
		),
		ViewPlugin.define(() => ({
			update: (u) => {
				if (u.focusChanged) focused = view.hasFocus
			},
		})),
	]
	const languageCompartment = new Compartment()
	extensions.push(languageCompartment.of(markdown({

	})))
	let startState = EditorState.create({
		doc: value,
		extensions,
	})
	let view: EditorView
	let actualValue = ''
	onMount(() => {
		view = new EditorView({
			state: startState,
			parent: container,
			// change value and dispatch input every time the doc changes
			dispatch: (tr) => {
				view.update([tr])
				const docText = view.state.doc.toString()
				if (docText !== actualValue) {
					value = docText
					actualValue = value
					dispatch('input', { value })
				}
			},
		})
	})

	// update the view if the value changes
	// $: {
	// 	if (view) {
	// 		if (view.state.doc.toString() !== value)
	// 			view.dispatch({
	// 				changes: { from: 0, to: view.state.doc.length, insert: value },
	// 			})
	// 	}
	// }

</script>

<noscript>
	<p>The editor won't work properly without JavaScript, please enable it.</p>
	<style>
		#editable-text-area {
			display: none;
		}
	</style>
</noscript>

<div
	id="editable-text-area"
	bind:this={container}
	class="code-textarea"
	class:focused
></div>

<style>
	#editable-text-area {
		border-radius: 0.25em;
		width: 50rem;
		min-height: 20rem;
		margin: 0;
		padding: 0.5em;
		background-color: var(--alternate-background-color);
		color: var(--text-color);
		flex-grow: 1;
		font-size: inherit;
		/* white-space: pre-wrap; */

		/* background-color: var(--alternate-background-color);
		max-width: 50em;
		min-height: 20em;
		padding: 0.5em;
		border-radius: 0.25em;
		background-color: var(--alternate-background-color); */
	}
</style>
