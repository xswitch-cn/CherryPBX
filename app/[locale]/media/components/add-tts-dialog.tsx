"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import { toast } from "sonner";

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

export function AddTtsDialog({ open, onOpenChange, onSubmit }: CreateDialogProps) {
  const t = useTranslations("media");
  const tc = useTranslations("common");

  const [loading, setLoading] = useState(false);

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
      title="TTS"
      config={formConfig}
      onSubmit={handleSubmit}
      submitText={tc("submit")}
      cancelText={tc("close")}
      loading={loading}
    />
  );
}
