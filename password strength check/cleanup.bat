@echo off
cd /d "%~dp0"
if exist app.py del app.py
if exist requirements.txt del requirements.txt
if exist templates rmdir /s /q templates
if exist cleanup.py del cleanup.py
if exist cleanup.bat del cleanup.bat
echo Cleanup complete
