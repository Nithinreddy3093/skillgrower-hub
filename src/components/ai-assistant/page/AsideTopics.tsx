
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type Topic = {
  id: string;
  name: string;
  icon: ReactNode;
};

interface AsideTopicsProps {
  topics: Topic[];
  activeTopic: string;
  handleTopicChange: (topicId: string) => void;
}

export const AsideTopics = ({ topics, activeTopic, handleTopicChange }: AsideTopicsProps) => {
  return (
    <div className="p-4 space-y-1">
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
    </div>
  );
};
