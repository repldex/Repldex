# pretend to be motor/pymongo but save to a json file instead of mongodb

import os

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
		collection_path = os.path.join(self.path, collection_name)
		if not os.path.isdir(collection_path):
			os.mkdir(collection_path)
		return AsyncIOMotorCollection(self, collection_name)

class AsyncIOMotorCollection:
	def __init__(self, database: AsyncIOMotorDatabase, name: str):
		self.database = database
		self.name = name

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
		raise NotImplementedError()

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

	async def drop_index(index_or_name, session=None, **kwargs):
		raise NotImplementedError()

	async def drop_indexes(session=None, **kwargs):
		raise NotImplementedError()

	async def estimated_document_count(**kwargs):
		raise NotImplementedError()

	async def find(*args, **kwargs) -> MotorCursor:
		raise NotImplementedError()

	async def find_one(filter=None, *args, **kwargs):
		raise NotImplementedError()

	async def find_one_and_delete(filter, projection=None, sort=None, hint=None, session=None, **kwargs):
		raise NotImplementedError()

	async def find_one_and_replace(filter, replacement, projection=None, sort=None, upsert=False, return_document=False, hint=None, session=None, **kwargs):
		raise NotImplementedError()

	async def find_one_and_update(filter, update, projection=None, sort=None, upsert=False, return_document=False, array_filters=None, hint=None, session=None, **kwargs):
		raise NotImplementedError()

	async def find_raw_batches(*args, **kwargs):
		raise NotImplementedError()

	async def index_information(session=None):
		raise NotImplementedError()

	async def insert_many(documents, ordered=True, bypass_document_validation=False, session=None):
		raise NotImplementedError()

	async def insert_one(document, bypass_document_validation=False, session=None):
		raise NotImplementedError()

	async def list_indexes(session=None):
		raise NotImplementedError()

	async def map_reduce(map, reduce, out, full_response=False, session=None, **kwargs):
		raise NotImplementedError()

	async def options(session=None):
		raise NotImplementedError()

	async def rename(new_name, session=None, **kwargs):
		raise NotImplementedError()

	async def replace_one(filter, replacement, upsert=False, bypass_document_validation=False, collation=None, hint=None, session=None):
		raise NotImplementedError()

	async def update_many(filter, update, upsert=False, array_filters=None, bypass_document_validation=False, collation=None, hint=None, session=None):
		raise NotImplementedError()

	async def update_one(filter, update, upsert=False, bypass_document_validation=False, collation=None, array_filters=None, hint=None, session=None):
		raise NotImplementedError()

	async def watch(pipeline=None, full_document=None, resume_after=None, max_await_time_ms=None, batch_size=None, collation=None, start_at_operation_time=None, session=None, start_after=None):
		raise NotImplementedError()

	async def with_options(codec_options=None, read_preference=None, write_concern=None, read_concern=None):
		raise NotImplementedError()

class MotorCursor:
	pass