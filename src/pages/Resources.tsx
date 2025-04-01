
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { ResourcePagination } from "@/components/resources/ResourcePagination";
import { 
  ResourceLoading, 
  ResourceProgress, 
  ResourceError, 
  ResourceEmpty 
} from "@/components/resources/ResourceLoadingStates";
import { Resource, Pagination } from "@/components/resources/types";
import { AddResourceForm } from "@/components/resources/AddResourceForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Resources = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // 500ms delay
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch resources from the API with pagination and filtering
  useEffect(() => {
    let isMounted = true;
    async function fetchResources() {
      if (isInitialLoad) {
        setIsLoading(true);
      }
      setError(null);
      
      try {
        // Construct query parameters string for the URL 
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString()
        });
        
        if (debouncedSearch) queryParams.set('search', debouncedSearch);
        if (type !== 'all') queryParams.set('type', type);
        if (difficulty !== 'all') queryParams.set('difficulty', difficulty);
        if (category !== 'all') queryParams.set('category', category);
        
        // Convert the URLSearchParams to a query string
        const queryString = queryParams.toString();
        
        // Correctly invoke the edge function with the query string in the URL
        const { data, error } = await supabase.functions.invoke(
          'get-resources' + (queryString ? `?${queryString}` : ''),
          { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (isMounted) {
          setResources(data.data);
          setPagination(data.pagination);
        }
      } catch (err: any) {
        console.error("Error fetching resources:", err);
        if (isMounted) {
          setError("Failed to load resources. Please try again later.");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load resources. Please try again later.",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialLoad(false);
        }
      }
    }
    
    fetchResources();
    
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, type, difficulty, category, pagination.page, pagination.limit, toast]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle like status for a resource
  const toggleLike = (id: number) => {
    setResources(resources.map(resource => 
      resource.id === id 
        ? { ...resource, likes: (resource.likes || 0) + (resource.likes ? -1 : 1) } 
        : resource
    ));
    
    toast({
      title: "Success",
      description: "Resource like status updated!",
    });
  };

  // Toggle save status for a resource
  const toggleSave = (id: number) => {
    setResources(resources.map(resource => 
      resource.id === id 
        ? { ...resource, saved: !resource.saved } 
        : resource
    ));
    
    toast({
      title: "Success",
      description: `Resource ${resources.find(r => r.id === id)?.saved ? 'removed from' : 'added to'} saved items!`,
    });
  };

  // Handle view resource action
  const handleViewResource = (url: string) => {
    window.open(url, '_blank');
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setType('all');
    setDifficulty('all');
    setCategory('all');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Reload page
  const handleRetry = () => {
    window.location.reload();
  };

  // Handle success after adding a resource
  const handleResourceAdded = () => {
    // Reset to first page and refresh resources
    setPagination(prev => ({ ...prev, page: 1 }));
    setIsInitialLoad(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Resource Library</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Discover curated resources to enhance your skills and knowledge
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowAddResourceForm(true)}
          >
            <Plus size={16} />
            Add Resource
          </Button>
        </div>

        <ResourceFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          type={type}
          setType={setType}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          category={category}
          setCategory={setCategory}
          clearFilters={clearFilters}
        />

        {isInitialLoad ? (
          <ResourceLoading />
        ) : error ? (
          <ResourceError error={error} onRetry={handleRetry} />
        ) : resources.length === 0 ? (
          <ResourceEmpty onClearFilters={clearFilters} />
        ) : (
          <>
            <ResourceProgress visible={isLoading && !isInitialLoad} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {resources.map((resource) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  onLike={toggleLike}
                  onSave={toggleSave}
                  onView={handleViewResource}
                />
              ))}
            </div>
            <ResourcePagination 
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      {/* Add Resource Dialog */}
      <AddResourceForm 
        open={showAddResourceForm} 
        onClose={() => setShowAddResourceForm(false)}
        onSuccess={handleResourceAdded}
      />
    </div>
  );
};

export default Resources;
