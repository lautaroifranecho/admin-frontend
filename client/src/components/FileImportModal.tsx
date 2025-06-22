import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import io from "socket.io-client";

interface FileImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

export default function FileImportModal({ open, onOpenChange }: FileImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      socket.connect();
      socket.on('connect', () => {
        console.log('Socket connected with id:', socket.id);
      });
      socket.on('import_progress', (data: { progress: number }) => {
        setProgress(data.progress);
      });
    }

    return () => {
      socket.off('import_progress');
      socket.disconnect();
    };
  }, [open]);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('socketId', socket.id);

      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Import failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.bulkUpdate) {
        toast({
          title: "Import & Bulk Update Completed",
          description: `${data.successful} records imported. ${data.bulkUpdate.updatedCount} users updated to pending. ${data.bulkUpdate.emailsSent} emails sent.`,
        });
      } else if (data.bulkUpdateError) {
        toast({
          title: "Import Completed (Bulk Update Failed)",
          description: `${data.successful} records imported, but failed to update all users: ${data.bulkUpdateError}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import completed",
          description: `${data.results.length} records processed.`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
      setProgress(0);
    },
  });
  
  const handleClose = () => {
    setSelectedFile(null);
    setProgress(0);
    onOpenChange(false);
  };

  const handleFileSelect = (file: File | null) => {
    if (file && (file.type === "text/csv" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or Excel file.",
        variant: "destructive"
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      setProgress(0);
      importMutation.mutate(selectedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload size={20} />
            <span>Import User Data</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
            }`}
          >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-600" size={24} />
            </div>
            
            {selectedFile ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">File Selected</h3>
                <p className="text-gray-600 mb-4">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Drop your file here</h3>
                <p className="text-gray-600 mb-4">or click to browse</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFileSelect(e.target.files && e.target.files.length > 0 ? e.target.files[0] : null)}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <Button asChild className="rounded-xl">
                    <span>Choose File</span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-4">Supports CSV, Excel (.xlsx, .xls) up to 10MB</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end">
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || importMutation.isPending}
                className="rounded-xl"
              >
                {importMutation.isPending ? (
                  <div className="w-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    <span>Importing & Sending Emails... ({Math.round(progress)}%)</span>
                  </div>
                ) : (
                  "Import & Send Emails to All Users"
                )}
              </Button>
            </div>
          </div>

          {importMutation.isPending && (
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
