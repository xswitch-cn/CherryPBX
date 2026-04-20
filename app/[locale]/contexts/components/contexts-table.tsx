import React from "react";
import { useTranslations } from "next-intl";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { type Context } from "../contexts-columns";

export type CreateContextFormData = {
  name: string;
  description?: string;
  hotline_enabled: string;
};

// 创建Context的对话框
export function CreateContextDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateContextFormData) => Promise<void>;
}) {
  const tt = useTranslations("contexts");
  const ttt = useTranslations("table");

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "name",
        label: tt("name"),
        type: "text",
        placeholder: "",
        required: true,
      },
      {
        name: "description",
        label: tt("description"),
        type: "text",
        placeholder: "",
        required: false,
      },
      {
        name: "hotline_enabled",
        label: tt("didEnabled"),
        type: "radio",
        required: false,
        defaultValue: "0",
        radioOptions: [
          { value: "1", label: tt("yes") },
          { value: "0", label: tt("no") },
        ],
      },
    ],
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tt("newContext")}
      config={formConfig}
      onSubmit={onSubmit}
      submitText={ttt("submit")}
      cancelText={ttt("close")}
      contentClassName="sm:max-w-[500px]"
    />
  );
}

// 查看Context详情的对话框
export function ViewContextDialog({
  open,
  onOpenChange,
  context,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: Context | null;
}) {
  const tt = useTranslations("contexts");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tt("contexts")} {tt("Details")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          {context && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right font-medium">{tt("id")}：</Label>
                <span>{context.id}</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right font-medium">{tt("name")}：</Label>
                <span>{context.name}</span>
              </div>
              <div className="flex items-start gap-4">
                <Label className="w-24 text-right font-medium pt-2">{tt("description")}：</Label>
                <span>{context.description || tt("no")}</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right font-medium">{tt("identifier")}：</Label>
                <span>{context.key}</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right font-medium">{tt("didEnabled")}：</Label>
                <span>{context.didEnabled ? tt("yes") : tt("no")}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
            {tt("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 删除Context的对话框
export function DeleteContextDialog({
  open,
  onOpenChange,
  context,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: Context | null;
  onSubmit: (id: number) => Promise<void>;
}) {
  const tt = useTranslations("contexts");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{tt("deleteContext")}</DialogTitle>
          <DialogDescription>
            {tt("areYouSureDelete", { name: context?.name || "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {tt("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (context) {
                void onSubmit(context.id);
              }
            }}
          >
            {tt("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
