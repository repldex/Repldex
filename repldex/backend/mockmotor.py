# pretend to be motor/pymongo but save to a json file instead of mongodb

import os
import json
from datetime import datetime
import re
import typing


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
	for item_key, item_value in filter.items():
		# item_key: 'unlisted'
		# item_value: {'$ne': True}
		has_operators = False
		if isinstance(item_value, dict):
			for filter_key, filter_value in item_value.items():
				# filter_key: '$ne'
				# filter_value: True
				if filter_key[0] == '$':
					has_operators = True
					if not operator_matches_value(filter_key[1:], filter_value, match.get(item_key)):
						return False
		if not has_operators:
			if match.get(item_key) != item_value:
				return False

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


def get_from_expression(expression, document):
	# Expressions can include field paths, literals, system variables, expression objects, and expression operators. Expressions can be nested.
	# https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#aggregation-expressions
	if isinstance(expression, dict):
		for expression_key, expression_value in expression.items():
			if isinstance(expression_value, str):
				# string expressions
				if expression_key == '$meta':
					return document['$meta'][expression_value]
				# TODO: add more string expressions
			# TODO: add more types of expressions
	print('failed to get from expression!')
	return


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
		self._i += 1
		if self._i >= len(self.documents):
			raise StopAsyncIteration()
		return self.documents[self._i]

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
		self._i = -1
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

def split_into_words(string: str) -> typing.List[str]:
	cleaned_string = string\
		.lower()\
		.replace('.', ' ')\
		.replace(',', ' ')\
		.replace('!', ' ')\
		.replace('?', ' ')\
		.replace('-', ' ')\
		.replace('+', ' ')\
		.split(' ')
	return cleaned_string

class Aggregator:
	def __init__(self, pipeline: list, collection):
		self.pipeline = pipeline
		self.collection = collection

	def _search(self, stage_value, document):
		search_score = 0
		for search_operator_name, search_operator_value in stage_value.items():
			if search_operator_name == 'compound':
				for clause_name, clause_value in search_operator_value.items():
					if clause_name == 'should':
						# TODO: implement the other clauses
						pass
					for sub_clause in clause_value:
						for sub_sub_clause, sub_sub_clause_value in sub_clause.items():
							if sub_sub_clause == 'search':
								search_query = sub_sub_clause_value['query']
								# TODO: split the path by commas and get the (potentially) nested value
								search_path = sub_sub_clause_value['path']
								weight = 1
								if 'score' in sub_sub_clause_value:
									weight *= sub_sub_clause_value['score']['boost']['value']
								if search_path in document:
									document_words = split_into_words(document[search_path])
									query_words = split_into_words(search_query)
									found_times = 0
									for query_word in query_words:
										found_times += document_words.count(query_word)
									document_length_weight = (8 / len(document_words))
								else:
									found_times = 0
									document_length_weight = 1
								# found_times: the number of times the word shows up in the document
								# weight: the weight specified in the query
								# document_length_weight: slightly punish longer entries so it matches the most relevant articles even if theyre shorter
								search_score += found_times * weight * document_length_weight
		return search_score

	def __aiter__(self):
		documents = self.collection._read()
		self._i = -1
		for stage in self.pipeline:
			new_documents = []
			for stage_name, stage_value in stage.items():
				if stage_name == '$searchBeta':
					for document in documents:
						search_score = self._search(stage_value, document)
						if search_score > 0:
							if '$meta' not in document:
								document['$meta'] = {}
							document['$meta']['searchScore'] = search_score
							new_documents.append(document)
				elif stage_name == '$match':
					for document in documents:
						if is_matching_filter(stage_value, document):
							new_documents.append(document)
				elif stage_name == '$skip':
					new_documents = documents[stage_value:]
				elif stage_name == '$limit':
					new_documents = documents[:stage_value]
				elif stage_name == '$addFields':
					for new_field, expression in stage_value.items():
						for document in documents:
							new_field_value = get_from_expression(expression, document)
							document[new_field] = new_field_value
							new_documents.append(document)
				
				elif stage_name == '$sort':
					sort_key = list(stage_value.keys())[0]
					direction = list(stage_value.values())[0]
					new_documents = sorted(documents, key=lambda d: d[sort_key], reverse=direction == -1)
				else:
					new_documents = documents

			documents = new_documents
		self.documents = documents
		return self

	async def __anext__(self):
		self._i += 1
		if self._i >= len(self.documents):
			raise StopAsyncIteration()
		else:
			return self.documents[self._i]

class AsyncIOMotorCollection:
	def __init__(self, database, name: str):
		self.database = database
		self.name = name
		self.path = os.path.join(self.database.path, name + '.json')

	def _read(self) -> typing.Any:
		with open(self.path, 'r') as f:
			raw_bson = json.loads(f.read())
		return bson_to_json(raw_bson)

	async def create_index(self, keys, **kwargs):
		raise NotImplementedError()

	async def inline_map_reduce(self, map, reduce, full_response=False, **kwargs):
		raise NotImplementedError()

	def aggregate(self, pipeline: list) -> Aggregator:
		return Aggregator(pipeline, self)

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

	async def drop_collection(self, session=None):
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

	async def find_one_and_replace(
		self, filter, replacement, projection=None, sort=None, upsert=False, return_document=False, hint=None, session=None,
		**kwargs
	):
		raise NotImplementedError()

	async def find_one_and_update(
		self, filter, update, projection=None, sort=None, upsert=False, return_document=False, array_filters=None, hint=None,
		session=None, **kwargs
	):
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

	async def replace_one(
		self, filter, replacement, upsert=False, bypass_document_validation=False, collation=None, hint=None, session=None
	):
		raise NotImplementedError()

	async def update_many(
		self, filter, update, upsert=False, array_filters=None, bypass_document_validation=False, collation=None, hint=None,
		session=None
	):
		raise NotImplementedError()

	async def update_one(
		self, filter, update, upsert=False, bypass_document_validation=False, collation=None, array_filters=None, hint=None,
		session=None
	):
		raise NotImplementedError()

	async def watch(
		self, pipeline=None, full_document=None, resume_after=None, max_await_time_ms=None, batch_size=None, collation=None,
		start_at_operation_time=None, session=None, start_after=None
	):
		raise NotImplementedError()

	async def with_options(self, codec_options=None, read_preference=None, write_concern=None, read_concern=None):
		raise NotImplementedError()

class AsyncIOMotorDatabase:
	def __init__(self, client, name: str):
		self.client = client
		self.name = name
		self.path = os.path.join(self.client.path_name, name)

	def __getitem__(self, collection_name: str):
		collection_path = os.path.join(self.path, collection_name + '.json')
		if not os.path.isfile(collection_path):
			with open(collection_path, 'w') as f: f.write('[]')
		return AsyncIOMotorCollection(self, collection_name)


class AsyncIOMotorClient:
	def __init__(self, path_name: str):
		self.path_name = path_name
		if not os.path.isdir(path_name):
			os.mkdir(path_name)

	def __getitem__(self, db_name: str):
		database_path = os.path.join(self.path_name, db_name)
		if not os.path.isdir(database_path):
			os.mkdir(database_path)
		return AsyncIOMotorDatabase(self, db_name)

