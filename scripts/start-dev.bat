@echo off
echo 🚀 Starting Bangladesh Agriculture RAG System Development Environment

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.9 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
npm install

REM Start backend in background
echo 🐍 Starting Python FastAPI backend on port 8000...
start "Backend" cmd /k "cd api && python main.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo ⚛️ Starting React frontend on port 5173...
start "Frontend" cmd /k "npm run dev"

echo ✅ Development environment started!
echo 🌐 Frontend: http://localhost:5173
echo 🔗 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to close this window...
pause >nul 