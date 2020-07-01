with open('baseurl.txt') as f:
	BASE_URL = f.read()

# this kind of makes sense as a file i guess
with open('editors.txt') as f:
	EDITOR_IDS = list(map(int, f.read().splitlines()))
	
with open('admins.txt') as f:
	ADMIN_IDS = list(map(int, f.read().splitlines()))