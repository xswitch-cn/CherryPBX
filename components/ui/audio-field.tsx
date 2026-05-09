"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AudioPlayer } from "@/components/ui/audio-player";
import { SelectRingFile } from "@/components/ui/select-ring-file";
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

interface AudioFieldProps {
  label: string;
  name: string;
  value?: string;
  valueName?: string;
  valueUrl?: string;
  onChange: (name: string, mediaFile: MediaFile) => void;
  disabled?: boolean;
}

export function AudioField({
  label,
  name,
  value,
  valueName,
  valueUrl,
  onChange,
  disabled = false,
}: AudioFieldProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = value;
  const t = useTranslations("common");
  const tt = useTranslations("ivr");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleSelectFile = (mediaFile: MediaFile) => {
    onChange(name, mediaFile);
    toast.success(t("updateSuccess"));
  };

  const handleClear = () => {
    onChange(name, { id: 0, name: "", abs_path: "", type: "" });
    toast.success(t("updateSuccess"));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        {!disabled && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                {tt("selectFile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClear} variant="destructive">
                {tt("clear")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="min-h-[2.25rem] py-1 text-sm">
        {valueUrl ? (
          <AudioPlayer url={valueUrl} text={valueName || tt("noAudio")} />
        ) : valueName ? (
          <span className="text-muted-foreground">{valueName}</span>
        ) : (
          tt("noAudio")
        )}
      </div>
      <SelectRingFile
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSelect={handleSelectFile}
      />
    </div>
  );
}
