@echo off
title DHARA - Smart Business Management
echo.
echo  ╔═══════════════════════════════════════╗
echo  ║   DHARA - Smart Business Management  ║
echo  ║   Starting application...            ║
echo  ╚═══════════════════════════════════════╝
echo.
echo  Opening DHARA in your browser...
echo  (Keep this window open while using the app)
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
