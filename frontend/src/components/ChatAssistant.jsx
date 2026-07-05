import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, Sparkles, Loader } from 'lucide-react';
import api from '../utils/api';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'assistant',
      text: "Hi! I am your SmartShop AI Assistant. 🤖\n\nAsk me anything! For example:\n- *'I need a laptop for coding under 80000'* \n- *'Suggest running shoes'* \n- *'What headphones do you have under 3000?'*",
      recommendedProducts: []
    }
  ]);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll messages thread to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatHistory, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    setMessage('');
    
    // Add user message to state
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Build history for backend API (convert to raw format)
      const apiHistory = chatHistory.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      const { data } = await api.post('/assistant/chat', {
        message: userMsg,
        history: apiHistory
      });

      // Add assistant response to state
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: data.reply,
          recommendedProducts: data.recommendedProducts || []
        }
      ]);
    } catch (error) {
      console.error('Chat Assistant error:', error.message);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "I'm having trouble connecting to my brain right now. Please check if the backend server is running and try again!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (text) => {
    setMessage(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Floating Chat Box Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col mb-4 overflow-hidden animate-slide-in">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <div>
                <h4 className="font-bold text-sm">SmartShop AI Assistant</h4>
                <p className="text-[10px] text-primary-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online • Gemini 1.5 Flash
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-950/20">
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-slate-700/50'
                  }`}
                >
                  {/* Handle lines with markdown-like formats */}
                  <p className="whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </p>
                </div>

                {/* Render embedded product recommendations */}
                {msg.sender === 'assistant' && msg.recommendedProducts?.length > 0 && (
                  <div className="w-full mt-3 grid grid-cols-2 gap-2 animate-fade-in">
                    {msg.recommendedProducts.map(prod => (
                      <div 
                        key={prod._id}
                        onClick={() => {
                          navigate(`/product/${prod._id}`);
                          setIsOpen(false);
                        }}
                        className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-2.5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                      >
                        <img 
                          src={prod.images[0]} 
                          alt={prod.name} 
                          className="w-full h-20 object-cover rounded-lg bg-gray-50 mb-1.5" 
                        />
                        <h5 className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                          {prod.name}
                        </h5>
                        <p className="text-[10px] text-gray-400 mb-1">{prod.brand}</p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-[11px] font-extrabold text-primary-500">
                            ₹{prod.price.toLocaleString()}
                          </span>
                          <span className="text-[9px] bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded font-medium">
                            Details
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm max-w-[100px] border border-gray-100 dark:border-slate-700/50">
                <Loader className="h-4 w-4 animate-spin text-primary-500" />
                <span className="text-xs font-medium">Thinking</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Panel */}
          {chatHistory.length === 1 && (
            <div className="p-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              <button 
                onClick={() => handleQuickQuestion("Suggest running shoes")}
                className="bg-white dark:bg-slate-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-full text-xs font-semibold"
              >
                👟 Sugges Running Shoes
              </button>
              <button 
                onClick={() => handleQuickQuestion("Coding laptop under ₹80,000")}
                className="bg-white dark:bg-slate-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-full text-xs font-semibold"
              >
                💻 Coding Laptop &lt; 80K
              </button>
            </div>
          )}

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask for recommendations..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              className="flex-1 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3.5 py-2.5 rounded-xl text-xs border-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 text-white p-2.5 rounded-xl shadow-md transition-colors"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative group flex items-center justify-center"
        aria-label="Open chat assistant"
      >
        <Sparkles className="absolute -top-1.5 -left-1.5 h-5 w-5 text-yellow-400 animate-bounce" />
        <MessageSquare className="h-6 w-6" />
      </button>

    </div>
  );
};

export default ChatAssistant;
