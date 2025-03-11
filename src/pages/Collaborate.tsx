
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudyGroupCard } from "@/components/collaborate/StudyGroupCard";
import { StudyGroupForm } from "@/components/collaborate/StudyGroupForm";
import { JoinGroupDialog } from "@/components/collaborate/JoinGroupDialog";
import { SearchAndFilters } from "@/components/collaborate/SearchAndFilters";
import { useStudyGroups } from "@/hooks/useStudyGroups";
import { useAuth } from "@/contexts/AuthContext";

const Collaborate = () => {
  const { user } = useAuth();
  const { 
    studyGroups, 
    showJoinDialog, 
    setShowJoinDialog, 
    handleCreateGroup, 
    handleJoinGroup, 
    confirmJoinGroup 
  } = useStudyGroups();

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
              <StudyGroupForm onCreateGroup={handleCreateGroup} />
            </DialogContent>
          </Dialog>
        </div>

        <SearchAndFilters />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studyGroups.map((group) => (
            <StudyGroupCard 
              key={group.id} 
              group={group} 
              onJoin={handleJoinGroup} 
            />
          ))}
        </div>
      </main>

      <JoinGroupDialog 
        open={showJoinDialog} 
        onOpenChange={setShowJoinDialog}
        onConfirm={confirmJoinGroup}
      />
    </div>
  );
};

export default Collaborate;
