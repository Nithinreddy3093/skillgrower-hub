
import { Book, Video, FileText, Heart, Bookmark, Server } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  type: string;
  difficulty: string;
  tags: string[];
  author: string;
  date_published?: string;
  rating?: number;
  language?: string;
  likes?: number;
  saved?: boolean;
}

interface ResourceCardProps {
  resource: Resource;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  onView: (url: string) => void;
}

export const ResourceCard = ({ resource, onLike, onSave, onView }: ResourceCardProps) => {
  // Get icon based on resource type
  const getIcon = (type: string) => {
    switch (type) {
      case "article":
        return <Book className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "tutorial":
        return <FileText className="w-5 h-5" />;
      case "course":
        return <Server className="w-5 h-5" />;
      case "book":
        return <Book className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Render resource rating as a progress bar
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-2">
        <Progress value={rating * 20} className="h-2 w-24" indicatorClassName={`bg-${rating > 4 ? 'green' : rating > 3 ? 'yellow' : 'red'}-500`} />
        <span className="text-xs font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            {getIcon(resource.type)}
            <span className="capitalize">{resource.type}</span>
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {resource.difficulty}
          </span>
        </div>
        <CardTitle className="mt-2 line-clamp-2">{resource.title}</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          {resource.author && `By ${resource.author}`}
          {resource.date_published && resource.author && ' • '}
          {resource.date_published && new Date(resource.date_published).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4 line-clamp-2">{resource.description}</p>
        {renderRating(resource.rating)}
        <div className="flex flex-wrap gap-2 mt-3">
          {resource.tags && resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
          {resource.tags && resource.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{resource.tags.length - 3} more
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
            onClick={() => onLike(resource.id)}
          >
            <Heart className={`w-5 h-5 ${resource.likes ? "fill-current text-red-500" : ""}`} />
            <span>{resource.likes || 0}</span>
          </button>
          <button 
            className="flex items-center gap-1 text-gray-500 hover:text-indigo-500 transition-colors"
            onClick={() => onSave(resource.id)}
          >
            <Bookmark className={`w-5 h-5 ${resource.saved ? "fill-current text-indigo-500" : ""}`} />
            <span>{resource.saved ? "Saved" : "Save"}</span>
          </button>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView(resource.url)}
        >
          View Resource
        </Button>
      </CardFooter>
    </Card>
  );
};
