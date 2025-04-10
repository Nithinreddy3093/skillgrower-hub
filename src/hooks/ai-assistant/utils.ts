
import { ChatMessage } from "./types";

export const autoResizeTextarea = (element: HTMLTextAreaElement | null) => {
  if (!element) return;
  
  element.style.height = 'auto';
  element.style.height = `${Math.min(element.scrollHeight, 150)}px`;
};

export const getWelcomeMessage = (): ChatMessage => ({
  id: crypto.randomUUID(),
  content: "Hey there, Champion! 🚀 I'm your SkillGrower AI assistant powered by Google Gemini. Ready to conquer new skills today? Let's grow together! Ask me anything about learning, skill development, or how to reach your goals faster.",
  role: "assistant",
  timestamp: new Date(),
});

export const getSavedMessages = (userId: string): ChatMessage[] => {
  const savedMessages = localStorage.getItem(`skilltrack-chat-${userId}`);
  if (savedMessages) {
    try {
      return JSON.parse(savedMessages);
    } catch (e) {
      console.error("Error parsing saved messages:", e);
      return [getWelcomeMessage()];
    }
  }
  return [getWelcomeMessage()];
};

export const saveMessages = (userId: string, messages: ChatMessage[]) => {
  if (!userId || !messages.length) return;
  // Save more messages for better context
  const messagesToSave = messages.slice(-30);
  localStorage.setItem(`skilltrack-chat-${userId}`, JSON.stringify(messagesToSave));
};
