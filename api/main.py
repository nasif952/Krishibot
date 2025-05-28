import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    from dotenv import load_dotenv
    import uvicorn
except ImportError as e:
    print(f"Missing required packages: {e}")
    print("Please install: pip install fastapi uvicorn python-dotenv")
    sys.exit(1)

# Load environment variables
load_dotenv()

app = FastAPI(title="Bangladesh Agriculture RAG API", version="1.0.0")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG system with error handling
rag_system = None
try:
    from api.rag_system import AgricultureRAGSystem
    rag_system = AgricultureRAGSystem()
    print("✅ RAG System initialized successfully")
except Exception as e:
    print(f"⚠️ Warning: Could not initialize RAG system: {e}")
    print("The API will run in demo mode")

class ChatRequest(BaseModel):
    question: str
    approach: str = "GraphRAG"
    model: str = "GPT-4"

class ChatResponse(BaseModel):
    response: str
    approach: str
    model: str

@app.get("/")
async def root():
    return {"message": "Bangladesh Agriculture RAG API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "rag_system": "connected" if rag_system else "demo_mode"
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        if rag_system:
            # Use the original RAG logic
            raw_answer = rag_system.get_rag_answer(request.question)
            
            # Format the answer with markdown for better presentation
            formatted_answer = format_response_with_markdown(raw_answer, request.question)
            answer = formatted_answer
        else:
            # Demo response when RAG system is not available
            answer = f"[ডেমো মোড] আপনার প্রশ্ন '{request.question}' পেয়েছি। RAG সিস্টেম সংযুক্ত হলে সম্পূর্ণ উত্তর পাবেন।"
        
        return ChatResponse(
            response=answer,
            approach=request.approach,
            model=request.model
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

def format_response_with_markdown(text: str, question: str) -> str:
    """
    Format the response with markdown for better presentation
    """
    # Extract topic from question
    topic = question.strip().rstrip('?।').split()[-3:]
    topic = ' '.join(topic)
    
    # Create a formatted response with markdown
    formatted_text = f"""## {topic} সম্পর্কে তথ্য:

{text}

---
*উৎস: বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট*
"""
    return formatted_text

@app.get("/varieties")
async def get_varieties():
    """Get all available crop varieties"""
    try:
        if rag_system:
            varieties = rag_system.get_all_varieties()
            return {"varieties": varieties}
        else:
            # Demo varieties
            demo_varieties = [
                "ব্রি ধান২৮", "ব্রি ধান২৯", "ব্রি ধান৫০", "ব্রি ধান৫৮",
                "বারি আলু-৭", "বারি আলু-৮", "বারি টমেটো-২", "বারি টমেটো-৩"
            ]
            return {"varieties": demo_varieties}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching varieties: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Bangladesh Agriculture RAG API...")
    print("🌐 API will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    ) 