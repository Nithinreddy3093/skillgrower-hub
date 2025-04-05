
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface AIAssistantState {
  isOpen: boolean;
  isMinimized: boolean;
  prompt: string;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  retryCount: number;
}
