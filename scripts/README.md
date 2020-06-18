To use parse_sysex.py:

1. Create and activate a new virtual environment:
    python3 -m venv ./env
    . env/bin/activate

2. Install dependencies:
    pip install -r requirements.txt 

3. Run script, providing path to the patches you'd like to process:
    ```
    PATCH_PATH=${/path/to/your/patches} python parse_sysex.py
    ```
