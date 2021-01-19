import json
import os

if 'repldex' in os.getcwd():
	config_path = 'config/'  # running from src
elif os.getcwd() == '/home/runner':
	config_path = '/home/runner/repldex/config/'  # absolute path when on repl.it
else:
	config_path = 'repldex/config/'  # running from project root with vscode for example

with open(config_path + 'baseurl.txt') as f:
	BASE_URL = f.read()

with open(config_path + 'subs.json') as f:
	SUBS = f.read()

with open(config_path + 'config.json') as f:
	CONFIG = json.loads(f.read())
	CLIENT_ID = CONFIG.get('client_id', 662036612460445713)
	DOT_ENV = CONFIG.get('dotenv', False)

# this kind of makes sense as a file i guess
with open(config_path + 'editors.txt') as f:
	# So you can put username#discrim after editor ID in editors.txt to remember who each one is
	EDITOR_IDS = [int(item.split()[0]) for item in f.read().splitlines()]
	with open(config_path + 'entry_approval.txt') as f:
		approves = f.read()
		APPROVAL_IDS = [item.split()[0] for item in approves.splitlines()]

	for i in APPROVAL_IDS:
		if i not in EDITOR_IDS:
			EDITOR_IDS.append(i)

with open(config_path + 'admins.txt') as f:
	ADMIN_IDS = [int(item.split()[0]) for item in f.read().splitlines()]  # admins can now have names

with open(config_path + 'reporters.txt') as f:
	REPORTER_IDS = [int(item.split()[0]) for item in f.read().splitlines()]
	for i in ADMIN_IDS:
		if i not in REPORTER_IDS:
			REPORTER_IDS.append(i)

with open(config_path + 'blacklist.txt') as f:
	BLACKLIST_IDS = [int(item.split()[0]) for item in f.read().splitlines()]
	BLACKLISTED_IDS = BLACKLIST_IDS

with open(config_path + 'featured.txt') as f:
	FEATURED = [int(item.split()[0]) for item in f.read().splitlines()]

new_disabled = False
