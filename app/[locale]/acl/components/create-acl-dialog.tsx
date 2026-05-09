"use client";

import { useTranslations } from "next-intl";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";

interface CreateAclDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateAclDialog({ open, onOpenChange, onSubmit }: CreateAclDialogProps) {
  const ta = useTranslations("acl");
  const tc = useTranslations("common");

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "name",
        label: tc("name"),
        type: "text",
        required: true,
      },
      {
        name: "rule",
        label: ta("Default Rule"),
        type: "radio",
        required: true,
        radioOptions: [
          { value: "allow", label: ta("allow") },
          { value: "deny", label: ta("deny") },
        ],
      },
    ],
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={ta("addAcl")}
      config={formConfig}
      onSubmit={onSubmit}
      submitText={tc("submit")}
      cancelText={tc("close")}
      contentClassName="sm:max-w-[450px]"
    />
  );
}
