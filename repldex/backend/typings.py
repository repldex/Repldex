from typing import List, Optional, TypedDict
from datetime import datetime

class DatabaseImage(TypedDict):
	src: str
	thumbnail_b64: Optional[str]
	thumbnail_content_type: Optional[str]

class DatabaseHistoryItem(TypedDict):
	author: int
	content: str
	image: Optional[DatabaseImage]
	time: datetime
	title: str
	unlisted: Optional[bool]

class DatabaseEntry(TypedDict):
	_id: str
	content: str
	history: List[DatabaseHistoryItem]
	image: Optional[DatabaseImage]
	last_edited: datetime
	locked: Optional[bool]
	markdown: str
	nohtml_content: str
	owner_id: Optional[int]
	title: str
	unlisted: bool

