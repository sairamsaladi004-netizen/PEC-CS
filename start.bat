@echo off
title CampusTech Ecosystem Server
echo Starting CampusTech One Digital Ecosystem...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
