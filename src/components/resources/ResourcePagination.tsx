
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ResourcePagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <div className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
