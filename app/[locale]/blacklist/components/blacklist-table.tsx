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
import { type Blacklist } from "../blacklist-columns";

export type CreateBlacklistFormData = {
  name: string;
  description?: string;
  listType: string;
  userType: string;
};

// 创建Blacklist的对话框
export function CreateBlacklistDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBlacklistFormData) => Promise<void>;
}) {
  const tt = useTranslations("blacklist");
  const ttt = useTranslations("table");

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "name",
        label: tt("name"),
        type: "text",
        placeholder: tt("name"),
        required: true,
      },
      {
        name: "description",
        label: tt("description"),
        type: "text",
        placeholder: tt("description"),
        required: false,
      },
      {
        name: "listType",
        label: tt("listType"),
        type: "select",
        required: true,
        options: [
          { value: "0", label: tt("blacklist") },
          { value: "1", label: tt("whitelist") },
        ],
      },
      {
        name: "userType",
        label: tt("userType"),
        type: "select",
        required: true,
        options: [
          { value: "0", label: tt("caller") },
          { value: "1", label: tt("called") },
          { value: "2", label: tt("callerAndCalled") },
        ],
      },
    ],
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tt("createBlacklist")}
      config={formConfig}
      onSubmit={onSubmit}
      submitText={tt("submit")}
      cancelText={tt("close")}
      contentClassName="sm:max-w-[500px]"
    />
  );
}

// 删除Blacklist的对话框
export function DeleteBlacklistDialog({
  open,
  onOpenChange,
  blacklist,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blacklist: Blacklist | null;
  onSubmit: (id: number) => Promise<void>;
}) {
  const tt = useTranslations("blacklist");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{tt("deleteBlacklist")}</DialogTitle>
          <DialogDescription>
            {tt("areYouSureDelete", { name: blacklist?.name || "" })}
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
              if (blacklist) {
                void onSubmit(blacklist.id);
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
