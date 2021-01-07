find . -name "*.py" -print0 | while read -d $'\0' file
do
    python -m black "$file" --fast
done
