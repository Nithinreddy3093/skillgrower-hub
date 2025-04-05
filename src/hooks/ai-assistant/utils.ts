
import { ChatMessage } from "./types";

export const autoResizeTextarea = (element: HTMLTextAreaElement | null) => {
  if (!element) return;
  
  element.style.height = 'auto';
  element.style.height = `${Math.min(element.scrollHeight, 150)}px`;
};

export const getWelcomeMessage = (): ChatMessage => ({
  id: crypto.randomUUID(),
  content: "Hi there! I'm your SkillTrack AI assistant. Ask me anything about learning, skill development, or how to reach your goals faster.",
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
  const messagesToSave = messages.slice(-20);
  localStorage.setItem(`skilltrack-chat-${userId}`, JSON.stringify(messagesToSave));
};
