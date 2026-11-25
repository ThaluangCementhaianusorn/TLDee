@echo off
chcp 65001 >nul
title คนดีศรีท่าหลวง - อัปโหลด GitHub อัตโนมัติ
cd /d "%~dp0"
node tools\github-sync.mjs --watch
pause
