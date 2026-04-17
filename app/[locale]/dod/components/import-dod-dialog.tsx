"use client";

import * as React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudUploadIcon } from "lucide-react";
import { dodsApi } from "@/lib/api-client";

export function ImportDodDialog({
  open,
  onOpenChange,
  onImportSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}) {
  const ttt = useTranslations("common");
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
    }
  };

  const handleImport = async () => {
    if (importFiles.length === 0) {
      toast.error(ttt("Select Import Attachment") || "请选择要导入的文件");
      return;
    }

    try {
      setLoading(true);

      for (const file of importFiles) {
        await new Promise<void>((resolve, _reject) => {
          const fileReader = new FileReader();
          fileReader.readAsArrayBuffer(file);

          fileReader.onload = async (event) => {
            try {
              const { result } = event.target as FileReader;

              if (!result) {
                throw new Error(ttt("Import Failed") || "文件读取失败");
              }

              const xlsxModule = await import("xlsx");
              const XLSX = xlsxModule.default || xlsxModule;

              if (!XLSX || typeof XLSX.read !== "function") {
                throw new Error(ttt("Import Failed") || "XLSX库加载失败");
              }

              const workbook = XLSX.read(result, { type: "array" });
              let data: any[] = [];

              if (workbook && workbook.Sheets) {
                for (const sheet in workbook.Sheets) {
                  if (Object.prototype.hasOwnProperty.call(workbook.Sheets, sheet)) {
                    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
                      raw: false,
                    });
                    data = data.concat(sheetData);
                  }
                }
              }

              await dodsApi.upload({ dods: data });

              toast.success(`${ttt("Import Success") || "导入成功"}: ${data.length} 项`);
              resolve();
            } catch (error) {
              console.error(`Failed to parse Excel file ${file.name}:`, error);
              toast.error(`${ttt("Import Failed") || "导入失败"}: ${file.name}`);
              resolve();
            }
          };

          fileReader.onerror = () => {
            console.error(`Failed to read file ${file.name}`);
            toast.error(`${ttt("Import Failed") || "导入失败"}: ${file.name}`);
            resolve();
          };
        });
      }

      onImportSuccess();
      setImportFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to import dods:", error);
      toast.error(ttt("Import Failed") || "导入失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{ttt("import")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="border border-dashed rounded-lg p-10 text-center"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-primary");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-primary");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-primary");
              const files = e.dataTransfer.files;
              if (files && files.length > 0) {
                setImportFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
              }
            }}
          >
            <CloudUploadIcon className="mx-auto h-16 w-16 text-primary mb-6" />
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {ttt("Please drag and drop the file here or") || "请将导入文件或选择文件"}
                <Button
                  variant="default"
                  className="ml-2 bg-primary text-white hover:bg-primary/90"
                  onClick={() => document.getElementById("dod-file-upload")?.click()}
                >
                  {ttt("Select File") || "选择文件"}
                </Button>
              </p>
              <p className="text-xs text-gray-500">
                {ttt("User upload hint") || "仅支持.xls和.xlsx文件"}
              </p>
            </div>
            <input
              type="file"
              id="dod-file-upload"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
          </div>

          {importFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {importFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between rounded-md">
                  <div className="flex items-center gap-2">
                    <CloudUploadIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportFiles((prev) => prev.filter((_, i) => i !== index))}
                  >
                    {ttt("Delete") || "删除"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setImportFiles([]);
                onOpenChange(false);
              }}
            >
              {ttt("close") || "关闭"}
            </Button>
            <Button
              onClick={void handleImport}
              className="ml-2 bg-primary text-white hover:bg-primary/90"
              disabled={importFiles.length === 0 || loading}
            >
              {loading ? ttt("submitting") : ttt("submit")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
