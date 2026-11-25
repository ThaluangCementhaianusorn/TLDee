@echo off
chcp 65001 >nul
cd /d "%~dp0"
set SHEET=%~1
if "%SHEET%"=="" set /p SHEET=วางลิงก์ Google Sheets (เว้นว่าง = สร้างชีตใหม่):
node tools\connect-sheets.mjs "%SHEET%"
pause
