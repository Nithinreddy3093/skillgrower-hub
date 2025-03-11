
import { Button } from "@/components/ui/button";
import { Users, Calendar } from "lucide-react";

interface StudyGroupCardProps {
  group: {
    id: number;
    name: string;
    description: string;
    members: string;
    schedule: string;
    status: string;
    tags: string[];
    whatsappLink: string;
  };
  onJoin: (groupId: number) => void;
}

export const StudyGroupCard = ({ group, onJoin }: StudyGroupCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{group.name}</h3>
        <span className={`px-3 py-1 rounded-full text-sm ${
          group.status === "active" 
            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
            : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100"
        }`}>
          {group.status}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{group.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {group.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{group.members} members</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{group.schedule}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          className="flex-1"
          onClick={() => onJoin(group.id)}
        >
          Join Group
        </Button>
        <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
          View Details →
        </Button>
      </div>
    </div>
  );
};
