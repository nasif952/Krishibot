#!/usr/bin/env python3

print("🔍 Testing FastAPI setup...")

try:
    from fastapi import FastAPI
    print("✅ FastAPI imported successfully")
except ImportError as e:
    print(f"❌ FastAPI import failed: {e}")
    exit(1)

try:
    import uvicorn
    print("✅ Uvicorn imported successfully")
except ImportError as e:
    print(f"❌ Uvicorn import failed: {e}")
    exit(1)

try:
    from dotenv import load_dotenv
    print("✅ python-dotenv imported successfully")
except ImportError as e:
    print(f"❌ python-dotenv import failed: {e}")
    exit(1)

# Create a simple FastAPI app
app = FastAPI(title="Test API")

@app.get("/")
async def root():
    return {"message": "Test API is working!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    print("🚀 Starting test server...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info") 