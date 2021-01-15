# pretend to be motor/pymongo but save to a json file instead of mongodb

import os
import json
from datetime import datetime

class AsyncIOMotorClient:
	def __init__(self, path_name: str):
		self.path_name = path_name
		if not os.path.isdir(path_name):
			os.mkdir(path_name)
		print('mock motor')

	def __getitem__(self, db_name: str):
		database_path = os.path.join(self.path_name, db_name)
		if not os.path.isdir(database_path):
			os.mkdir(database_path)
		return AsyncIOMotorDatabase(self, db_name)


class AsyncIOMotorDatabase:
	def __init__(self, client: AsyncIOMotorClient, name: str):
		self.client = client
		self.name = name
		self.path = os.path.join(self.client.path_name, name)

	def __getitem__(self, collection_name: str):
		collection_path = os.path.join(self.path, collection_name + '.json')
		if not os.path.isfile(collection_path):
			with open(collection_path, 'w') as f: f.write('[]')
		return AsyncIOMotorCollection(self, collection_name)


def operator_matches_value(operator, operator_value, match):
	if operator == 'eq':
		return operator_value == match
	elif operator == 'ne':
		return operator_value != match
	print('MOCKMOTOR: unknown operator', operator)


def is_matching_filter(filter, match):
	if filter is None or filter == {}:
		# if there's no filter, just assume it matches
		return True

	for filter_key, filter_value in filter.items():
		if filter_key[0] == '$':
			if not operator_matches_value(filter_key[1:], filter_value[1:], match):
				return False
		else:
			pass
	return True


def bson_to_json(raw_bson):
	is_list = isinstance(raw_bson, list)
	if is_list:
		return [bson_to_json(item) for item in raw_bson]
	raw_json = {}
	for bson_key, bson_value in raw_bson.items():
		if bson_key[0] == '$':
			if bson_key[1:] == 'date':
				return datetime.fromtimestamp(bson_value / 1000)
		json_value = bson_to_json(bson_value) if isinstance(bson_value, dict) else bson_value
		raw_json[bson_key] = json_value
	return raw_json


class AsyncIOMotorCursor:
	def __init__(self, collection, filter):
		self.filter = filter
		self.chained = []
		self.collection = collection

		self.documents = []

	def add_option(self, mask):
		raise NotImplementedError()

	def allow_disk_use(self, allow_disk_use):
		raise NotImplementedError()

	def clone(self):
		raise NotImplementedError()

	def close(self):
		raise NotImplementedError()

	def collation(self, collation):
		raise NotImplementedError()

	def comment(self, comment):
		raise NotImplementedError()
	
	async def distinct(self, key):
		raise NotImplementedError()

	def each(self, callback):
		raise NotImplementedError()

	async def explain(self):
		raise NotImplementedError()

	def hint(self, index):
		raise NotImplementedError()

	def limit(self, limit: int):
		self.chained.append({
			'type': 'limit',
			'limit': limit
		})
		return self

	def skip(self, skip: int):
		self.chained.append({
			'type': 'skip',
			'skip': skip
		})
		return self

	def max(self, spec):
		raise NotImplementedError()

	def max_await_time_ms(self, max_await_time_ms):
		raise NotImplementedError()

	def max_time_ms(self, max_time_ms):
		raise NotImplementedError()

	def min(self, spec):
		raise NotImplementedError()

	async def next(self):
		self.index += 1
		if self.index >= len(self.documents):
			raise StopAsyncIteration()
		return self.documents[self.index]

	def remove_option(self, mask):
		raise NotImplementedError()

	def rewind(self):
		raise NotImplementedError()
		
	def sort(self, key_or_list: list, direction: int = None):
		self.chained.append({
			'type': 'sort',
			'key_or_list': key_or_list,
			'direction': direction,
		})
		return self

	async def to_list(self, length):
		raise NotImplementedError()

	def where(self, code):
		raise NotImplementedError()

	def __aiter__(self):
		self.index = -1
		documents = []
		for item in self.collection._read():
			if is_matching_filter(self.filter, item):
				documents.append(item)
		for chain_item in self.chained:
			if chain_item['type'] == 'limit':
				limit = chain_item['limit']
				documents = documents[:limit]
			elif chain_item['type'] == 'skip':
				skip = chain_item['skip']
				documents = documents[skip:]
			elif chain_item['type'] == 'sort':
				key_or_list = chain_item['key_or_list']
				direction = chain_item['direction']
				documents = sorted(documents, key=lambda d: d[key_or_list], reverse=direction == -1)
		self.documents = documents
		return self

	async def __anext__(self):
		return await self.next()

