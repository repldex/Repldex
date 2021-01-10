unset PYTHONPATH
unset POETRY_VIRTUALENVS_PATH
unset VIRTUAL_ENV #/opt/virtualenvs/python3
export PYTHONPATH='/usr/local/lib/python3.8/site-packages'
/usr/local/bin/python3 -m pip show poetry
if [ $? -ne 0 ]; then
  echo "Installing poetry"
  /usr/local/bin/python3 -m pip install poetry --user
fi
clear
echo "Installing dependencies"
#(set -o posix ; set)
/usr/local/bin/python3 -m poetry install --no-root --no-dev -v
/home/runner/ReplDex/.venv/bin/python main.py
