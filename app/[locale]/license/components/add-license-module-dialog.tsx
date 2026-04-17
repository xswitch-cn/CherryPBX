"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import { licenseApi } from "@/lib/api-client";
import { toast } from "sonner";

type LicenseModuleType =
  | "CHANNEL_LICENSE"
  | "AGORA_LICENSE"
  | "XCC_LICENSE"
  | "WXAPP_LICENSE"
  | "TRTC_LICENSE"
  | "AI_LICENSE"
  | "BAIDU_LICENSE"
  | "XUNFEI_LICENSE"
  | "ALI_LICENSE"
  | "HUAWEI_LICENSE"
  | "H323_LICENSE"
  | "TENCENT_LICENSE"
  | "MINIMAX_LICENSE"
  | "MINIMAXV2_LICENSE"
  | "VOLCENGINE_LICENSE";

interface AddLicenseModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenseId: string;
  onSuccess?: () => void;
}

// 获取指定模块对应的表单项配置
const getModuleFields = (moduleType: LicenseModuleType, t: (key: string) => string): Array<any> => {
  const today = new Date();
  const defaultExpireDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  switch (moduleType) {
    case "CHANNEL_LICENSE":
      return [
        { name: "sps", label: t("SPS"), type: "text", required: true, defaultValue: "3" },
        {
          name: "channel",
          label: t("Channel Number"),
          type: "text",
          required: true,
          defaultValue: "10",
        },
        {
          name: "users",
          label: t("User Number"),
          type: "text",
          required: true,
          defaultValue: "30",
        },
        {
          name: "register",
          label: t("Register Number"),
          type: "text",
          required: true,
          defaultValue: "30",
        },
        {
          name: "conference",
          label: t("Conference Number"),
          type: "text",
          required: true,
          defaultValue: "3",
        },
        { name: "ivr", label: t("Ivr Number"), type: "text", required: true, defaultValue: "3" },
        {
          name: "expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "AGORA_LICENSE":
      return [
        { name: "agora_audio", label: t("Audio"), type: "text", required: true, defaultValue: "3" },
        { name: "agora_video", label: t("Video"), type: "text", required: true, defaultValue: "3" },
        {
          name: "agora_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "XCC_LICENSE":
      return [
        { name: "xcc", label: t("XCC"), type: "text", required: true, defaultValue: "3" },
        {
          name: "xcc_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "WXAPP_LICENSE":
      return [
        { name: "wxapp_audio", label: t("Audio"), type: "text", required: true, defaultValue: "3" },
        { name: "wxapp_video", label: t("Video"), type: "text", required: true, defaultValue: "3" },
        {
          name: "wxapp_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "TRTC_LICENSE":
      return [
        { name: "trtc_audio", label: t("Audio"), type: "text", required: true, defaultValue: "3" },
        { name: "trtc_video", label: t("Video"), type: "text", required: true, defaultValue: "3" },
        {
          name: "trtc_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "AI_LICENSE":
      return [
        { name: "ai", label: "AI", type: "text", required: true, defaultValue: "3" },
        {
          name: "ai_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "BAIDU_LICENSE":
      return [
        { name: "baidu_tts", label: t("TTS"), type: "text", required: true, defaultValue: "3" },
        { name: "baidu_asr", label: t("ASR"), type: "text", required: true, defaultValue: "3" },
        {
          name: "baidu_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "XUNFEI_LICENSE":
      return [
        { name: "xunfei_tts", label: t("TTS"), type: "text", required: true, defaultValue: "3" },
        { name: "xunfei_asr", label: t("ASR"), type: "text", required: true, defaultValue: "3" },
        {
          name: "xunfei_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "ALI_LICENSE":
      return [
        { name: "ali_tts", label: t("TTS"), type: "text", required: true, defaultValue: "3" },
        { name: "ali_asr", label: t("ASR"), type: "text", required: true, defaultValue: "3" },
        {
          name: "ali_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "HUAWEI_LICENSE":
      return [
        { name: "huawei_tts", label: t("TTS"), type: "text", required: true, defaultValue: "3" },
        { name: "huawei_asr", label: t("ASR"), type: "text", required: true, defaultValue: "3" },
        {
          name: "huawei_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "H323_LICENSE":
      return [
        { name: "h323", label: t("H323"), type: "text", required: true, defaultValue: "3" },
        {
          name: "h323_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "TENCENT_LICENSE":
      return [
        {
          name: "tencent_tts",
          label: t("Tencent TTS"),
          type: "text",
          required: true,
          defaultValue: "3",
        },
        {
          name: "tencent_asr",
          label: t("Tencent ASR"),
          type: "text",
          required: true,
          defaultValue: "3",
        },
        {
          name: "tencent_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "MINIMAX_LICENSE":
      return [
        {
          name: "minimax_tts",
          label: t("MiniMax TTS"),
          type: "text",
          required: true,
          defaultValue: "3",
        },
        {
          name: "minimax_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "MINIMAXV2_LICENSE":
      return [
        {
          name: "minimaxv2_tts",
          label: t("MiniMax V2 TTS"),
          type: "text",
          required: true,
          defaultValue: "3",
        },
        {
          name: "minimaxv2_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    case "VOLCENGINE_LICENSE":
      return [
        {
          name: "volcengine_tts",
          label: t("Volcengine TTS"),
          type: "text",
          required: true,
          defaultValue: "3",
        },
        {
          name: "volcengine_expire",
          label: t("Expire"),
          type: "date",
          required: true,
          defaultValue: defaultExpireDate,
        },
      ];

    default:
      return [];
  }
};

export function AddLicenseModuleDialog({
  open,
  onOpenChange,
  licenseId,
  onSuccess,
}: AddLicenseModuleDialogProps) {
  const tl = useTranslations("license");
  const tc = useTranslations("common");

  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<LicenseModuleType | "">("");

  // 当对话框关闭时重置状态
  useEffect(() => {
    if (!open) {
      setSelectedModule("");
    }
  }, [open]);

  // 构建基础表单配置
  const baseFields: Array<any> = [
    {
      name: "module_license",
      label: tl("Modules License"),
      type: "select",
      required: true,
      onChange: (value: string) => {
        setSelectedModule(value as LicenseModuleType);
      },
      options: [
        { value: "CHANNEL_LICENSE", label: "Channels" },
        { value: "AGORA_LICENSE", label: "Agora" },
        { value: "XCC_LICENSE", label: "XCC" },
        { value: "WXAPP_LICENSE", label: "WXApp" },
        { value: "TRTC_LICENSE", label: "TRTC" },
        { value: "AI_LICENSE", label: "AI" },
        { value: "BAIDU_LICENSE", label: "Baidu" },
        { value: "XUNFEI_LICENSE", label: "XunFei" },
        { value: "ALI_LICENSE", label: "ALI" },
        { value: "HUAWEI_LICENSE", label: "HuaWei" },
        { value: "H323_LICENSE", label: "H323" },
        { value: "VOLCENGINE_LICENSE", label: "Volcengine" },
        { value: "MINIMAX_LICENSE", label: "MiniMax" },
        { value: "MINIMAXV2_LICENSE", label: "MiniMax V2" },
        { value: "TENCENT_LICENSE", label: "Tencent" },
      ],
    },
  ];

  // 根据选中的模块动态生成完整表单配置
  const formConfig: FormConfig = {
    fields: selectedModule ? [...baseFields, ...getModuleFields(selectedModule, tl)] : baseFields,
  };

  const handleSubmit = async (values: Record<string, any>) => {
    setLoading(true);
    try {
      // 格式化所有带 _expire 后缀的日期字段为 YYYY-MM-DD 格式
      const expireKeys = [
        "expire",
        "agora_expire",
        "xcc_expire",
        "wxapp_expire",
        "trtc_expire",
        "ai_expire",
        "baidu_expire",
        "xunfei_expire",
        "ali_expire",
        "huawei_expire",
        "h323_expire",
        "tencent_expire",
        "minimax_expire",
        "minimaxv2_expire",
        "volcengine_expire",
      ];

      const formattedValues = { ...values };
      expireKeys.forEach((key) => {
        if (formattedValues[key]) {
          // 如果已经是字符串格式的日期，直接使用；否则进行格式化
          if (typeof formattedValues[key] === "string") {
            // 已经是 YYYY-MM-DD 格式，无需处理
          } else if (formattedValues[key] instanceof Date) {
            formattedValues[key] = formattedValues[key].toISOString().split("T")[0];
          }
        }
      });

      // 调用 API 添加许可证模块
      await licenseApi.addLicenseModule(licenseId, formattedValues);

      toast.success(tl("Created Successfully"));
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to add license module:", error);
      const errorMsg = error?.message || error?.text || String(error);
      toast.error(`${tl("Create Failed")}: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedModule("");
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleCancel();
        }
        onOpenChange(newOpen);
      }}
      title={tl("New License")}
      config={formConfig}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText={tc("submit")}
      cancelText={tc("close")}
      loading={loading}
    />
  );
}
