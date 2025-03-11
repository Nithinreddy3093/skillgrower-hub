
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchAndFiltersProps {
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  onStatusChange?: (status: string) => void;
}

export const SearchAndFilters = ({ 
  onSearch, 
  onCategoryChange, 
  onStatusChange 
}: SearchAndFiltersProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8 border border-gray-100 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search study groups..."
            className="w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>
        <Select defaultValue="all" onValueChange={(value) => onCategoryChange && onCategoryChange(value)}>
          <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="programming">Programming</SelectItem>
            <SelectItem value="softSkills">Soft Skills</SelectItem>
            <SelectItem value="design">Design</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all" onValueChange={(value) => onStatusChange && onStatusChange(value)}>
          <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="full">Full</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
