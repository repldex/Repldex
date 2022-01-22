import type { RequestHandler } from '@sveltejs/kit'
import type { JSONString } from '@sveltejs/kit/types/helper'
import { fetchEntryHistoryItem } from '../../../lib/database/history'
import { getRevertResult } from '../../../lib/revert'

export interface APIHistoryItem {
	id: string
	entryId: string
	userId: string
	title: string
	content: string
	timestamp: Date
}

export interface APIHistoryResponse {
	count: number
	items: APIHistoryItem[]
}

// revert an entry history item
export const post: RequestHandler = async req => {
	const historyItemId = req.params.id

	const historyItem = await fetchEntryHistoryItem(historyItemId)

	if (historyItem === null)
		return {
			status: 404,
			body: {
				error: 'Not found',
			},
		}

	const newContent = await getRevertResult(historyItem)

	console.log(newContent)
	return {
		body: {
			content: newContent,
		} as unknown as JSONString,
	}
}
