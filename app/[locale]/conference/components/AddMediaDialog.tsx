import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import { conferencesApi } from "@/lib/api-client";

export function AddMediaDialog({
  open,
  onOpenChange,
  roomId,
  onNewMediaAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: number;
  onNewMediaAdded: (media: any) => void;
}) {
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 加载媒体文件列表
  const loadMediaFiles = useCallback(() => {
    setIsLoading(true);
    conferencesApi
      .getMediaFilesList("SYSTEM,UPLOAD,TTS")
      .then((response) => {
        // 检查response.data是否是数组，如果不是，尝试获取response.data.data
        if (Array.isArray(response.data)) {
          setMediaFiles(response.data);
        } else if (response.data && Array.isArray((response.data as any).data)) {
          setMediaFiles((response.data as any).data);
        } else {
          setMediaFiles([]);
        }
      })
      .catch((error) => {
        console.error("Failed to load media files:", error);
        toast.error("获取媒体文件失败");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 当弹窗打开时加载媒体文件列表
  useEffect(() => {
    if (open) {
      loadMediaFiles();
    }
  }, [open, loadMediaFiles]);

  // 处理表单提交
  const handleSubmit = useCallback(
    async (data: any) => {
      if (!roomId) return;

      try {
        const mediaData = {
          media_file_id: data.media_file_id,
          conference_room_id: roomId,
        };

        const response = await conferencesApi.addMedia(roomId, mediaData);

        if (response.data) {
          const mediaId =
            typeof response.data === "object" && response.data !== null
              ? (response.data as any).id
              : response.data;
          const newMedia = {
            ...mediaData,
            id: mediaId,
            name: mediaFiles.find((file) => file.id === parseInt(data.media_file_id))?.name || "",
          };
          onNewMediaAdded(newMedia);
          toast.success("添加成功");
        } else {
          throw new Error("添加失败");
        }
      } catch (error) {
        console.error("Failed to add media:", error);
        toast.error("添加失败");
        throw error;
      }
    },
    [roomId, mediaFiles, onNewMediaAdded],
  );

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "media_file_id",
        label: "Media File",
        type: "select",
        required: true,
        options: mediaFiles.map((file) => ({
          value: file.id.toString(),
          label: file.name,
        })),
        defaultValue: mediaFiles.length > 0 ? mediaFiles[0].id.toString() : "",
      },
    ],
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Conference Media"
      config={formConfig}
      onSubmit={handleSubmit}
      submitText="Submit"
      cancelText="Close"
      loading={isLoading}
      contentClassName="sm:max-w-[500px]"
    />
  );
}
