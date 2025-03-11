
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const JoinGroupDialog = ({ open, onOpenChange, onConfirm }: JoinGroupDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Join Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
