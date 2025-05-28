@echo off
echo 🔧 Installing Backend Dependencies...
echo.

echo 📦 Installing FastAPI and core packages...
pip install fastapi>=0.115.2

echo 📦 Installing Uvicorn server...
pip install "uvicorn[standard]>=0.24.0"

echo 📦 Installing Neo4j driver...
pip install neo4j>=5.15.0

echo 📦 Installing OpenAI API...
pip install openai>=1.40.0

echo 📦 Installing Python utilities...
pip install python-dotenv>=1.0.0 pydantic>=2.7.0 python-multipart>=0.0.18 typing-extensions>=4.10.0

echo.
echo ✅ All dependencies installed!
echo 🚀 You can now start the backend with: python api/main.py
echo.
pause 