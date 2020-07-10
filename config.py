with open('baseurl.txt') as f:
	BASE_URL = f.read()

# this kind of makes sense as a file i guess
with open('editors.txt') as f:
	#EDITOR_IDS = list(map(int, f.read().splitlines()))
	EDITOR_IDS = [int(item.split()[0]) for item in f.read().splitlines()] # So you can put username#discrim after editor ID in editors.txt to remember who each one is
	
with open('admins.txt') as f:
	ADMIN_IDS = list(map(int, f.read().splitlines()))