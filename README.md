# 🌾 Bangladesh Agriculture RAG Chatbot

A full-stack agricultural information system using RAG (Retrieval-Augmented Generation) with Neo4j graph database and OpenAI GPT models. The system provides intelligent answers to agricultural questions in Bengali.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + Python
- **Database**: Neo4j Graph Database
- **AI**: OpenAI GPT-4 for natural language processing
- **Deployment**: Vercel (Full-stack)

## 🚀 Features

- 🤖 Intelligent Bengali agricultural chatbot
- 🔍 Graph-based RAG system with Neo4j
- 🎯 Variety-specific crop information
- 🎨 Beautiful, responsive UI with dark/light mode
- 🎤 Voice input support (Bengali)
- 📱 Mobile-friendly design
- 🔒 Secure API key management

## 📋 Prerequisites

- **Node.js** 16+ 
- **Python** 3.9+
- **Neo4j** Database (cloud or local)
- **OpenAI** API Key

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd krishti-chat-glow-main
```

### 2. Environment Configuration

Create `.env` file in the root directory:

```bash
# Neo4j Database Configuration
NEO4J_URI=your_neo4j_uri_here
NEO4J_USERNAME=your_neo4j_username
NEO4J_PASSWORD=your_neo4j_password
NEO4J_DATABASE=neo4j

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Development
NODE_ENV=development
```

Create `.env.local` for frontend:

```bash
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Install Dependencies

**Backend Dependencies:**
```bash
pip install -r requirements.txt
```

**Frontend Dependencies:**
```bash
npm install
```

### 4. Start Development Servers

**Option A: Use the development script (Linux/Mac):**
```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

**Option B: Start manually:**

**Backend (Terminal 1):**
```bash
cd api
python main.py
```

**Frontend (Terminal 2):**
```bash
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🌐 Deployment to Vercel

### 1. Prepare for Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard

### 2. Vercel Environment Variables

In your Vercel project settings, add these environment variables:

```
NEO4J_URI=your_neo4j_uri
NEO4J_USERNAME=your_neo4j_username
NEO4J_PASSWORD=your_neo4j_password
NEO4J_DATABASE=neo4j
OPENAI_API_KEY=your_openai_api_key
VITE_API_BASE_URL=https://your-vercel-domain.vercel.app
```

### 3. Deploy

Vercel will automatically deploy your application using the `vercel.json` configuration.

## 📁 Project Structure

```
krishti-chat-glow-main/
├── api/                          # FastAPI Backend
│   ├── __init__.py
│   ├── main.py                   # FastAPI application
│   └── rag_system.py            # RAG logic (preserved from final.py)
├── src/                          # React Frontend
│   ├── components/               # UI Components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities and API client
│   ├── pages/                    # Page components
│   └── main.tsx                  # App entry point
├── scripts/                      # Development scripts
├── .env                          # Backend environment variables
├── .env.local                    # Frontend environment variables
├── .env.example                  # Environment template
├── requirements.txt              # Python dependencies
├── package.json                  # Node.js dependencies
├── vercel.json                   # Vercel deployment config
└── README.md                     # This file
```

## 🔧 API Endpoints

### Chat Endpoint
```
POST /chat
{
  "question": "ধান চাষে সার প্রয়োগ কবে করবো?",
  "approach": "GraphRAG",
  "model": "GPT-4"
}
```

### Varieties Endpoint
```
GET /varieties
```

### Health Check
```
GET /health
```

## 🎯 Core RAG Logic

The RAG system preserves the exact logic from the original `final.py`:

1. **Variety Extraction**: Identifies specific crop varieties mentioned in questions
2. **Fulltext Search**: Uses Neo4j fulltext indexes across multiple agricultural properties
3. **Context Filtering**: Filters results by variety when specific varieties are mentioned
4. **Answer Generation**: Uses OpenAI GPT-4 to generate contextual answers

## 🔒 Security Features

- Environment variables for sensitive data
- CORS configuration for secure API access
- API key validation
- Input sanitization

## 🐛 Troubleshooting

### Common Issues

1. **Neo4j Connection Error**
   - Verify your Neo4j credentials in `.env`
   - Check if your Neo4j instance is running
   - Ensure network connectivity

2. **OpenAI API Error**
   - Verify your OpenAI API key
   - Check API usage limits
   - Ensure sufficient credits

3. **Frontend API Connection Error**
   - Check if backend is running on port 8000
   - Verify `VITE_API_BASE_URL` in `.env.local`
   - Check CORS configuration

### Development Tips

- Use `npm run dev` for frontend hot reload
- Backend auto-reloads with uvicorn
- Check browser console for frontend errors
- Check terminal logs for backend errors

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions, please create an issue in the GitHub repository.

---

**Built with ❤️ for Bangladesh Agriculture**
