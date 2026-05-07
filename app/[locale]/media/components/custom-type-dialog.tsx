"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { DictItem } from "@repo/api-client";
import { routesApi } from "@/lib/api-client";

interface CustomTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
  customTypes: DictItem[];
}

export function CustomTypeDialog({
  open,
  onOpenChange,
  onRefresh,
  customTypes,
}: CustomTypeDialogProps) {
  const t = useTranslations("media");
  const tc = useTranslations("common");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  // 对话框打开时加载数据
  useEffect(() => {
    if (open) {
      setShowInput(false);
      setNewTypeName("");
    }
  }, [open]);

  // 添加自定义类型
  const handleAdd = async () => {
    if (!newTypeName.trim()) {
      toast.info(t("pleaseInputName") || "请输入名称");
      return;
    }

    setIsSubmitting(true);
    try {
      await routesApi.addDicts({
        realm: "MFILE_TYPE",
        k: newTypeName.trim(),
        v: newTypeName.trim(),
      });

      toast.success(tc("createSuccess") || "添加成功");
      setShowInput(false);
      setNewTypeName("");
      onRefresh?.();
    } catch (error) {
      console.error("Failed to create custom type:", error);
      toast.error(tc("createFailed") || "添加失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除自定义类型
  const handleDelete = async (item: DictItem) => {
    if (!item.id) return;

    try {
      await routesApi.delDicts(item.id);
      toast.success(tc("deleteSuccess") || "删除成功");
      onRefresh?.();
    } catch (error) {
      console.error("Failed to delete custom type:", error);
      toast.error(tc("deleteFailed") || "删除失败");
    }
  };

  const handleSubmit = () => {
    if (showInput) {
      void handleAdd();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("customType") || "自定义类型"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 类型列表 */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {customTypes.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                {tc("noData") || "暂无数据"}
              </div>
            ) : (
              customTypes.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <span className="text-sm">{item.k}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDelete(item)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* 添加输入框 */}
          {showInput ? (
            <Input
              placeholder={t("typeName") || "类型名称"}
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleAdd();
                }
              }}
              disabled={isSubmitting}
            />
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowInput(true)}
              className="w-full"
              disabled={isSubmitting}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              {tc("add") || "添加"}
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc("close") || "关闭"}
          </Button>
          {showInput && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {tc("submit") || "提交"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
