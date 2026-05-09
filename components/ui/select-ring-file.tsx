"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { ivrsApi } from "@/lib/api-client";

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
  const t = useTranslations("common");
  const [mfileTypes, setMfileTypes] = React.useState<MediaFile[]>([]);
  const [mfileType, setMfileType] = React.useState<string>("all");
  const [ringtones, setRingtones] = React.useState<MediaFile[]>([]);
  const [mediaFiles, setMediaFiles] = React.useState<MediaFile[]>([]);
  const [selectedFileValue, setSelectedFileValue] = React.useState<string>("");

  const getFileTypeLabel = (type: string): string => {
    const translations: Record<string, string> = {
      all: t("all"),
      ringtone: t("ringtone"),
      ASR: t("asr"),
      SYSTEM: t("system"),
      TTS: t("tts"),
      UPLOAD: t("upload"),
      LOCAL_STREAM: t("localStream"),
      FAX: t("fax"),
      RECORD: t("record"),
      SCRIPT: t("script"),
    };
    return translations[type] || type;
  };

  React.useEffect(() => {
    if (open) {
      void loadFileTypes();
      void loadRingtones();
      void loadMediaFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadFileTypes = async () => {
    try {
      const response = await ivrsApi.getFileTypes();
      const data = response.data as MediaFile[];
      const filteredData = data.filter((item) => !notShowTypes.includes(item.k || ""));
      setMfileTypes(filteredData);
    } catch (error) {
      console.error("Failed to load file types:", error);
    }
  };

  const loadRingtones = async () => {
    try {
      const response = await ivrsApi.getRingtones();
      const data = response.data as MediaFile[];
      setRingtones(data);
    } catch (error) {
      console.error("Failed to load ringtones:", error);
    }
  };

  const loadMediaFiles = async (type?: string) => {
    try {
      const response = await ivrsApi.getMediaFiles(type);
      const data = response.data as any;
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
    setSelectedFileValue("");
    if (type === "ringtone") {
      setMediaFiles([]);
    } else {
      void loadMediaFiles(type);
    }
  };

  const handleFileSelect = (value: string) => {
    setSelectedFileValue(value);
  };

  const getSelectedFile = (): MediaFile | null => {
    if (!selectedFileValue) return null;
    if (mfileType === "ringtone") {
      return ringtones.find((tone) => String(tone.id ?? tone.k) === selectedFileValue) || null;
    }
    return mediaFiles.find((file) => String(file.id) === selectedFileValue) || null;
  };

  const handleOK = () => {
    const selectedFile = getSelectedFile();
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

  const selectedFile = getSelectedFile();

  const fileOptions =
    mfileType === "ringtone"
      ? ringtones.map((tone) => ({
          value: String(tone.id ?? tone.k),
          label: `[${tone.k}] ${tone.v}`,
          file: tone,
        }))
      : mediaFiles.map((file) => ({
          value: String(file.id),
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectFileType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{getFileTypeLabel("all")}</SelectItem>
                <SelectItem value="ringtone">{getFileTypeLabel("ringtone")}</SelectItem>
                {mfileTypes.map((type) => (
                  <SelectItem key={type.k} value={type.k || ""}>
                    {getFileTypeLabel(type.k || "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>文件</Label>
            <Select value={selectedFileValue} onValueChange={handleFileSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="输入名称查找文件" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {fileOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <Label>试听</Label>
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
