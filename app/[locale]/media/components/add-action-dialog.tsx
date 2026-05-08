"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import { toast } from "sonner";
import { routesApi } from "@/lib/api-client";
import type { DictItem } from "@repo/api-client";

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  type: string;
}

export function AddActionDialog({ open, onOpenChange, onSubmit, type }: CreateDialogProps) {
  const t = useTranslations("media");
  const tc = useTranslations("common");

  const [loading, setLoading] = useState(false);
  const [deleteOptions, setDeleteOptions] = useState<Array<{ value: string; label: string }>>([]);

  const loadDeleteOptions = async () => {
    try {
      const response = await routesApi.getDicts("DATE_TYPE");
      const options = (response.data || []).map((item: DictItem) => {
        const label = `${item.v} ${item.k?.includes("Month") ? tc("month") : tc("year")}`;
        return { value: `${item.v}${item.k}`, label };
      });
      setDeleteOptions(options);
    } catch (error) {
      console.error("Failed to load delete options:", error);
    }
  };

  // 加载删除阈值选项
  useEffect(() => {
    if (open && type === "delete") {
      void loadDeleteOptions();
    }
  }, [open, type]);

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "engine",
        label: t("TTS Engine"),
        type: "select",
        required: true,
        options: [
          { value: "ali", label: "ali" },
          { value: "baidu", label: "baidu" },
          { value: "huawei", label: "huawei" },
        ],
      },
      {
        name: "input",
        label: t("TTS Text"),
        type: "text",
        required: true,
      },
    ],
  };

  const deleteFormConfig: FormConfig = {
    fields: [
      {
        name: "regular",
        label: t("Effective Immediately"),
        type: "radio",
        required: true,
        defaultValue: "false",
        radioOptions: [
          { value: "true", label: tc("yes") },
          { value: "false", label: tc("no") },
        ],
      },
      {
        name: "threshold",
        label: t("Delete Threshold"),
        type: "select",
        required: true,
        options: deleteOptions,
      },
    ],
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setLoading(true);
    try {
      await onSubmit(data);
      toast.success(tc("createSuccess"));
      onOpenChange(false);
    } catch (e) {
      console.error("Failed to create gateway:", e);
      toast.error(tc("createFailed"));
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
      }}
      title={type === "tts" ? "TTS" : t("Regular Delete")}
      config={type === "tts" ? formConfig : deleteFormConfig}
      onSubmit={handleSubmit}
      submitText={tc("submit")}
      cancelText={tc("close")}
      loading={loading}
    />
  );
}
