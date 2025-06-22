import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'csv' | 'xlsx') => void;
}

export default function ExportModal({ open, onOpenChange, onExport }: ExportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Select the format you want to export the user data in.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center space-x-4 pt-4">
            <Button onClick={() => onExport('csv')}>
                <Download size={16} className="mr-2" />
                Export as CSV
            </Button>
            <Button onClick={() => onExport('xlsx')}>
                <Download size={16} className="mr-2" />
                Export as XLSX
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 