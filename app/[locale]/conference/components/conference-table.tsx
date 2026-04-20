import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import { Label } from "@/components/ui/label";
import { type Conference, type ConferenceProfile, conferencesApi } from "@/lib/api-client";
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
  nbr: string;
  profile_id: string;
  canvas_count?: string;
  capacity?: string;
  bandwidth?: string;
  fps?: string;
  video_mode?: string;
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
  const [profiles, setProfiles] = useState<ConferenceProfile[]>([]);
  const [forceDomain, setForceDomain] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // 加载会议配置文件和强制域
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // 并行获取数据
          const [profilesResponse, forceDomainResponse] = await Promise.all([
            conferencesApi.getProfiles(),
            conferencesApi.getForceDomain(),
          ]);

          setProfiles((profilesResponse.data as ConferenceProfile[]) || []);
          setForceDomain(
            (forceDomainResponse.data as { force_domain?: string })?.force_domain || "",
          );
        } catch (error) {
          console.error("Failed to fetch conference data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchData();
    }
  }, [open]);

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
        name: "nbr",
        label: tt("number"),
        type: "text",
        placeholder: "",
        required: true,
      },
      {
        name: "profile_id",
        label: "模板",
        type: "select",
        required: true,
        options: profiles.map((profile) => ({
          value: profile.id.toString(),
          label: `[${profile.name}]${profile.description || ""}`,
        })),
        defaultValue: profiles.length > 0 ? profiles[0].id.toString() : "",
      },
    ],
  };

  // 处理表单提交
  const handleSubmit = async (data: CreateConferenceFormData) => {
    try {
      // 构建提交数据
      const roomData = {
        name: data.name,
        description: data.description || "",
        nbr: data.nbr,
        realm: forceDomain || "",
        profile_id: data.profile_id,
        canvas_count: data.canvas_count || "1",
        capacity: data.capacity || "10",
        bandwidth: data.bandwidth || "1mb",
        fps: data.fps || "15",
        video_mode: data.video_mode || "CONF_VIDEO_MODE_PASSTHROUGH",
      };

      await onSubmit(roomData);
    } catch (error) {
      console.error("Failed to create conference:", error);
      throw error;
    }
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tt("newConference")}
      config={formConfig}
      onSubmit={handleSubmit}
      submitText={tc("submit")}
      cancelText={tc("close")}
      loading={isLoading}
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
                  <span>{conference.nbr}</span>
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
                <Label className="col-span-4 text-right font-medium">{tt("realm")}</Label>
                <div className="col-span-8">
                  <span>{conference.realm}</span>
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
