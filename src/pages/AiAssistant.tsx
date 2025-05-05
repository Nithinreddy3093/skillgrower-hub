
import { Navigation } from "@/components/Navigation";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useState } from "react";
import { Bot, Zap, BookOpen, Sparkles, GraduationCap, ScrollText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ai-assistant/page/PageHeader";
import { AsideTopics, Topic } from "@/components/ai-assistant/page/AsideTopics";
import { AsideInfo } from "@/components/ai-assistant/page/AsideInfo";
import { ChatMessages } from "@/components/ai-assistant/page/ChatMessages";
import { ChatInputArea } from "@/components/ai-assistant/page/ChatInputArea";
import { toast } from "sonner";

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
  
  const topics: Topic[] = [
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
    
    if (!prompt.trim()) {
      toast.error("Please enter a message first");
      return;
    }
    
    // Append the current topic as context to help provide more relevant answers
    const topicContext = activeTopic !== "general" 
      ? `[Topic: ${topics.find(t => t.id === activeTopic)?.name}] `
      : "";
    
    const enrichedPrompt = topicContext + prompt;
    
    // Call the placeholder sendMessage function
    sendMessage(e, enrichedPrompt);
    
    // Call the placeholder setPrompt function
    setPrompt("");
  };
  
  const handleTopicChange = (topicId: string) => {
    setActiveTopic(topicId);
  };
  
  const currentTopicName = topics.find(t => t.id === activeTopic)?.name || "General Help";
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto pt-24 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <PageHeader clearConversation={clearConversation} />
          
          <div className="flex flex-col md:flex-row h-[calc(100vh-250px)]">
            {/* Topics sidebar */}
            <div className="w-full md:w-64 border-r dark:border-gray-700">
              <Tabs defaultValue="topics" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="topics">
                  <AsideTopics 
                    topics={topics} 
                    activeTopic={activeTopic} 
                    handleTopicChange={handleTopicChange}
                  />
                </TabsContent>
                
                <TabsContent value="info">
                  <AsideInfo 
                    activeTopic={activeTopic} 
                    topicName={currentTopicName} 
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <ChatMessages 
                  messages={messages} 
                  messagesEndRef={messagesEndRef} 
                  activeTopic={activeTopic}
                  topicName={currentTopicName}
                />
              </div>
              
              {/* Input */}
              <ChatInputArea
                prompt={prompt}
                isLoading={isLoading}
                topicName={currentTopicName}
                handleSendMessage={handleSendMessage}
                setPrompt={setPrompt}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
