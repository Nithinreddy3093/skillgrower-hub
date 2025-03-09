
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Book, Video, FileText, Heart, Bookmark, Server, Filter, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Resource type definition
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

const Resources = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch resources from the API
  useEffect(() => {
    async function fetchResources() {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.functions.invoke('get-resources');
        
        if (error) {
          throw new Error(error.message);
        }
        
        setResources(data.data);
        setFilteredResources(data.data);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Failed to load resources. Please try again later.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load resources. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchResources();
  }, [toast]);

  // Filter resources based on search and filter criteria
  useEffect(() => {
    if (resources.length === 0) return;
    
    let filtered = [...resources];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        resource => 
          resource.title.toLowerCase().includes(query) || 
          resource.description.toLowerCase().includes(query) ||
          (resource.author && resource.author.toLowerCase().includes(query)) ||
          (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply type filter
    if (type !== "all") {
      filtered = filtered.filter(resource => resource.type === type);
    }
    
    // Apply difficulty filter
    if (difficulty !== "all") {
      filtered = filtered.filter(resource => resource.difficulty === difficulty);
    }
    
    // Apply category/tag filter
    if (category !== "all") {
      filtered = filtered.filter(
        resource => resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
      );
    }
    
    setFilteredResources(filtered);
  }, [searchQuery, type, difficulty, category, resources]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4 pb-12">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Resource Library</h1>
            <p className="text-gray-600 mt-2">
              Discover curated resources to enhance your skills and knowledge
            </p>
          </div>
        </div>

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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="h-64 animate-pulse bg-gray-100">
                <CardContent className="p-6 h-full flex items-center justify-center">
                  <p className="text-gray-400">Loading resources...</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredResources.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No resources found matching your criteria.</p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setType('all');
                  setDifficulty('all');
                  setCategory('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
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
                  <CardTitle className="mt-2">{resource.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    {resource.author && `By ${resource.author}`}
                    {resource.date_published && resource.author && ' • '}
                    {resource.date_published && new Date(resource.date_published).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">{resource.description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
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
                      onClick={() => toggleLike(resource.id)}
                    >
                      <Heart className={`w-5 h-5 ${resource.likes ? "fill-current text-red-500" : ""}`} />
                      <span>{resource.likes || 0}</span>
                    </button>
                    <button 
                      className="flex items-center gap-1 text-gray-500 hover:text-indigo-500 transition-colors"
                      onClick={() => toggleSave(resource.id)}
                    >
                      <Bookmark className={`w-5 h-5 ${resource.saved ? "fill-current text-indigo-500" : ""}`} />
                      <span>{resource.saved ? "Saved" : "Save"}</span>
                    </button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewResource(resource.url)}
                  >
                    View Resource
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Resources;
