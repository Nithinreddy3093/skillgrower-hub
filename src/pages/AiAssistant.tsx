
import { Navigation } from "@/components/Navigation";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useState } from "react";
import { Bot, Send, Zap, BookOpen, Sparkles, GraduationCap, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/hooks/ai-assistant/types";
import { cn } from "@/lib/utils";
import { autoResizeTextarea } from "@/hooks/ai-assistant/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AiAssistant() {
  const {
    messages,
    prompt,
    isLoading,
    isStreaming,
    messagesEndRef,
    sendMessage,
    setPrompt,
    clearConversation
  } = useAIAssistant();
  
  const [activeTopic, setActiveTopic] = useState<string>("general");
  
  const topics = [
    { id: "general", name: "General Help", icon: <Zap size={18} /> },
    { id: "dsa", name: "Data Structures & Algorithms", icon: <BookOpen size={18} /> },
    { id: "c", name: "C Programming", icon: <ScrollText size={18} /> },
    { id: "cpp", name: "C++ Programming", icon: <ScrollText size={18} /> },
    { id: "os", name: "Operating Systems", icon: <GraduationCap size={18} /> },
    { id: "cyber", name: "Cybersecurity", icon: <Sparkles size={18} /> },
    { id: "ai", name: "Artificial Intelligence", icon: <Bot size={18} /> },
    { id: "python", name: "Python", icon: <ScrollText size={18} /> },
  ];
  
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Append the current topic as context to help provide more relevant answers
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="mr-3" size={24} />
              <h1 className="text-xl font-semibold">AI Learning Assistant</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              onClick={clearConversation}
            >
              New Chat
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row h-[calc(100vh-250px)]">
            {/* Topics sidebar */}
            <div className="w-full md:w-64 border-r dark:border-gray-700">
              <Tabs defaultValue="topics" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="topics" className="p-4 space-y-1">
                  {topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicChange(topic.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center",
                        activeTopic === topic.id 
                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <span className="mr-2">{topic.icon}</span>
                      {topic.name}
                    </button>
                  ))}
                </TabsContent>
                
                <TabsContent value="info" className="p-4">
                  <div className="space-y-4 text-sm">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <h3 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">Topic Selected</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Currently asking about: <span className="font-medium">{topics.find(t => t.id === activeTopic)?.name}</span>
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">How to use</h3>
                      <ul className="space-y-2 list-disc pl-5 text-gray-600 dark:text-gray-400">
                        <li>Select a topic from the sidebar</li>
                        <li>Ask specific questions about concepts</li>
                        <li>Request code examples or explanations</li>
                        <li>Get help debugging problems</li>
                        <li>Ask for study resources</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Example questions</h3>
                      <div className="space-y-1 text-gray-600 dark:text-gray-400">
                        <p>"Explain merge sort with an example"</p>
                        <p>"What are pointers in C?"</p>
                        <p>"How does virtual memory work in OS?"</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <Bot size={48} className="mx-auto mb-4 text-indigo-500 opacity-80" />
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
                            ? "bg-indigo-600 text-white rounded-br-none" 
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
                  className="flex-1 border dark:border-gray-600 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
