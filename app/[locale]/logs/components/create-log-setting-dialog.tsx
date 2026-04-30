"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateLogSettingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { k: string; v: string }) => void;
}

export function CreateLogSettingDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateLogSettingDialogProps) {
  const t = useTranslations("logs");
  const [k, setK] = React.useState("");
  const [v, setV] = React.useState("");

  const handleSubmit = React.useCallback(() => {
    if (!k.trim() || !v.trim()) {
      return;
    }
     onSubmit({ k: k.trim(), v: v.trim() });
    setK("");
    setV("");
  }, [k, v, onSubmit]);

  const handleClose = React.useCallback(() => {
    onOpenChange(false);
    setK("");
    setV("");
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addParameter") || "添加参数"}</DialogTitle>
          <DialogDescription>{t("addParameterDescription") || "请输入参数信息"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="k">
              {t("name") || "名称"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="k"
              value={k}
              onChange={(e) => setK(e.target.value)}
              placeholder={t("namePlaceholder") || "请输入参数名称"}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v">
              {t("value") || "值"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="v"
              value={v}
              onChange={(e) => setV(e.target.value)}
              placeholder={t("valuePlaceholder") || "请输入参数值"}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            {t("close") || "关闭"}
          </Button>
          <Button onClick={handleSubmit} disabled={!k.trim() || !v.trim()}>
            {t("submit") || "提交"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
