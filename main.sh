unset PYTHONPATH
unset VIRTUAL_ENV #/opt/virtualenvs/python3
export PYTHONPATH='/usr/local/lib/python3.8/site-packages'
export POETRY_VIRTUALENVS_PATH='/home/runner/venv'
export POETRY_VIRTUALENVS_CREATE='true'
/usr/local/bin/python3 -m pip show poetry
if [ $? -ne 0 ]; then
  echo "Installing poetry"
  /usr/local/bin/python3 -m pip install poetry --user
fi
clear
if [ ! -d "/home/runner/venv" ];then
    echo "Installing dependencies"
    /usr/local/bin/python3 -m poetry install --no-root --no-dev -v
fi
/usr/local/bin/python3 -m poetry run python main.py
#(set -o posix ; set)