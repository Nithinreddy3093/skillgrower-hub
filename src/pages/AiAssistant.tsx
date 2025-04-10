
import { Navigation } from "@/components/Navigation";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/hooks/ai-assistant/types";
import { cn } from "@/lib/utils";
import { autoResizeTextarea } from "@/hooks/ai-assistant/utils";

export default function AiAssistant() {
  const {
    messages,
    prompt,
    isLoading,
    isStreaming,
    messagesEndRef,
    sendMessage,
    setPrompt,
  } = useAIAssistant();
  
  const [activeTopic, setActiveTopic] = useState<string>("general");
  
  const topics = [
    { id: "general", name: "General Help", icon: "🌟" },
    { id: "dsa", name: "Data Structures & Algorithms", icon: "🔍" },
    { id: "c", name: "C Programming", icon: "📝" },
    { id: "cpp", name: "C++ Programming", icon: "⚙️" },
    { id: "os", name: "Operating Systems", icon: "💻" },
    { id: "cyber", name: "Cybersecurity", icon: "🔒" },
    { id: "ai", name: "Artificial Intelligence", icon: "🤖" },
    { id: "python", name: "Python", icon: "🐍" },
  ];
  
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Append the current topic as context to help Gemini provide more relevant answers
    const topicContext = activeTopic !== "general" 
      ? `[Topic: ${topics.find(t => t.id === activeTopic)?.name}] `
      : "";
    
    const enrichedPrompt = topicContext + prompt;
    setPrompt(enrichedPrompt);
    sendMessage(e);
  };
  
  const handleTopicChange = (topicId: string) => {
    setActiveTopic(topicId);
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    autoResizeTextarea(e.target);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto pt-24 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-green-600 dark:bg-green-700 text-white flex items-center">
            <Bot className="mr-3" size={24} />
            <h1 className="text-xl font-semibold">SkillGrower AI Assistant</h1>
            <span className="ml-2 text-xs bg-green-500 dark:bg-green-800 px-2 py-1 rounded-full">
              Powered by Gemini 1.5
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row h-[calc(100vh-250px)]">
            {/* Topics sidebar */}
            <div className="w-full md:w-64 border-r dark:border-gray-700 p-4">
              <h2 className="font-medium mb-3 text-gray-600 dark:text-gray-300">Topics</h2>
              <div className="space-y-1">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicChange(topic.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center",
                      activeTopic === topic.id 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <span className="mr-2">{topic.icon}</span>
                    {topic.name}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="text-sm font-medium text-green-700 dark:text-green-300">Topic Selected</h3>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  Ask any questions about {topics.find(t => t.id === activeTopic)?.name} and get instant help from our AI assistant.
                </p>
              </div>
            </div>
            
            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <Bot size={48} className="mx-auto mb-4 text-green-500 opacity-80" />
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        How can I help you learn today?
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Ask me anything about {topics.find(t => t.id === activeTopic)?.name}. I'm here to help with explanations, examples, and tips.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message: ChatMessage) => (
                    <div 
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div 
                        className={cn(
                          "max-w-3/4 rounded-lg p-4",
                          message.role === "user" 
                            ? "bg-green-600 text-white rounded-br-none" 
                            : "bg-gray-100 dark:bg-gray-700 rounded-bl-none"
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              <form 
                onSubmit={handleSendMessage}
                className="border-t dark:border-gray-700 p-4 flex items-end gap-2"
              >
                <textarea
                  value={prompt}
                  onChange={handleTextareaChange}
                  placeholder={`Ask about ${topics.find(t => t.id === activeTopic)?.name}...`}
                  className="flex-1 border dark:border-gray-600 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
