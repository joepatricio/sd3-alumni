# Mandatory Python Virtual Environment Enforcement
- Always use the project's existing Python virtual environment for any operation involving Python, including running scripts, installing packages, executing Python-based tools, and invoking Python utilities.
- Before executing any Python command, activate the virtual environment by running `.\Scripts\Activate.ps1` in the current PowerShell session.
- Validate the resulting Python interpreter. At minimum, verify all of the following:
  1. The activation script executed successfully.
  2. `$env:VIRTUAL_ENV` points to the expected virtual environment.
  3. `Get-Command python` resolves to the virtual environment's `Scripts\python.exe`.
  4. Python reports that `sys.prefix != sys.base_prefix`.
- If any validation fails:
  1. Immediately stop all Python-related operations.
  2. Do not fall back to the system Python installation.
  3. Do not attempt to repair, recreate, or initialize the virtual environment.
  4. Notify the operator immediately, describing the failed validation and requesting authorization or intervention.
- Never create, modify, or configure a Python virtual environment unless explicitly authorized by the operator.
- Perform activation and validation within the same PowerShell session used to execute subsequent Python commands.