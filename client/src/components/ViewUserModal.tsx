import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface ViewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any | null;
  onEditClick: () => void;
}

export default function ViewUserModal({ open, onOpenChange, user, onEditClick }: ViewUserModalProps) {
  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Details for <b>{user.first_name} {user.last_name}</b> ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          <div><b>Last Updated:</b> {new Date(user.last_updated).toLocaleString()}</div>
          <div><b>Client Number:</b> {user.client_number}</div>
          <div><b>Phone Number:</b> {user.phone_number}</div>
          <div><b>Alt Number:</b> {user.alt_number || 'N/A'}</div>
          <div><b>Address:</b> {user.address}</div>
          <div><b>Group and Template:</b> {user.group_template || 'N/A'}</div>
          <div><b>Status:</b> {user.status}</div>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <Button onClick={onEditClick}>
            <Pencil size={14} className="mr-2" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 