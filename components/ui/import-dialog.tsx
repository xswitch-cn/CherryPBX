import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CloudUploadIcon, XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImportDialogProps {
  /** 弹窗是否打开 */
  open: boolean;
  /** 弹窗打开状态改变回调 */
  onOpenChange: (open: boolean) => void;
  /** 弹窗标题 */
  title?: string;
  /** 接受的文件类型，如 ".xlsx, .xls" */
  accept?: string;
  /** 文件类型描述文本 */
  acceptDescription?: string;
  /** 导入处理函数，接收文件数组 */
  onImport: (files: File[]) => Promise<void>;
  /** 导入加载状态 */
  isLoading?: boolean;
  /** 自定义文件列表项渲染 */
  renderFileItem?: (file: File, index: number, removeFile: (index: number) => void) => ReactNode;
}

export function ImportDialog({
  open,
  onOpenChange,
  title,
  accept = ".xlsx, .xls",
  acceptDescription,
  onImport,
  isLoading = false,
  renderFileItem,
}: ImportDialogProps) {
  const t = useTranslations("common");
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(uploadedFiles)]);
    }
    // 清空 input 值，允许重复选择同一文件
    event.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary");
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(droppedFiles)]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary");
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setFiles([]);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    await onImport(files);
    // 导入成功后清空文件列表（由父组件决定是否关闭弹窗）
    setFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title || t("import")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* 拖拽上传区域 */}
          <div
            className="border border-dashed rounded-lg p-10 text-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUploadIcon className="mx-auto h-16 w-16 text-primary mb-6" />
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {t("Please drag and drop the file here or") || "请将文件拖拽至此处或"}
                <Button
                  variant="default"
                  className="ml-2 bg-primary text-white hover:bg-primary/90"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  {t("Select File") || "选择文件"}
                </Button>
              </p>
              {acceptDescription && <p className="text-xs text-gray-500">{acceptDescription}</p>}
            </div>
            <input
              type="file"
              id="file-upload"
              accept={accept}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) =>
                renderFileItem ? (
                  renderFileItem(file, index, removeFile)
                ) : (
                  <div key={index} className="flex items-center justify-between rounded-md">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <CloudUploadIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              )}
            </div>
          )}

          {/* 底部按钮 */}
          <DialogFooter className="justify-end">
            <Button variant="outline" onClick={handleClose}>
              {t("close") || "关闭"}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              className="ml-2 bg-primary text-white hover:bg-primary/90"
              disabled={files.length === 0 || isLoading}
            >
              {isLoading ? t("importing") || "导入中..." : t("submit") || "提交"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
