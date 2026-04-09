import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onSubmit: () => void | Promise<void>;
  cancelText?: string;
  deleteText?: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = "确认删除",
  description,
  onSubmit,
  cancelText = "取消",
  deleteText = "删除",
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const handleDelete = async () => {
    try {
      await onSubmit();
      onOpenChange(false);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              void handleDelete();
            }}
            disabled={isLoading}
          >
            {deleteText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
