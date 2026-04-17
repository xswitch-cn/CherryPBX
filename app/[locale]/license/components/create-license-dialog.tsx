"use client";

import { useTranslations } from "next-intl";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";

interface CreateLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateLicenseDialog({ open, onOpenChange, onSubmit }: CreateLicenseDialogProps) {
  const t = useTranslations("license");
  const tc = useTranslations("common");

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "name",
        label: t("name"),
        type: "text",
        placeholder: "admin",
        required: true,
      },
      {
        name: "description",
        label: t("description") || "描述",
        type: "text",
        placeholder: "",
        required: false,
      },
    ],
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("createLicense")}
      config={formConfig}
      onSubmit={onSubmit}
      submitText={tc("submit")}
      cancelText={tc("close")}
      contentClassName="sm:max-w-[400px]"
    />
  );
}
