@REM Windows launcher for Books to Read.
@REM
@REM Setup:
@REM   1. Make sure Node.js (version 12 or higher) is installed.
@REM   2. Keep this file and genbookstoread-windows.js in the same folder.
@REM   3. Run this file as the main Windows entry point.
@REM
@REM Usage:
@REM   genbookstoread-windows.bat C:\path\to\your\book\folder [output.md]
@REM
@REM Examples:
@REM   genbookstoread-windows.bat C:\Users\YourName\Documents\MyBooks
@REM   genbookstoread-windows.bat C:\Users\YourName\Documents\MyBooks reading-list.md
@REM   genbookstoread-windows.bat C:\Users\YourName\Documents\MyBooks C:\Users\YourName\Output\my-reading-list.md
@echo off
node "%~dp0genbookstoread-windows.js" %*
