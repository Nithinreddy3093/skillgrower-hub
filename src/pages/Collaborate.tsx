
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Users, 
  Calendar, 
  BookOpen, 
  Tags, 
  Link as LinkIcon 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Collaborate = () => {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState([
    {
      id: 1,
      name: "React Study Group",
      description: "Weekly discussions about React best practices and advanced concepts.",
      members: "2/5",
      schedule: "Wednesdays at 18:00",
      status: "active",
      tags: ["React", "JavaScript", "TypeScript"],
      whatsappLink: "https://chat.whatsapp.com/example1"
    },
    {
      id: 2,
      name: "Leadership Skills Workshop",
      description: "Develop essential leadership and communication skills through practical exercises.",
      members: "1/8",
      schedule: "Mondays at 19:00",
      status: "upcoming",
      tags: ["Leadership", "Communication", "Time Management"],
      whatsappLink: "https://chat.whatsapp.com/example2"
    },
  ]);

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    capacity: "5",
    schedule: "",
    tags: "",
    whatsappLink: ""
  });
  
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGroup.name || !newGroup.description || !newGroup.whatsappLink) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Add validation for WhatsApp link
      if (!newGroup.whatsappLink.includes("chat.whatsapp.com")) {
        toast.error("Please enter a valid WhatsApp group invite link");
        return;
      }

      // In a real app, you would save to Supabase here
      const newId = studyGroups.length + 1;
      const newStudyGroup = {
        id: newId,
        name: newGroup.name,
        description: newGroup.description,
        members: `0/${newGroup.capacity}`,
        schedule: newGroup.schedule,
        status: "upcoming",
        tags: newGroup.tags.split(",").map(tag => tag.trim()),
        whatsappLink: newGroup.whatsappLink
      };

      // Update local state for demo
      setStudyGroups([...studyGroups, newStudyGroup]);
      
      // Reset form
      setNewGroup({
        name: "",
        description: "",
        capacity: "5",
        schedule: "",
        tags: "",
        whatsappLink: ""
      });
      
      toast.success("Study group created successfully!");
    } catch (error: any) {
      toast.error("Failed to create study group");
      console.error(error);
    }
  };

  const handleJoinGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    setShowJoinDialog(true);
  };

  const confirmJoinGroup = () => {
    const selectedGroup = studyGroups.find(group => group.id === selectedGroupId);
    if (selectedGroup) {
      // Here you would update the group membership in the database
      // For demo, just show a success message
      toast.success(`You've joined ${selectedGroup.name}!`);
      setShowJoinDialog(false);
      
      // Open WhatsApp link in a new tab
      window.open(selectedGroup.whatsappLink, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Connect with peers and learn together</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                + Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold dark:text-white">Create a Study Group</DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Fill in the details to create a new study group. You'll be the group admin.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300" htmlFor="name">
                    Group Name *
                  </label>
                  <Input
                    id="name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    placeholder="e.g., React Study Group"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300" htmlFor="description">
                    Description *
                  </label>
                  <Textarea
                    id="description"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    placeholder="What will your study group focus on?"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-gray-300" htmlFor="capacity">
                      Capacity
                    </label>
                    <Select
                      value={newGroup.capacity}
                      onValueChange={(value) => setNewGroup({...newGroup, capacity: value})}
                    >
                      <SelectTrigger id="capacity" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="3">3 members</SelectItem>
                        <SelectItem value="5">5 members</SelectItem>
                        <SelectItem value="10">10 members</SelectItem>
                        <SelectItem value="15">15 members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-gray-300" htmlFor="schedule">
                      Meeting Schedule
                    </label>
                    <Input
                      id="schedule"
                      value={newGroup.schedule}
                      onChange={(e) => setNewGroup({...newGroup, schedule: e.target.value})}
                      placeholder="e.g., Mondays at 18:00"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300" htmlFor="tags">
                    Tags (comma separated)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500">
                      <Tags className="h-4 w-4" />
                    </div>
                    <Input
                      id="tags"
                      value={newGroup.tags}
                      onChange={(e) => setNewGroup({...newGroup, tags: e.target.value})}
                      className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="JavaScript, React, Web Development"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300" htmlFor="whatsappLink">
                    WhatsApp Group Link *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <Input
                      id="whatsappLink"
                      value={newGroup.whatsappLink}
                      onChange={(e) => setNewGroup({...newGroup, whatsappLink: e.target.value})}
                      className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="https://chat.whatsapp.com/..."
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Create a WhatsApp group first and paste the invite link here
                  </p>
                </div>
                
                <DialogFooter>
                  <Button type="submit">Create Study Group</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search study groups..."
                className="w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
              />
            </div>
            <Select defaultValue="all">
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
            <Select defaultValue="all">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studyGroups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
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
                <Button 
                  className="flex-1"
                  onClick={() => handleJoinGroup(group.id)}
                >
                  Join Group
                </Button>
                <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  View Details →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Join Group Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Join Study Group</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              You're about to join this study group. You'll be redirected to the WhatsApp group.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By joining this group, you agree to participate actively and follow the group guidelines.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button onClick={confirmJoinGroup}>
              Join Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Collaborate;
