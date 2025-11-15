@echo off
echo Starting HAS Cinema Website (Production Mode with MongoDB)...
echo.

echo Checking MongoDB connection...
echo Make sure MongoDB is running on your system!
echo.

echo Installing dependencies...
call npm run install-all

echo.
echo Starting production servers...
echo Frontend will run on http://localhost:3000
echo Backend will run on http://localhost:5000
echo Database: MongoDB (Persistent)
echo.

call npm run dev

pause
