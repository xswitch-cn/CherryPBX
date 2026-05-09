"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DynamicFormDialog, FormConfig, FieldConfig } from "@/components/dynamic-form-dialog";

interface CreateAclDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateAclDialog({ open, onOpenChange, onSubmit }: CreateAclDialogProps) {
  const ti = useTranslations("ipBlacklist");
  const tc = useTranslations("common");
  const [selectedModule, setSelectedAgreement] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setSelectedAgreement("");
    }
  }, [open]);

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "target_name",
        label: ti("name"),
        type: "text",
        placeholder: ti("namePlaceholder"),
        required: true,
      },
      {
        name: "target_ip",
        label: ti("sourceIp"),
        type: "text",
        placeholder: ti("sourceIpPlaceholder"),
        required: true,
      },
      {
        name: "target_protocol",
        label: ti("protocol"),
        type: "select",
        placeholder: ti("protocolPlaceholder"),
        required: true,
        onChange: (value: string) => {
          setSelectedAgreement(value);
        },
        options: [
          { label: "TCP", value: "tcp" },
          { label: "UDP", value: "udp" },
          { label: ti("all"), value: "all" },
        ],
      },
      ...(selectedModule !== "all"
        ? [
            {
              name: "target_port",
              label: ti("port"),
              type: "number",
              placeholder: ti("portPlaceholder"),
              required: true,
            } satisfies FieldConfig,
          ]
        : []),
    ],
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={ti("addIp")}
      config={formConfig}
      onSubmit={onSubmit}
      submitText={tc("submit")}
      cancelText={tc("close")}
      contentClassName="sm:max-w-[450px]"
    />
  );
}
