import React from "react";
import { useTranslations } from "next-intl";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import { Label } from "@/components/ui/label";
import { type Conference } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type CreateConferenceFormData = {
  name: string;
  description?: string;
  number: string;
  template: string;
};

// 创建Conference的对话框
export function CreateConferenceDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateConferenceFormData) => Promise<void>;
}) {
  const tt = useTranslations("conference");
  const tc = useTranslations("common");

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
        name: "number",
        label: tt("number"),
        type: "text",
        placeholder: "",
        required: true,
      },
      {
        name: "template",
        label: "模板",
        type: "select",
        required: true,
        options: [
          {
            value: "[default]conference profile",
            label: "[default]conference profile",
          },
        ],
        defaultValue: "[default]conference profile",
      },
    ],
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tt("newConference")}
      config={formConfig}
      onSubmit={onSubmit}
      submitText={tc("submit")}
      cancelText={tc("close")}
      contentClassName="sm:max-w-[500px]"
    />
  );
}

// 查看Conference详情的对话框
export function ViewConferenceDialog({
  open,
  onOpenChange,
  conference,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conference: Conference | null;
}) {
  const tt = useTranslations("conference");
  const t = useTranslations("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>
            {tt("conference")} {tt("details")}
          </DialogTitle>
          <Button variant="outline" size="sm">
            编辑
          </Button>
        </DialogHeader>
        <div className="py-6">
          {conference && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 名称 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">
                  <span className="text-destructive mr-1">*</span>
                  {tt("name")}
                </Label>
                <div className="col-span-8">
                  <span>{conference.name}</span>
                </div>
              </div>

              {/* 描述 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">{tt("description")}</Label>
                <div className="col-span-8">
                  <span>{conference.description || tt("no")}</span>
                </div>
              </div>

              {/* 号码 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">
                  <span className="text-destructive mr-1">*</span>
                  {tt("number")}
                </Label>
                <div className="col-span-8">
                  <span>{conference.number}</span>
                </div>
              </div>

              {/* 容量 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">{tt("capacity")}</Label>
                <div className="col-span-8">
                  <span>{conference.capacity}</span>
                </div>
              </div>

              {/* 管理员 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">管理员</Label>
                <div className="col-span-8">
                  <span>-</span>
                </div>
              </div>

              {/* 画布个数 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">画布个数</Label>
                <div className="col-span-8">
                  <span>1</span>
                </div>
              </div>

              {/* 视频模式 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">视频模式</Label>
                <div className="col-span-8">
                  <span>融屏</span>
                </div>
              </div>

              {/* 域 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">{tt("domain")}</Label>
                <div className="col-span-8">
                  <span>{conference.domain}</span>
                </div>
              </div>

              {/* 会议模板 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">
                  <span className="text-destructive mr-1">*</span>
                  会议模板
                </Label>
                <div className="col-span-8">
                  <span>[example]conference profile</span>
                </div>
              </div>

              {/* 视频帧率 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">视频帧率</Label>
                <div className="col-span-8">
                  <span>15</span>
                </div>
              </div>

              {/* 带宽 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">带宽</Label>
                <div className="col-span-8">
                  <span>1mb</span>
                </div>
              </div>

              {/* 呼叫权限 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">呼叫权限</Label>
                <div className="col-span-8">
                  <span>-</span>
                </div>
              </div>

              {/* 字幕大小 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">字幕大小</Label>
                <div className="col-span-8">
                  <span>2</span>
                </div>
              </div>

              {/* 字幕 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">字幕</Label>
                <div className="col-span-8">
                  <span>-</span>
                </div>
              </div>

              {/* 背景颜色 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">背景颜色</Label>
                <div className="col-span-8">
                  <div className="w-8 h-4 bg-black rounded"></div>
                </div>
              </div>

              {/* 字幕颜色 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">字幕颜色</Label>
                <div className="col-span-8">
                  <span>-</span>
                </div>
              </div>

              {/* 密码 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">密码</Label>
                <div className="col-span-8">
                  <span>-</span>
                </div>
              </div>

              {/* 管理员密码 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">管理员密码</Label>
                <div className="col-span-8">
                  <span>-</span>
                </div>
              </div>

              {/* 启用声网 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">启用声网</Label>
                <div className="col-span-8">
                  <span>否</span>
                </div>
              </div>

              {/* 自动禁言 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">自动禁言</Label>
                <div className="col-span-8">
                  <span>否</span>
                </div>
              </div>

              {/* 推流地址 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right font-medium">推流地址</Label>
                <div className="col-span-8">
                  <span>-</span>
                </div>
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

// 删除Conference的对话框
export function DeleteConferenceDialog({
  open,
  onOpenChange,
  conference,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conference: Conference | null;
  onSubmit: (id: number) => Promise<void>;
}) {
  const tt = useTranslations("conference");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{tt("deleteConference")}</DialogTitle>
          <DialogDescription>
            {tt("areYouSureDelete", { name: conference?.name || "" })}
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
              if (conference) {
                void onSubmit(conference.id);
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
