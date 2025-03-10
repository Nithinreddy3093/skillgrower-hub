
import { Filter, Search, X } from "lucide-react";
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
    <Card className="mb-8 dark:bg-gray-800 border dark:border-gray-700 theme-transition">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-4 flex items-center gap-2 relative">
            <Search className="text-gray-500 dark:text-gray-400 w-5 h-5 flex-shrink-0 absolute left-3" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500 dark:text-gray-400 w-5 h-5 flex-shrink-0" />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
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
            <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="machine learning">Machine Learning</SelectItem>
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="web development">Web Development</SelectItem>
              <SelectItem value="data science">Data Science</SelectItem>
              <SelectItem value="database">Databases</SelectItem>
            </SelectContent>
          </Select>
          <div className="col-span-1 md:col-span-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
