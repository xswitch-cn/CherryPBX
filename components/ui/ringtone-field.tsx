"use client";

import * as React from "react";
import { FileUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { SelectRingFile } from "@/components/ui/select-ring-file";
import { cn } from "@/lib/utils";

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
  isSelectedMediaFile?: boolean;
}

interface RingtoneFieldProps {
  value?: string;
  edit?: boolean;
  text?: string;
  url?: string;
  onChange?: (value: MediaFile | null) => void;
  className?: string;
}

function getFileExt(filename: string): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function RingtoneField({
  edit = false,
  text,
  url,
  onChange,
  className,
}: RingtoneFieldProps) {
  const [audioDisplayText, setAudioDisplayText] = React.useState(text || "");
  const [isShowSelectRingfile, setIsShowSelectRingfile] = React.useState(false);
  const [selectedMediafile, setSelectedMediaFile] = React.useState<MediaFile | null>(null);

  const getRingToneMediaFileUrl = (mediaFile: MediaFile | null): string => {
    if (!mediaFile) return "";
    if (!mediaFile.ext && mediaFile.abs_path) {
      mediaFile.ext = getFileExt(mediaFile.abs_path);
    }
    if (mediaFile.ext) {
      return `/api/media_files/${mediaFile.id}.${mediaFile.ext}`;
    }
    if (mediaFile.v) {
      return `/api/tones/${mediaFile.v}`;
    }
    return "";
  };

  React.useEffect(() => {
    setAudioDisplayText(text || "");
  }, [text]);

  React.useEffect(() => {
    if (!edit) {
      setSelectedMediaFile(null);
    }
  }, [edit]);

  // React.useEffect(() => {
  //   if (edit && value && typeof value === "object") {
  //     // 当value是对象时，设置selectedMediafile
  //     setSelectedMediaFile(value);
  //   }
  // }, [edit, value]);

  const handleSelectFile = () => {
    setIsShowSelectRingfile(true);
  };

  const handleMediaFileChange = (mediaFile: MediaFile) => {
    console.log("media_file", mediaFile);
    setSelectedMediaFile(mediaFile);
    onChange?.({
      isSelectedMediaFile: true,
      ...mediaFile,
    });
    setIsShowSelectRingfile(false);
  };

  const handleDeleteFile = () => {
    setSelectedMediaFile(null);
    setAudioDisplayText("");
    onChange?.(null);
  };

  const audioName = selectedMediafile?.name || audioDisplayText;
  const audioUrl = getRingToneMediaFileUrl(selectedMediafile) || url || "";

  if (!edit) {
    if (!audioDisplayText && !url) {
      return <span className="text-muted-foreground">-</span>;
    }
    return <AudioPlayer text={audioDisplayText} url={url || ""} />;
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        {audioName && audioUrl ? (
          <AudioPlayer text={audioName} url={audioUrl} />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectFile}
          className="flex items-center gap-1"
        >
          <FileUp className="h-4 w-4" />
          <span>选择文件</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDeleteFile}
          className="flex items-center gap-1"
          disabled={!selectedMediafile && !audioDisplayText}
        >
          <Trash2 className="h-4 w-4" />
          <span>删除文件</span>
        </Button>
      </div>
      <SelectRingFile
        open={isShowSelectRingfile}
        onOpenChange={setIsShowSelectRingfile}
        onSelect={handleMediaFileChange}
        notShowTypes="FAX,RECORD,SCRIPT"
      />
    </div>
  );
}
