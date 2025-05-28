from http.server import BaseHTTPRequestHandler
import sys
import os
import json
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Initialize environment variables
from dotenv import load_dotenv
load_dotenv()

# Import the RAG system
try:
    from api.rag_system import AgricultureRAGSystem
    rag_system = AgricultureRAGSystem()
    print("✅ RAG System initialized successfully")
    RAG_AVAILABLE = True
except Exception as e:
    print(f"⚠️ Warning: Could not initialize RAG system: {e}")
    print("The API will run in demo mode")
    RAG_AVAILABLE = False

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Route the request based on path
        if self.path == '/api' or self.path == '/api/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"message": "Bangladesh Agriculture RAG API is running"}')
        elif self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            status = "connected" if RAG_AVAILABLE else "demo_mode"
            self.wfile.write(json.dumps({"status": "healthy", "rag_system": status}).encode('utf-8'))
        elif self.path == '/api/varieties':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            if RAG_AVAILABLE:
                try:
                    # Get varieties from RAG system
                    varieties = rag_system.get_all_varieties()
                    self.wfile.write(json.dumps({"varieties": varieties}).encode('utf-8'))
                except Exception as e:
                    # Fallback to demo varieties
                    demo_varieties = ["ব্রি ধান২৮", "ব্রি ধান২৯", "ব্রি ধান৫০", "ব্রি ধান৫৮", 
                                     "বারি আলু-৭", "বারি আলু-৮", "বারি টমেটো-২", "বারি টমেটো-৩"]
                    self.wfile.write(json.dumps({"varieties": demo_varieties, "error": str(e)}).encode('utf-8'))
            else:
                # Demo varieties
                demo_varieties = ["ব্রি ধান২৮", "ব্রি ধান২৯", "ব্রি ধান৫০", "ব্রি ধান৫৮", 
                                 "বারি আলু-৭", "বারি আলু-৮", "বারি টমেটো-২", "বারি টমেটো-৩"]
                self.wfile.write(json.dumps({"varieties": demo_varieties}).encode('utf-8'))
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')
            
    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Process chat request
            try:
                # Parse JSON data
                request_data = json.loads(post_data.decode('utf-8'))
                question = request_data.get('question', '')
                approach = request_data.get('approach', 'GraphRAG')
                model = request_data.get('model', 'GPT-4')
                
                if RAG_AVAILABLE and approach == 'GraphRAG':
                    # Use the RAG system for responses
                    raw_answer = rag_system.get_rag_answer(question)
                    
                    # Format the answer with markdown
                    # Extract topic from question
                    topic = question.strip().rstrip('?।').split()[-3:]
                    topic = ' '.join(topic)
                    
                    # Create a formatted response with markdown
                    response = f"""## {topic} সম্পর্কে তথ্য:

{raw_answer}

---
*উৎস: বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট*"""
                else:
                    # Demo response when RAG system is not available or approach is RAG
                    response = f"""## {question} সম্পর্কে তথ্য:

ধান চাষে সার প্রয়োগ করতে হবে ২-৩ পর্যায়ে। প্রথম পর্যায়ে জমি চাষের সময় প্রতি হেক্টরে ৭০-৮০ কেজি ইউরিয়া, ১৪০-১৫০ কেজি টিএসপি, ৮০-৯০ কেজি এমওপি এবং ৫০-৬০ কেজি জিপসাম সার দিতে হবে। দ্বিতীয় পর্যায়ে চারা রোপণের ২০-২৫ দিন পর প্রতি হেক্টরে ৭০-৮০ কেজি ইউরিয়া সার উপরি প্রয়োগ করতে হবে। তৃতীয় পর্যায়ে থোড় অবস্থায় প্রতি হেক্টরে ৭০-৮০ কেজি ইউরিয়া সার উপরি প্রয়োগ করতে হবে।

[ডেমো মোড উত্তর] আপনার প্রশ্নের জন্য RAG সিস্টেম ব্যবহার করে উত্তর পাওয়া সম্ভব হয়নি।

---
*উৎস: বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট*"""
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response_data = {
                    "response": response,
                    "approach": approach,
                    "model": model
                }
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')

# Required Vercel handler
handler = Handler 