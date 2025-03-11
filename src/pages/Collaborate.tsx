
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Calendar, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Collaborate = () => {
  const studyGroups = [
    {
      name: "React Study Group",
      description: "Weekly discussions about React best practices and advanced concepts.",
      members: "2/5",
      schedule: "Wednesdays at 18:00",
      status: "active",
      tags: ["React", "JavaScript", "TypeScript"],
    },
    {
      name: "Leadership Skills Workshop",
      description: "Develop essential leadership and communication skills through practical exercises.",
      members: "1/8",
      schedule: "Mondays at 19:00",
      status: "upcoming",
      tags: ["Leadership", "Communication", "Time Management"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Connect with peers and learn together</p>
          </div>
          <Button>
            + Create Group
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search study groups..."
                className="w-full dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="softSkills">Soft Skills</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studyGroups.map((group, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
                <Button className="flex-1">
                  Join Group
                </Button>
                <Button variant="outline">
                  View Details →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Collaborate;
