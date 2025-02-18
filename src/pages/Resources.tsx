
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Book, Video, FileText, Heart, Bookmark } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");

  const resources = [
    {
      type: "article",
      difficulty: "intermediate",
      title: "Mastering React Hooks",
      description: "A comprehensive guide to React Hooks with practical examples and best practices.",
      tags: ["React", "JavaScript", "Web Development"],
      likes: 42,
      saved: false,
    },
    {
      type: "video",
      difficulty: "beginner",
      title: "Effective Communication in Tech Teams",
      description: "Learn essential communication skills for working in technical teams.",
      tags: ["Communication", "Leadership", "Team Work"],
      likes: 28,
      saved: true,
    },
    {
      type: "tutorial",
      difficulty: "advanced",
      title: "Data Structures and Algorithms",
      description: "Interactive tutorial covering fundamental data structures and algorithms.",
      tags: ["Algorithms", "Problem Solving", "Data Structures"],
      likes: 156,
      saved: false,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "article":
        return <Book className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "tutorial":
        return <FileText className="w-5 h-5" />;
      default:
        return <Book className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Resource Library</h1>
            <p className="text-gray-600 mt-2">
              Discover curated resources to enhance your skills and knowledge
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-4">
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="tutorial">Tutorials</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="softSkills">Soft Skills</SelectItem>
                <SelectItem value="algorithms">Algorithms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    {getIcon(resource.type)}
                    <span className="capitalize">{resource.type}</span>
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {resource.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart className={`w-5 h-5 ${resource.likes > 50 ? "fill-current" : ""}`} />
                      <span>{resource.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-indigo-500 transition-colors">
                      <Bookmark className={`w-5 h-5 ${resource.saved ? "fill-current text-indigo-500" : ""}`} />
                      <span>{resource.saved ? "Saved" : "Save"}</span>
                    </button>
                  </div>
                  <Button variant="outline" size="sm">
                    View Resource
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Resources;
