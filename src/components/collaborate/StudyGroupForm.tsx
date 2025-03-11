
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tags, Link as LinkIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface StudyGroupFormProps {
  onCreateGroup: (group: StudyGroupFormData) => void;
}

export interface StudyGroupFormData {
  name: string;
  description: string;
  capacity: string;
  schedule: string;
  tags: string;
  whatsappLink: string;
}

export const StudyGroupForm = ({ onCreateGroup }: StudyGroupFormProps) => {
  const [newGroup, setNewGroup] = useState<StudyGroupFormData>({
    name: "",
    description: "",
    capacity: "5",
    schedule: "",
    tags: "",
    whatsappLink: ""
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGroup.name || !newGroup.description || !newGroup.whatsappLink) {
      toast.error("Please fill all required fields");
      return;
    }

    // Add validation for WhatsApp link
    if (!newGroup.whatsappLink.includes("chat.whatsapp.com")) {
      toast.error("Please enter a valid WhatsApp group invite link");
      return;
    }

    onCreateGroup(newGroup);
    
    // Reset form
    setNewGroup({
      name: "",
      description: "",
      capacity: "5",
      schedule: "",
      tags: "",
      whatsappLink: ""
    });
  };

  return (
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
  );
};
