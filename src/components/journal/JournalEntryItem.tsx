
import { format } from "date-fns";
import { Smile, Meh, Frown } from "lucide-react";

export interface JournalEntry {
  id: string;
  content: string;
  mood: "happy" | "neutral" | "sad";
  skills: string[];
  created_at: string;
  user_id: string;
}

interface JournalEntryItemProps {
  entry: JournalEntry;
}

export const JournalEntryItem = ({ entry }: JournalEntryItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE, MMMM d, yyyy");
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500">{formatDate(entry.created_at)}</span>
        {entry.mood === "happy" && <Smile className="text-green-500" />}
        {entry.mood === "neutral" && <Meh className="text-yellow-500" />}
        {entry.mood === "sad" && <Frown className="text-red-500" />}
      </div>
      <p className="text-gray-700 mb-4">{entry.content}</p>
      <div className="flex flex-wrap gap-2">
        {entry.skills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};
