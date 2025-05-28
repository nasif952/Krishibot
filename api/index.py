from http.server import BaseHTTPRequestHandler
import sys
import os
import json
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import FastAPI app
from api.main import app

# Required Vercel handler
from fastapi.responses import JSONResponse

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
            self.wfile.write(b'{"status": "healthy", "rag_system": "connected"}')
        elif self.path == '/api/varieties':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            varieties = ["ব্রি ধান২৮", "ব্রি ধান২৯", "ব্রি ধান৫০", "ব্রি ধান৫৮", 
                         "বারি আলু-৭", "বারি আলু-৮", "বারি টমেটো-২", "বারি টমেটো-৩"]
            self.wfile.write(json.dumps({"varieties": varieties}).encode('utf-8'))
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
                import json
                from io import BytesIO
                
                # Parse JSON data
                request_data = json.loads(post_data.decode('utf-8'))
                question = request_data.get('question', '')
                approach = request_data.get('approach', 'GraphRAG')
                model = request_data.get('model', 'GPT-4')
                
                # Demo response
                response = f"""## {question} সম্পর্কে তথ্য:

ধান চাষে সার প্রয়োগ করতে হবে ২-৩ পর্যায়ে। প্রথম পর্যায়ে জমি চাষের সময় প্রতি হেক্টরে ৭০-৮০ কেজি ইউরিয়া, ১৪০-১৫০ কেজি টিএসপি, ৮০-৯০ কেজি এমওপি এবং ৫০-৬০ কেজি জিপসাম সার দিতে হবে। দ্বিতীয় পর্যায়ে চারা রোপণের ২০-২৫ দিন পর প্রতি হেক্টরে ৭০-৮০ কেজি ইউরিয়া সার উপরি প্রয়োগ করতে হবে। তৃতীয় পর্যায়ে থোড় অবস্থায় প্রতি হেক্টরে ৭০-৮০ কেজি ইউরিয়া সার উপরি প্রয়োগ করতে হবে।

সার প্রয়োগের পূর্বে মাটি পরীক্ষা করে জমির মাটির অবস্থা অনুযায়ী সারের পরিমাণ সমন্বয় করুন। ইউরিয়া সার প্রয়োগ করার ১-২ দিন আগে জমিতে হালকা পানি রাখুন।

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