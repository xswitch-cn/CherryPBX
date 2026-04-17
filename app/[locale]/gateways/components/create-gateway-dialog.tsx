"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import { type Gateway } from "@repo/api-client";
import { toast } from "sonner";

interface CreateGatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  gateways: Gateway[];
}

export function CreateGatewayDialog({
  open,
  onOpenChange,
  onSubmit,
  gateways,
}: CreateGatewayDialogProps) {
  const t = useTranslations("gateways");
  const tc = useTranslations("common");

  const [loading, setLoading] = useState(false);

  // 构建模板选项
  const templateOptions = useMemo(() => {
    const options = [{ value: "-1", label: "Default" }];
    gateways.forEach((item) => {
      options.push({ value: item?.id || "", label: `Gateway[${item?.name}]` });
    });
    return options;
  }, [gateways]);

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "name",
        label: t("name"),
        type: "text",
        required: true,
        placeholder: "gw1",
        validation: {
          pattern: /^[^\u4e00-\u9fa5]+$/,
        },
      },
      {
        name: "realm",
        label: t("server"),
        type: "text",
        required: true,
        placeholder: "example.com",
      },
      {
        name: "username",
        label: t("username"),
        type: "text",
        required: true,
        placeholder: "admin",
      },
      {
        name: "password",
        label: tc("password"),
        type: "password",
        required: true,
        showPasswordToggle: true,
      },
      {
        name: "description",
        label: t("description") || "描述",
        type: "text",
        required: false,
      },
      {
        name: "template",
        label: tc("template") || "模板",
        type: "select",
        required: false,
        defaultValue: "-1",
        options: templateOptions,
      },
      {
        name: "register",
        label: tc("register") || "注册",
        type: "radio",
        required: false,
        defaultValue: "yes",
        radioOptions: [
          { value: "yes", label: tc("yes") || "是" },
          { value: "no", label: tc("no") || "否" },
        ],
      },
    ],
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setLoading(true);
    try {
      // 转换表单数据为 API 所需格式
      const apiData: any = {
        name: data.name,
        realm: data.realm,
        username: data.username,
        password: data.password,
      };

      // 只添加非空字段
      if (data.description) {
        apiData.description = data.description;
      }

      if (data.template && data.template !== "-1") {
        apiData.profile_id = data.template;
      }

      // register 字段可能需要特定格式
      apiData.register = data.register === "yes" ? "true" : "false";

      console.log("Submitting gateway data:", apiData);
      await onSubmit(apiData);

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

  const handleCancel = () => {
    // 清理逻辑（如果需要）
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
      }}
      title={t("createGateway")}
      config={formConfig}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText={tc("submit")}
      cancelText={tc("close")}
      loading={loading}
    />
  );
}
