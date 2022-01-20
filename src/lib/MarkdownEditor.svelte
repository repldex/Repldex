<script lang="ts">
	import { onMount } from 'svelte'
	import * as markdown from './markdown'
	import { browser } from '$app/env'

	export let value: string = ''
	let htmlContent: string
	let textAreaEl: HTMLDivElement

	function handlePaste(e: ClipboardEvent) {
		const text = e.clipboardData?.getData('text/plain')
		if (text)
			// execCommand is deprecated but idk how to do this without execCommand lol
			document.execCommand('insertText', false, text)
	}

	interface HistoryItem {
		text: string
		pos: number
	}

	const history: HistoryItem[] = []

	function addStateToHistory(el: HTMLTextAreaElement) {
		history.push({
			text: el.innerText,
			pos: el.selectionStart,
		})
	}

	// add the current value of the textarea to the history
	onMount(() => {
		history.push({ text: value, pos: 0 })
	})

	function caret(element: Node): number | null {
		let range: Range | undefined
		try {
			range = window.getSelection()?.getRangeAt(0)
		} catch {
			return null
		}
		if (range === undefined) return null

		const prefix = range.cloneRange()
		prefix.selectNodeContents(element)
		prefix.setEnd(range.endContainer, range.endOffset)
		return prefix.toString().length
	}

	function setCaret(pos: number, parent: Node) {
		for (const node of parent.childNodes as unknown as Iterable<Node>) {
			if (node.nodeType == Node.TEXT_NODE) {
				if ((node.textContent?.length ?? 0) >= pos) {
					const range = document.createRange()
					const sel = window.getSelection()
					range.setStart(node, pos)
					range.collapse(true)
					sel?.removeAllRanges()
					sel?.addRange(range)
					return -1
				} else pos = pos - (node.textContent?.length ?? 0)
			} else {
				pos = setCaret(pos, node)
				if (pos < 0) return pos
			}
		}
		return pos
	}

	function handleKeyDown(e) {
		if (e.key === 'Enter') {
			document.execCommand('insertLineBreak')
			e.preventDefault()
		}
	}

	let isUpdatingValue = false

	function handleInput(e) {
		const el = e.target as HTMLTextAreaElement
		if (
			// if the user inputs a character or a backspace, update the content
			(e.data && (e.data.charCodeAt(0) >= 32 || e.data.charCodeAt(0) == 0x20))
			|| (e.inputType == 'deleteContentBackward' || e.inputType == 'deleteContentForward')
		) {
			// we use innertext instead of textContent since innerText is aware of line breaks and textContent isn't
			setContentTo(e.innerText)
		}

		isUpdatingValue = true
		value = el.innerText
		isUpdatingValue = false
	}


	// set the content of the text area without changing the position of the user's cursor
	function setContentTo(v: string) {
		if (isUpdatingValue) return
		const pos = browser ? caret(textAreaEl) : null
		// we set the htmlContent instead of the textAreaEl.innerHTML since it works even
		// before the element actually exists
		htmlContent = markdown.render(v, { showEntities: true })
		if (pos !== null)
			setCaret(pos, textAreaEl)
	}
	$: setContentTo(value)

	let spacesTyped = 0

	function handleBeforeInput(e) {
		const el = e.target as HTMLTextAreaElement

		// ctrl z
		if (e.inputType == 'historyUndo') {
			e.preventDefault()
			let pos = caret(el)
			const historyItem = history.pop()
			if (historyItem) {
				el.innerHTML = markdown.render(historyItem.text, { showEntities: true })
				if (pos) {
					// if the pos is higher than the actual length, put it at the end
					if (pos > el.innerText.length) pos = el.innerText.length
					setCaret(pos, el)
				}
			}
		} else {
			// we only add to history when at least one of the following is true:
			// - typed a non-space character after typing more than one space
			// - we typed a space after typing a non-space

			if (e.inputType == 'insertText') {
				const typedSpace = e.data === ' '
				if (typedSpace) spacesTyped++
				if (!typedSpace && spacesTyped > 1) addStateToHistory(el)
				else if (typedSpace && spacesTyped === 1) addStateToHistory(el)

				if (!typedSpace) spacesTyped = 0

				// limit the history to 10 entries
				if (history.length > 10) history.shift()
			}
		}
	}
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
	contenteditable
	on:paste|preventDefault={handlePaste}
	on:input={handleInput}
	on:beforeinput={handleBeforeInput}
	on:keydown={handleKeyDown}
	bind:this={textAreaEl}
>{@html htmlContent}</div>

<style>
	#editable-text-area {
		background-color: var(--alternate-background-color);
		max-width: 50em;
		min-height: 20em;
		padding: 0.5em;
		border-radius: 0.25em;
		background-color: var(--alternate-background-color);
	}

	#editable-text-area :global(.markdown-asterisk) {
		opacity: 0.5;
	}
</style>
