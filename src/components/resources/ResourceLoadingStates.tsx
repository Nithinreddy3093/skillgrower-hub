
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ResourceLoadingProps {
  count?: number;
}

export const ResourceLoading = ({ count = 6 }: ResourceLoadingProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <Card key={index} className="h-64 animate-pulse bg-gray-100">
          <CardContent className="p-6 h-full flex items-center justify-center">
            <p className="text-gray-400">Loading resources...</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface ResourceProgressProps {
  visible: boolean;
}

export const ResourceProgress = ({ visible }: ResourceProgressProps) => {
  if (!visible) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <Progress value={undefined} className="h-1" indicatorClassName="bg-blue-500 animate-pulse" />
    </div>
  );
};

interface ResourceErrorProps {
  error: string;
  onRetry: () => void;
}

export const ResourceError = ({ error, onRetry }: ResourceErrorProps) => {
  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="p-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface ResourceEmptyProps {
  onClearFilters: () => void;
}

export const ResourceEmpty = ({ onClearFilters }: ResourceEmptyProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No resources found matching your criteria.</p>
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
