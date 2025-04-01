
import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          content: "Hi there! I'm your SkillTrack AI assistant. How can I help with your learning journey today?",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom of message container
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    
    try {
      // Get response from AI
      const { data, error } = await supabase.functions.invoke("skill-assistant", {
        method: "POST",
        body: { 
          message: userMessage.content,
          userId: user?.id,
          history: messages.slice(-6).map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }))
        },
      });
      
      if (error) throw new Error(error.message);
      
      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.response || "I'm sorry, I couldn't process your request. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response from assistant. Please try again.",
      });
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chatbot trigger button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg"
        >
          <Bot size={24} />
        </Button>
      )}

      {/* Chatbot window */}
      {isOpen && (
        <div 
          className={`fixed ${isMinimized ? 'bottom-6 right-6 w-auto h-auto' : 'bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px]'} 
            bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 
            flex flex-col transition-all duration-200 overflow-hidden z-50`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-indigo-600 dark:bg-indigo-700 text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-medium">Skill Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-white hover:bg-indigo-500 rounded-full"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-indigo-500 rounded-full"
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages container */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 max-w-[80%] ${
                      msg.sender === "user" ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div
                      className={`text-xs mt-1 text-gray-500 ${
                        msg.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about skills, learning paths..."
                    disabled={isLoading}
                    className="flex-1 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !message.trim()}>
                    <Send size={18} />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
