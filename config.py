config_path = 'config/'
with open(config_path+'baseurl.txt') as f:
	BASE_URL = f.read()

# this kind of makes sense as a file i guess
with open(config_path+'editors.txt') as f:
	#EDITOR_IDS = list(map(int, f.read().splitlines()))
	EDITOR_IDS = [int(item.split()[0]) for item in f.read().splitlines()] # So you can put username#discrim after editor ID in editors.txt to remember who each one is
	with open(config_path+"entry_approval.txt") as approve:
		approves=approve.read()
		APPROVAL_IDS = [int(item.split()[0]) for item in approves.splitlines()]
	for i in APPROVAL_IDS:
		if(i not in EDITOR_IDS):
			EDITOR_IDS.append(i)
	
with open(config_path+'admins.txt') as f:
	ADMIN_IDS = [int(item.split()[0]) for item in f.read().splitlines()] # admins can now have names
	# list(map(int, f.read().splitlines()))

with open(config_path+'blacklist.txt') as f:
	BLACKLIST_IDS = [int(item.split()[0]) for item in f.read().splitlines()]
	BLACKLISTED_IDS = BLACKLIST_IDS

new_dissabled = False