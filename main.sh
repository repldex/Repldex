unset PYTHONPATH
unset POETRY_VIRTUALENVS_PATH
unset VIRTUAL_ENV #/opt/virtualenvs/python3
export PYTHONPATH='/usr/local/lib/python3.8/site-packages'
export PATH='/home/runner/.apt/usr/bin:/home/runner/.local/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
#/usr/local/bin/python3 -m pip install poetry pyparsing --user
#/opt/virtualenvs/python3/bin/python3 -m poetry install --no-root --no-dev -v
#(set -o posix ; set)
/usr/local/bin/python3 -m poetry install --no-root --no-dev -v
/home/runner/ReplDex/.venv/bin/python main.py