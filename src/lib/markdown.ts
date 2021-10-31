// render our markdown into html, but still showing the markdown entities

interface RenderMarkdownOptions {
	showEntities?: boolean
}

export function render(text: string, options?: RenderMarkdownOptions): string {
	let output = ''

	// whether it's currently italicized
	let isItalic = false
	// whether it's currently bolded
	let isBold = false

	for (let i = 0; i < text.length; i++) {
		const textAfter = text.substring(i)

		if (textAfter.startsWith('**') && !isBold) {
			output += '<b>'
			if (options?.showEntities) output += '<span class="markdown-asterisk">**</span>'
			isBold = true
			i += 1
		} else if (textAfter.startsWith('**') && isBold && !isItalic) {
			if (options?.showEntities) output += '<span class="markdown-asterisk">**</span>'
			output += '</b>'
			isBold = false
			i += 1
		} else if (textAfter.startsWith('*') && !isItalic) {
			output += '<i>'
			if (options?.showEntities) output += '<span class="markdown-asterisk">*</span>'
			isItalic = true
		} else if (textAfter.startsWith('*') && isItalic) {
			if (options?.showEntities) output += '<span class="markdown-asterisk">*</span>'
			output += '</i>'
			isItalic = false
		} else {
			output += textAfter[0].replace(/&/, '&amp;').replace(/</, '&lt;').replace(/>/, '&gt;')
		}
	}
	if (isItalic) output += '</i>'
	if (isBold) output += '</b>'

	const rendered = '<span>' + output.replace(/\n/g, '<br>') + '</span>'
	return rendered
}
