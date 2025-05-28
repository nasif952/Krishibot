import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sun, Moon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `# আসসালামু আলাইকুম! 🌾
      
**বাংলাদেশ কৃষি সহায়ক চ্যাটবট**-এ আপনাকে স্বাগতম। আমি আপনার কৃষি সংক্রান্ত যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত।

আপনি এই বিষয়গুলি সম্পর্কে জিজ্ঞাসা করতে পারেন:
* ফসল চাষের পদ্ধতি
* সার ও কীটনাশক ব্যবহার
* রোগবালাই দমন
* জাত নির্বাচন
* আবহাওয়া সম্পর্কিত তথ্য

উদাহরণ: \`\`\`ধান চাষে সার প্রয়োগ কবে করবো?\`\`\`

> কৃষিতে আধুনিক প্রযুক্তির সাথে এগিয়ে চলুন!`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [approach, setApproach] = useState('GraphRAG');
  const [model, setModel] = useState('GPT-4');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Pre-filled example questions
  const exampleQuestions = [
    'ধান চাষে সার প্রয়োগ কবে করবো?',
    'পটল গাছে কীটনাশক কী ব্যবহার করবো?',
    'টমাটো চাষের সঠিক সময় কখন?',
    'গম ক্ষেতে পানি সেচ কিভাবে দিবো?'
  ];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const speechRecognition = new (window as any).webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'bn-BD';

      speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      speechRecognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "ভয়েস রিকগনিশন ত্রুটি",
          description: "আবার চেষ্টা করুন।",
          variant: "destructive"
        });
      };

      speechRecognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(speechRecognition);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognition) {
      toast({
        title: "ভয়েস রিকগনিশন সাপোর্ট নেই",
        description: "আপনার ব্রাউজার ভয়েস রিকগনিশন সাপোর্ট করে না।",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const data = await apiClient.chat({
        question: currentInput,
        approach: approach,
        model: model
      });
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "সংযোগ ত্রুটি",
        description: "দুঃখিত, সার্ভারের সাথে সংযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleExampleClick = (question: string) => {
    setInputValue(question);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-green-900' 
        : 'bg-gradient-to-br from-green-100 via-emerald-50 to-green-200'
    } relative overflow-hidden`}>
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-300 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-emerald-200 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-8 pb-8 max-w-6xl">
        {/* Enhanced Header with Dark Mode Toggle */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
                  : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
              }`}
              tabIndex={0}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 transition-all duration-500 px-2`}>
            🌾 বাংলাদেশ কৃষি সহায়ক চ্যাটবট
          </h1>
          <p className={`text-base md:text-lg font-medium transition-colors duration-500 px-2 ${
            isDarkMode ? 'text-green-300' : 'text-green-700'
          }`}>
            আপনার কৃষি সমস্যার স্মার্ট সমাধান
          </p>
        </div>

        {/* Enhanced Main Chat Container */}
        <div className={`backdrop-blur-lg rounded-3xl shadow-2xl border p-6 md:p-8 animate-scale-in transition-all duration-500 ${
          isDarkMode 
            ? 'bg-gray-800/30 border-gray-600/30' 
            : 'bg-white/20 border-white/30'
        }`}>
          {/* Controls */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="space-y-2">
              <label className={`block font-semibold text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-green-300' : 'text-green-800'
              }`}>
                🔍 Krishi Model
              </label>
              <select 
                value={approach}
                onChange={(e) => setApproach(e.target.value)}
                className={`w-full p-3 rounded-xl border-2 backdrop-blur-sm focus:outline-none transition-all duration-300 hover:shadow-lg font-medium ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700/70 text-gray-200 focus:border-green-400' 
                    : 'border-green-200 bg-white/70 text-green-800 focus:border-green-400 hover:bg-white/80'
                }`}
                tabIndex={0}
              >
                <option value="GraphRAG">Pro Model</option>
                <option value="RAG">Standard</option>
                {/* <option value="Finetuned Model">Finetuned Model</option> */}
              </select>
            </div>
            {/* <div className="space-y-2">
              <label className={`block font-semibold text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-green-300' : 'text-green-800'
              }`}>
                🤖 মডেল নির্বাচন করুন
              </label>
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={`w-full p-3 rounded-xl border-2 backdrop-blur-sm focus:outline-none transition-all duration-300 hover:shadow-lg font-medium ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700/70 text-gray-200 focus:border-green-400' 
                    : 'border-green-200 bg-white/70 text-green-800 focus:border-green-400 hover:bg-white/80'
                }`}
                tabIndex={0}
              >
                <option value="GPT-4">GPT-4</option>
                <option value="Claude 3">Claude 3</option>
                <option value="LLaMA 3">LLaMA 3</option>
                <option value="Mixtral">Mixtral</option>
                <option value="GPT-3.5">GPT-3.5</option>
              </select>
            </div> */}
          </div>

          {/* Enhanced Messages Container with Better Bubbles */}
          <div 
            ref={chatContainerRef}
            className={`backdrop-blur-sm rounded-2xl border p-4 md:p-6 h-[450px] overflow-y-auto mb-6 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent transition-all duration-500 ${
              isDarkMode 
                ? 'bg-gray-900/30 border-gray-600/40' 
                : 'bg-white/30 border-white/40'
            }`}
            id="chat-box"
          >
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[90%] px-5 py-4 shadow-lg backdrop-blur-sm border transition-all duration-300 hover:shadow-xl ${
                      message.sender === 'user'
                        ? `bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400/50 rounded-2xl rounded-br-md ${
                            isDarkMode ? 'from-green-600 to-emerald-600' : ''
                          }`
                        : `border-white/60 rounded-2xl rounded-bl-md ${
                            isDarkMode 
                              ? 'bg-gray-700/80 text-gray-200 border-gray-600/60' 
                              : 'bg-white/80 text-green-800'
                          }`
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
                    ) : (
                      <MarkdownRenderer 
                        content={message.text}
                        isDarkMode={isDarkMode}
                        messageId={message.id}
                      />
                    )}
                    <span className={`text-xs mt-1 block ${
                      message.sender === 'user' 
                        ? 'text-green-100' 
                        : isDarkMode ? 'text-gray-400' : 'text-green-600'
                    }`}>
                      {message.timestamp.toLocaleTimeString('bn-BD', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Enhanced Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className={`border backdrop-blur-sm px-5 py-4 rounded-2xl rounded-bl-md shadow-lg transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-gray-700/80 text-gray-200 border-gray-600/60' 
                      : 'bg-white/80 text-green-800 border-white/60'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">✍️ উত্তর প্রস্তুত হচ্ছে...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Pre-filled Example Questions */}
          <div className="mb-5">
            <p className={`text-sm font-medium mb-2 transition-colors duration-500 ${
              isDarkMode ? 'text-green-300' : 'text-green-700'
            }`}>
              💡 দ্রুত প্রশ্ন করুন:
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(question)}
                  className={`text-xs px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    isDarkMode 
                      ? 'bg-gray-700/50 text-green-300 hover:bg-gray-600/70 border border-gray-600' 
                      : 'bg-green-100/70 text-green-700 hover:bg-green-200/80 border border-green-200'
                  }`}
                  tabIndex={0}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Input Area with Voice Input */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="আপনার প্রশ্ন লিখুন... উদাহরণস্বরূপ: ধান চাষে সার প্রয়োগ কবে করবো?"
                className={`w-full p-4 pr-12 rounded-xl border-2 backdrop-blur-sm focus:outline-none transition-all duration-300 hover:shadow-lg resize-none font-medium ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700/70 text-gray-200 placeholder-gray-400 focus:border-green-400' 
                    : 'border-green-200 bg-white/70 text-green-800 placeholder-green-600/70 focus:border-green-400 hover:bg-white/80'
                }`}
                rows={2}
                disabled={isLoading}
                tabIndex={0}
              />
              {/* Voice Input Button */}
              <button
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`absolute right-3 top-3 p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : isDarkMode 
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="ভয়েস ইনপুট"
                tabIndex={0}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 min-w-[120px]"
              tabIndex={0}
            >
              <Send size={18} />
              পাঠান
            </button>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className={`text-center mt-6 text-sm opacity-80 transition-colors duration-500 ${
          isDarkMode ? 'text-green-300' : 'text-green-700'
        }`}>
          <p>🌱 আধুনিক কৃষি প্রযুক্তির সাথে এগিয়ে চলুন</p>
        </div>
      </div>
    </div>
  );
};

export default Index; 