class AsyncIOMotorCollection:
	def __init__(self, database: AsyncIOMotorDatabase, name: str):
		self.database = database
		self.name = name
		self.path = os.path.join(self.database.path, name + '.json')

	async def create_index(self, keys, **kwargs):
		raise NotImplementedError()

	async def inline_map_reduce(self, map, reduce, full_response=False, **kwargs):
		raise NotImplementedError()

	async def aggregate(self, pipeline, **kwargs):
		raise NotImplementedError()

	async def aggregate_raw_batches(self, pipeline, **kwargs):
		raise NotImplementedError()

	async def bulk_write(self, requests, ordered=True, bypass_document_validation=False, session=None):
		raise NotImplementedError()

	async def count_documents(self, filter, session=None, **kwargs):
		count = 0
		for item in self._read():
			if is_matching_filter(filter, item):
				count += 1
		return count

	async def create_indexes(self, indexes, session=None, **kwargs):
		raise NotImplementedError()

	async def delete_many(self, filter, collation=None, hint=None, session=None):
		raise NotImplementedError()

	async def delete_one(self, filter, collation=None, hint=None, session=None):
		raise NotImplementedError()

	async def distinct(self, key, filter=None, session=None, **kwargs):
		raise NotImplementedError()

	async def drop(self, session=None):
		return await self.drop_collection(session)

	async def drop_index(self, index_or_name, session=None, **kwargs):
		raise NotImplementedError()

	async def drop_indexes(self, session=None, **kwargs):
		raise NotImplementedError()

	async def estimated_document_count(self, **kwargs):
		raise NotImplementedError()

	def find(self, filter=None) -> AsyncIOMotorCursor:
		return AsyncIOMotorCursor(self, filter)

	async def find_one(self, filter=None):
		for item in self._read():
			if is_matching_filter(filter, item):
				return item

	async def find_one_and_delete(self, filter, projection=None, sort=None, hint=None, session=None, **kwargs):
		raise NotImplementedError()

	async def find_one_and_replace(self, filter, replacement, projection=None, sort=None, upsert=False, return_document=False, hint=None, session=None, **kwargs):
		raise NotImplementedError()

	async def find_one_and_update(self, filter, update, projection=None, sort=None, upsert=False, return_document=False, array_filters=None, hint=None, session=None, **kwargs):
		raise NotImplementedError()

	async def find_raw_batches(self, *args, **kwargs):
		raise NotImplementedError()

	async def index_information(self, session=None):
		raise NotImplementedError()

	async def insert_many(self, documents, ordered=True, bypass_document_validation=False, session=None):
		raise NotImplementedError()

	async def insert_one(self, document, bypass_document_validation=False, session=None):
		raise NotImplementedError()

	async def list_indexes(self, session=None):
		raise NotImplementedError()

	async def map_reduce(self, map, reduce, out, full_response=False, session=None, **kwargs):
		raise NotImplementedError()

	async def options(self, session=None):
		raise NotImplementedError()

	async def rename(self, new_name, session=None, **kwargs):
		raise NotImplementedError()

	async def replace_one(self, filter, replacement, upsert=False, bypass_document_validation=False, collation=None, hint=None, session=None):
		raise NotImplementedError()

	async def update_many(self, filter, update, upsert=False, array_filters=None, bypass_document_validation=False, collation=None, hint=None, session=None):
		raise NotImplementedError()

	async def update_one(self, filter, update, upsert=False, bypass_document_validation=False, collation=None, array_filters=None, hint=None, session=None):
		raise NotImplementedError()

	async def watch(self, pipeline=None, full_document=None, resume_after=None, max_await_time_ms=None, batch_size=None, collation=None, start_at_operation_time=None, session=None, start_after=None):
		raise NotImplementedError()

	async def with_options(self, codec_options=None, read_preference=None, write_concern=None, read_concern=None):
		raise NotImplementedError()

	def _read(self):
		with open(self.path, 'r') as f:
			raw_bson = json.loads(f.read())
		return bson_to_json(raw_bson)
