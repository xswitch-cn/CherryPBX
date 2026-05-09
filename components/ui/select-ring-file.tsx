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
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
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
  const [localStreams, setLocalStreams] = React.useState<MediaFile[]>([]);
  const [mediaFiles, setMediaFiles] = React.useState<MediaFile[]>([]);
  const [selectedFileValue, setSelectedFileValue] = React.useState<string>("");
  const [searchValue, setSearchValue] = React.useState<string>("");

  const getFileTypeLabel = (type: string): string => {
    const translations: Record<string, string> = {
      all: t("all"),
      ringtone: t("ringtone"),
      LOCAL_STREAM: t("localStream"),
      ASR: t("asr"),
      SYSTEM: t("system"),
      TTS: t("tts"),
      UPLOAD: t("upload"),
    };
    return translations[type] || type;
  };

  React.useEffect(() => {
    if (open) {
      void loadFileTypes();
      void loadRingtones();
      void loadLocalStreams();
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

  const loadLocalStreams = async () => {
    try {
      const response = await ivrsApi.getLocalStreams();
      const data = response.data as MediaFile[];
      setLocalStreams(data);
    } catch (error) {
      console.error("Failed to load local streams:", error);
    }
  };

  const loadMediaFiles = async (type?: string, search?: string) => {
    try {
      const response = await ivrsApi.getMediaFiles(type, search);
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
    setSearchValue("");
    if (type === "ringtone" || type === "local_stream") {
      setMediaFiles([]);
    } else {
      void loadMediaFiles(type);
    }
  };

  const handleFileSelect = (value: string | null) => {
    const newValue = value || "";
    setSelectedFileValue(newValue);
    // Find the corresponding option to get its label for display
    const option = fileOptions.find((opt) => opt.value === newValue);
    if (option) {
      setSearchValue(option.label);
    } else if (newValue) {
      setSearchValue(newValue);
    } else {
      setSearchValue("");
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (mfileType !== "ringtone" && mfileType !== "local_stream") {
      void loadMediaFiles(mfileType, value);
    }
  };

  const getSelectedFile = (): MediaFile | null => {
    if (!selectedFileValue) return null;
    if (mfileType === "ringtone") {
      return ringtones.find((tone) => String(tone.id ?? tone.k) === selectedFileValue) || null;
    }
    if (mfileType === "local_stream") {
      return (
        localStreams.find((stream) => String(stream.id ?? stream.k) === selectedFileValue) || null
      );
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
      } else if (mfileType === "local_stream") {
        const localStream: MediaFile = {
          ...selectedFile,
          type: "LOCAL_STREAM",
          name: selectedFile.k || "",
          abs_path: selectedFile.v || "",
          rel_path: selectedFile.v || "",
        };
        onSelect(localStream);
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
    if (mfileType === "local_stream") {
      return file.v || "";
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
      : mfileType === "local_stream"
        ? localStreams.map((stream) => ({
            value: String(stream.id ?? stream.k),
            label: `[${stream.k}] ${stream.v}`,
            file: stream,
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
                <SelectItem value="local_stream">{getFileTypeLabel("LOCAL_STREAM")}</SelectItem>
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
            <Combobox
              value={selectedFileValue}
              onValueChange={handleFileSelect}
              onInputValueChange={handleSearch}
              inputValue={searchValue}
            >
              <ComboboxInput placeholder="输入名称查找文件" />
              <ComboboxContent>
                <ComboboxEmpty>未找到匹配项</ComboboxEmpty>
                <ComboboxList>
                  {fileOptions.map((option) => (
                    <ComboboxItem key={option.value} value={option.value}>
                      {option.label}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <Label>试听</Label>
              <AudioPlayer
                text={
                  mfileType === "ringtone" || mfileType === "local_stream"
                    ? selectedFile.k || ""
                    : selectedFile.name || ""
                }
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
