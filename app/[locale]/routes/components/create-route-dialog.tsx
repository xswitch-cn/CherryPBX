"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import { type ContextItem, type DictItem } from "@repo/api-client";
import { toast } from "sonner";

interface CreateRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  contexts?: ContextItem[];
  destinationTypes?: DictItem[];
}

export function CreateRouteDialog({
  open,
  onOpenChange,
  onSubmit,
  contexts,
  destinationTypes,
}: CreateRouteDialogProps) {
  const t = useTranslations("routes");
  const tc = useTranslations("common");

  const [loading, setLoading] = useState(false);

  // 构建呼叫源选项
  const contextOptions = useMemo(() => {
    return (
      contexts?.map((item) => ({
        value: item.key,
        label: item.name,
      })) || []
    );
  }, [contexts]);

  // 构建目的地类型选项
  const destTypeOptions = useMemo(() => {
    return (
      destinationTypes?.map((item) => ({
        value: item.k,
        label: t(item.k),
      })) || []
    );
  }, [destinationTypes, t]);

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "name",
        label: t("routeName"),
        type: "text",
        required: true,
        placeholder: "route_to_beijing",
      },
      {
        name: "description",
        label: t("description") || "描述",
        type: "text",
        required: false,
      },
      {
        name: "prefix",
        label: t("calledPrefix") || "被叫字冠",
        type: "text",
        required: false,
        placeholder: "010",
      },
      {
        name: "max_length",
        label: t("maxNumberLength") || "最大号长",
        type: "number",
        required: true,
        defaultValue: "12",
      },
      {
        name: "context",
        label: t("callSource") || "呼叫源",
        type: "select",
        required: true,
        options: contextOptions,
      },
      {
        name: "dest_type",
        label: t("destinationType") || "目的地类型",
        type: "select",
        required: true,
        options: destTypeOptions,
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
      console.error("Failed to create route:", e);
      toast.error(tc("createFailed"));
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
      title={t("addRoute")}
      description={t("addRouteDescription") || "创建新的路由配置"}
      config={formConfig}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText={tc("submit")}
      cancelText={tc("close")}
      loading={loading}
    />
  );
}
