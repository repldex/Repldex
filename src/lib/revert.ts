import type { Entry } from './database/entries'
import {
	fetchEntryHistory,
	fetchEntryHistoryItemsAfter,
	fetchEntryHistoryItemBefore,
	HistoryItem,
} from './database/history'
import * as diff from 'fast-myers-diff'
import { createUuid } from './database'

/**
 * How the entry would look if this edit was reverted
 *
 * This code is very bad and buggy
 */
export async function getRevertResult(historyItem: HistoryItem): Promise<string | null> {
	const historyItemsAfter = await fetchEntryHistoryItemsAfter(historyItem)
	const historyItemBefore = await fetchEntryHistoryItemBefore(historyItem)

	if (historyItemBefore === null) {
		// this was the initial edit, so we can't revert it
		return null
	}

	// the difference between this edit and the previous one
	let patch = Array.from(diff.calcPatch(historyItem.content, historyItemBefore.content))
	console.log('initial patch', patch)

	// we update the initial patch based on all the edits that occured after this one
	let tempBefore = historyItem
	for (const historyItemAfter of historyItemsAfter) {
		const diffAfter = Array.from(diff.diff(tempBefore.content, historyItemAfter.content))
		for (const [removeStart, removeEnd, insertStart, insertEnd] of diffAfter) {
			patch = patch.map(([patchRemoveStart, patchRemoveEnd, insertSlice]) => {
				// if the patch is removing something, subtract from the patchRemoveStart and patchRemoveEnd
				if (removeStart !== removeEnd) {
					// if everything that's being removed is before the patchRemoveStart, subtract from patchRemoveStart and patchRemoveEnd
					if (patchRemoveEnd > removeEnd) {
						patchRemoveStart -= removeEnd - removeStart
						patchRemoveEnd -= removeEnd - removeStart
					}
					// if some stuff that's being removed is after the patchRemoveStart
					// modify insertSlice
					else if (patchRemoveStart >= removeStart) {
						insertSlice = insertSlice.slice(removeEnd - removeStart)
						patchRemoveEnd -= removeEnd - removeStart
					}
				}

				// if the patch is inserting something, add to the patchRemoveStart and patchRemoveEnd
				if (insertStart !== insertEnd && patchRemoveStart > insertStart) {
					patchRemoveStart += insertSlice.length
					patchRemoveEnd += insertSlice.length
				}

				return [patchRemoveStart, patchRemoveEnd, insertSlice]
			})
		}
		tempBefore = historyItem
	}

	// apply the patch to the current version
	const newContent = Array.from(
		diff.applyPatch(
			historyItemsAfter[0] ? historyItemsAfter[0].content : historyItem.content,
			patch
		)
	)
		.flat()
		.join('')

	return newContent
}
