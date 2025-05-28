@echo off
echo 🔍 Checking Development Environment Status...
echo.

echo 📱 Frontend Status:
echo Checking if frontend is running on port 8080...
curl -s http://localhost:8080 >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend NOT running on port 8080
) else (
    echo ✅ Frontend running on http://localhost:8080
)

echo.
echo 🔗 Backend Status:
echo Checking if backend is running on port 8000...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend NOT running on port 8000
) else (
    echo ✅ Backend running on http://localhost:8000
)

echo.
echo 🌐 Testing API Connection:
curl -s http://localhost:8000/health
echo.

echo 📚 Access URLs:
echo 🎨 Frontend: http://localhost:8080
echo 🔗 Backend API: http://localhost:8000
echo 📖 API Docs: http://localhost:8000/docs
echo.
pause 