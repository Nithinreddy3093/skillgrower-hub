
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { JournalEntry } from "@/components/journal/JournalEntryItem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface JournalDashboardProps {
  journalEntries: JournalEntry[];
  isLoading: boolean;
}

export const JournalDashboard = ({ journalEntries, isLoading }: JournalDashboardProps) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Recent Journal Entries</h2>
        <Link to="/journal" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white p-6 rounded-lg shadow-sm h-24"></div>
          ))}
        </div>
      ) : journalEntries.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 mb-4">You don't have any journal entries yet</p>
            <Button asChild>
              <Link to="/journal">Write Your First Entry</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {journalEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <p className="text-gray-600 line-clamp-2 flex-1">{entry.content}</p>
                  <div className="flex flex-col items-end ml-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      entry.mood === "happy" ? "bg-green-100 text-green-800" : 
                      entry.mood === "neutral" ? "bg-blue-100 text-blue-800" : 
                      "bg-red-100 text-red-800"
                    }`}>
                      {entry.mood}
                    </span>
                    <span className="text-xs text-gray-500 mt-2">
                      {format(new Date(entry.created_at), "PPp")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};
