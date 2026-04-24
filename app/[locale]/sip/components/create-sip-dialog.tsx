"use client";

import { useTranslations } from "next-intl";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import type { Sip } from "@repo/api-client";

interface CreateSipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  sips: Sip[];
  onSuccess?: () => void;
}

export function CreateSipDialog({ open, onOpenChange, onSubmit, sips }: CreateSipDialogProps) {
  const t = useTranslations("sip");
  const tc = useTranslations("common");

  // 构建模板选项
  const templateOptions = [
    { value: "default", label: "default" },
    ...sips?.map((profile) => ({
      value: String(profile.id),
      label: `Profile[${profile.name}]`,
    })),
  ];

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "name",
        label: t("name"),
        type: "text",
        placeholder: "profile1",
        required: true,
      },
      {
        name: "description",
        label: t("description") || "描述",
        type: "textarea",
        placeholder: "Description ...",
        required: false,
      },
      {
        name: "template",
        label: tc("template"),
        type: "select",
        options: templateOptions,
        defaultValue: templateOptions.length > 0 ? templateOptions[0].value : "default",
      },
    ],
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("createSip")}
      config={formConfig}
      onSubmit={onSubmit}
      submitText={tc("submit")}
      cancelText={tc("close")}
      contentClassName="sm:max-w-[400px]"
    />
  );
}
