
import { Loader } from "lucide-react";
import { JournalEntry, JournalEntryItem } from "./JournalEntryItem";

interface JournalEntryListProps {
  entries: JournalEntry[];
  isLoading: boolean;
}

export const JournalEntryList = ({ entries, isLoading }: JournalEntryListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-center">
        <p className="text-gray-500">No journal entries yet. Start reflecting on your learning journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <JournalEntryItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
};
