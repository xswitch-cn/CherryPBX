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
import { Textarea } from "@/components/ui/textarea";

interface CreateLogConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description?: string }) => void;
}

export function CreateLogConfigDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateLogConfigDialogProps) {
  const t = useTranslations("logs");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleSubmit = React.useCallback(() => {
    if (!name.trim()) {
      return;
    }
     onSubmit({ name: name.trim(), description: description.trim() || undefined });
    setName("");
    setDescription("");
  }, [name, description, onSubmit]);

  const handleClose = React.useCallback(() => {
    onOpenChange(false);
    setName("");
    setDescription("");
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("new") || "新建日志配置"}</DialogTitle>
          <DialogDescription>
            {t("createLogConfigDescription") || "请输入日志配置信息"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("name") || "名称"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder") || "请输入日志配置名称"}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("description") || "描述"}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder") || "请输入描述信息（可选）"}
              className="w-full resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            {t("cancel") || "取消"}
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {t("save") || "保存"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
