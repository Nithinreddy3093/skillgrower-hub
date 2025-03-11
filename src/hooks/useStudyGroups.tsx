
import { useState } from "react";
import { toast } from "sonner";
import { StudyGroupFormData } from "@/components/collaborate/StudyGroupForm";

interface StudyGroup {
  id: number;
  name: string;
  description: string;
  members: string;
  schedule: string;
  status: string;
  tags: string[];
  whatsappLink: string;
}

export const useStudyGroups = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([
    {
      id: 1,
      name: "React Study Group",
      description: "Weekly discussions about React best practices and advanced concepts.",
      members: "2/5",
      schedule: "Wednesdays at 18:00",
      status: "active",
      tags: ["React", "JavaScript", "TypeScript"],
      whatsappLink: "https://chat.whatsapp.com/HJjUz2dhGbyJw9mRBH2qSm"
    },
    {
      id: 2,
      name: "Leadership Skills Workshop",
      description: "Develop essential leadership and communication skills through practical exercises.",
      members: "1/8",
      schedule: "Mondays at 19:00",
      status: "upcoming",
      tags: ["Leadership", "Communication", "Time Management"],
      whatsappLink: "https://chat.whatsapp.com/IZyeVjk250I1Cy17NbWl8K"
    },
  ]);

  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleCreateGroup = async (formData: StudyGroupFormData) => {
    try {
      // In a real app, you would save to Supabase here
      const newId = studyGroups.length + 1;
      const newStudyGroup = {
        id: newId,
        name: formData.name,
        description: formData.description,
        members: `0/${formData.capacity}`,
        schedule: formData.schedule,
        status: "upcoming",
        tags: formData.tags.split(",").map(tag => tag.trim()),
        whatsappLink: formData.whatsappLink
      };

      // Update local state for demo
      setStudyGroups([...studyGroups, newStudyGroup]);
      
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

  return {
    studyGroups,
    showJoinDialog,
    setShowJoinDialog,
    selectedGroupId,
    handleCreateGroup,
    handleJoinGroup,
    confirmJoinGroup
  };
};
