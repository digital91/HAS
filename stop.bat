@echo off
echo Stopping frontend (port 3000) and backend (port 5000)...

REM Kill by port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  echo Killing PID %%a on port 3000
  taskkill /F /PID %%a >nul 2>&1
)

REM Kill by port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
  echo Killing PID %%a on port 5000
  taskkill /F /PID %%a >nul 2>&1
)

REM Fallback: kill common dev processes
taskkill /F /IM react-scripts.exe >nul 2>&1
taskkill /F /IM nodemon.exe >nul 2>&1
taskkill /F /IM webpack-dev-server.exe >nul 2>&1

REM Final fallback: kill Node (may stop other Node tools)
taskkill /F /IM node.exe >nul 2>&1

echo All servers stopped.
exit /B 0


