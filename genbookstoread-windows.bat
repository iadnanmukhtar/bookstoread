@REM Windows launcher for Books to Read.
@REM
@REM Setup:
@REM   1. Make sure Node.js (version 12 or higher) is installed.
@REM   2. Keep this file and genbookstoread-windows.js in the same folder.
@REM   3. Run this file as the main Windows entry point.
@REM
@REM Usage:
@REM   genbookstoread-windows.bat --source C:\path\to\your\book\folder
@REM   genbookstoread-windows.bat --source C:\path\to\your\book\folder --out output.md
@REM   genbookstoread-windows.bat --out existing-note.md
@REM
@REM If you omit --source, then --out must point to an existing note whose
@REM frontmatter already contains:
@REM   source: "/path/to/your/book/folder"
@REM
@REM Examples:
@REM   genbookstoread-windows.bat --source C:\Users\YourName\Documents\MyBooks
@REM   genbookstoread-windows.bat --source C:\Users\YourName\Documents\MyBooks --out reading-list.md
@REM   genbookstoread-windows.bat --source C:\Users\YourName\Documents\MyBooks --out C:\Users\YourName\Output\my-reading-list.md
@REM   genbookstoread-windows.bat --out C:\Users\YourName\Vault\Books to Read.md
@echo off
node "%~dp0genbookstoread-windows.js" %*
