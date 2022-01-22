import type { Entry } from './database/entries'
import {
	fetchEntryHistory,
	fetchEntryHistoryItemsAfter,
	getEntryHistoryItemBefore,
	HistoryItem,
} from './database/history'
import * as diff from 'fast-myers-diff'
import { createUuid } from './database'

/**
 * How the entry would look if this edit was reverted
 */
async function getRevertResult(historyItem: HistoryItem) {
	const historyItemsAfter = await fetchEntryHistoryItemsAfter(historyItem)
	const historyItemBefore = await getEntryHistoryItemBefore(historyItem)

	if (historyItemBefore === null) {
		// this was the initial edit, so we can't revert it
		return null
	}

	// the difference between this edit and the previous one
	let patch = Array.from(diff.calcPatch(historyItem.content, historyItemBefore.content))

	console.log('patch', patch)

	// we update the initial patch based on all the edits that occured after this one
	let tempBefore = historyItem
	for (const tempHistoryItem of historyItemsAfter) {
		const tempDiff = Array.from(diff.diff(tempBefore.content, tempHistoryItem.content))
		console.log('tempDiff', tempDiff)
		for (const [removeStart, removeEnd, insertStart, insertEnd] of tempDiff) {
			const initialPatch = JSON.parse(JSON.stringify(patch))
			patch = patch.map(([patchRemoveStart, patchRemoveEnd, insertSlice]) => {
				// if the patch is removing something, subtract from the patchRemoveStart and patchRemoveEnd
				if (removeStart !== removeEnd && patchRemoveEnd > removeEnd) {
					patchRemoveStart -= removeEnd - removeStart
					patchRemoveEnd -= removeEnd - removeStart
				}

				// if the patch is inserting something, add to the patchRemoveStart and patchRemoveEnd
				if (insertStart !== insertEnd && patchRemoveStart > insertStart) {
					patchRemoveStart += insertSlice.length
					patchRemoveEnd += insertSlice.length
				}

				return [patchRemoveStart, patchRemoveEnd, insertSlice]
			})
			console.log(initialPatch, patch)
		}
		console.log(tempDiff)
		tempBefore = historyItem
	}

	// apply the patch to the current version
	const newContent = Array.from(diff.applyPatch(historyItemsAfter[0].content, patch))
		.flat()
		.join('')

	return newContent
}

;(async () => {
	console.log('...')
	const history = await fetchEntryHistory(createUuid('a8942d398dd845b28822b2c19ae443e2'), 20, 0)
	console.log('.....', history.items.length)
	console.log(await getRevertResult(history.items[1]))
})()
