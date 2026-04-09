"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioPlayer } from "@/components/ui/audio-player";
import { toast } from "sonner";

interface MediaFile {
  id: number;
  name: string;
  description?: string;
  type?: string;
  file_size?: number;
  abs_path?: string;
  rel_path?: string;
  ext?: string;
  k?: string;
  v?: string;
}

interface SelectRingFileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mediaFile: MediaFile) => void;
  notShowTypes?: string;
}

function formatSizeUnits(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileExt(filename: string): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function SelectRingFile({
  open,
  onOpenChange,
  onSelect,
  notShowTypes = "",
}: SelectRingFileProps) {
  const [mfileTypes, setMfileTypes] = React.useState<MediaFile[]>([]);
  const [mfileType, setMfileType] = React.useState<string>("all");
  const [ringtones, setRingtones] = React.useState<MediaFile[]>([]);
  const [mediaFiles, setMediaFiles] = React.useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<MediaFile | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (open) {
      void loadFileTypes();
      void loadRingtones();
      void loadMediaFiles();
    }
  }, [open]);

  const loadFileTypes = async () => {
    try {
      const response = await fetch("/api/dicts?realm=MFILE_TYPE");
      const data = await response.json();
      const filteredData = data.filter((item: MediaFile) => !notShowTypes.includes(item.k || ""));
      setMfileTypes(filteredData);
    } catch (error) {
      console.error("Failed to load file types:", error);
    }
  };

  const loadRingtones = async () => {
    try {
      const response = await fetch("/api/dicts?realm=TONE");
      const data = await response.json();
      setRingtones(data);
    } catch (error) {
      console.error("Failed to load ringtones:", error);
    }
  };

  const loadMediaFiles = async (type?: string, searchQuery?: string) => {
    try {
      let url = "/api/media_files?perPage=500";
      if (type && type !== "all" && type !== "ringtone") {
        url += `&type=${type}`;
      }
      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      const filteredData = data.data?.filter(
        (item: MediaFile) => !notShowTypes.includes(item.type || ""),
      );
      setMediaFiles(filteredData || []);
    } catch (error) {
      console.error("Failed to load media files:", error);
    }
  };

  const handleFileTypeChange = (type: string) => {
    setMfileType(type);
    setSelectedFile(null);
    if (type === "ringtone") {
      setMediaFiles([]);
    } else {
      void loadMediaFiles(type, search);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (mfileType !== "ringtone") {
      void loadMediaFiles(mfileType, value);
    }
  };

  const handleFileSelect = (file: MediaFile) => {
    setSelectedFile(file);
  };

  const handleOK = () => {
    if (selectedFile) {
      if (mfileType === "ringtone") {
        const ringtone: MediaFile = {
          ...selectedFile,
          type: "RINGTONE",
          name: selectedFile.k || "",
          abs_path: `tone_stream://${selectedFile.v}`,
          rel_path: `tone_stream://${selectedFile.v}`,
        };
        onSelect(ringtone);
      } else {
        onSelect(selectedFile);
      }
      onOpenChange(false);
    } else {
      toast.error("请选择一个文件");
    }
  };

  const getMediaFileUrl = (file: MediaFile): string => {
    if (!file) return "";
    if (mfileType === "ringtone") {
      return `/api/tones/${file.v}`;
    }
    if (!file.ext) {
      file.ext = getFileExt(file.abs_path || "");
    }
    if (file.ext) {
      return `/api/media_files/${file.id}.${file.ext}`;
    }
    return "";
  };

  const fileOptions =
    mfileType === "ringtone"
      ? ringtones.map((tone) => ({
          value: tone.id?.toString() || tone.k,
          label: `[${tone.k}] ${tone.v}`,
          file: tone,
        }))
      : mediaFiles.map((file) => ({
          value: file.id?.toString(),
          label: `${file.name} | ${file.description || ""} [${formatSizeUnits(
            file.file_size || 0,
          )}]`,
          file,
        }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>选择媒体文件</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>文件类型</Label>
            <Select value={mfileType} onValueChange={handleFileTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择文件类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">[全部]</SelectItem>
                <SelectItem value="ringtone">[铃音]</SelectItem>
                {mfileTypes.map((type) => (
                  <SelectItem key={type.k} value={type.k || ""}>
                    {type.k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>文件</Label>
            {mfileType !== "ringtone" && (
              <Input
                type="text"
                placeholder="搜索文件..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="mb-2"
              />
            )}
            <div className="border rounded-md max-h-60 overflow-auto">
              {fileOptions.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">没有找到文件</div>
              ) : (
                fileOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-2 cursor-pointer hover:bg-muted ${
                      selectedFile?.id?.toString() === option.value ||
                      selectedFile?.k === option.value
                        ? "bg-muted"
                        : ""
                    }`}
                    onClick={() => handleFileSelect(option.file)}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <Label>预览</Label>
              <AudioPlayer
                text={mfileType === "ringtone" ? selectedFile.k || "" : selectedFile.name || ""}
                url={getMediaFileUrl(selectedFile)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button onClick={handleOK}>使用</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
