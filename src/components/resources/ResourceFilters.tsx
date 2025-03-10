
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface ResourceFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  clearFilters: () => void;
}

export const ResourceFilters = ({
  searchQuery,
  setSearchQuery,
  type,
  setType,
  difficulty,
  setDifficulty,
  category,
  setCategory,
  clearFilters,
}: ResourceFiltersProps) => {
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-4 flex items-center gap-2">
            <Search className="text-gray-500 w-5 h-5 flex-shrink-0" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500 w-5 h-5 flex-shrink-0" />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="tutorial">Tutorials</SelectItem>
                <SelectItem value="course">Courses</SelectItem>
                <SelectItem value="book">Books</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="machine learning">Machine Learning</SelectItem>
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="web development">Web Development</SelectItem>
              <SelectItem value="data science">Data Science</SelectItem>
              <SelectItem value="database">Databases</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
