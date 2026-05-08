"use client";

import { useTranslations } from "next-intl";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";

interface CreateIpBlackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateIpBlackDialog({ open, onOpenChange, onSubmit }: CreateIpBlackDialogProps) {
  const ti = useTranslations("ipBlacklist");
  const tc = useTranslations("common");

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "name",
        label: ti("name"),
        type: "text",
        placeholder: ti("namePlaceholder"),
        required: true,
      },
      {
        name: "source_ip",
        label: ti("sourceIp"),
        type: "text",
        placeholder: ti("sourceIpPlaceholder"),
        required: true,
      },
      {
        name: "protocol",
        label: ti("protocol"),
        type: "select",
        placeholder: ti("protocolPlaceholder"),
        required: true,
        options: [
          { label: "TCP", value: "tcp" },
          { label: "UDP", value: "udp" },
          { label: "TLS", value: "tls" },
          { label: ti("all"), value: "all" },
        ],
      },
      {
        name: "port",
        label: ti("port"),
        type: "number",
        placeholder: ti("portPlaceholder"),
        required: true,
      },
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
