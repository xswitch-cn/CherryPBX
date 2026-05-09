"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Edit2Icon, XIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { ivrsApi } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface IvrAction {
  id: number;
  digits: string;
  match_prefix: string;
  action: string;
  body: string;
  args?: string;
}

interface OptionItem {
  value: string;
  label: string;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  IVR_EXTENSION: "转分机",
  IVR_QUEUE: "转队列",
  IVR_CONFERENCE: "转预约会议",
  IVR_CONFERENCE_ROOM: "转会议室",
  IVR_MEETING_ROOM: "转临时会议",
  IVR_SYSTEM: "高级指令",
  IVR_SCRIPT: "执行脚本",
  IVR_ROUTE: "转路由",
  IVR_PLAY: "播放文件",
  IVR_TTS: "播放TTS语音",
  IVR_SUB: "转下级菜单",
  IVR_BACK: "返回主菜单",
  IVR_TOP: "返回上级菜单",
  IVR_EXIT: "退出",
  IVR_HANGUP: "挂断",
  MACRO: "执行脚本",
  VOICE_MACRO: "执行脚本",
};

export default function IvrActionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string; actionId: string }>();
  const ivrId = parseInt(params.id || "0");
  const actionId = parseInt(params.actionId || "0");
  const t = useTranslations("pages");
  const tt = useTranslations("ivr");
  const tc = useTranslations("common");

  const [action, setAction] = useState<IvrAction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ivrName, setIvrName] = useState("");
  const [formData, setFormData] = useState({
    digits: "",
    match_prefix: "0",
    action: "",
    args: "",
    body: "",
  });

  const [argsOptions, setArgsOptions] = useState<OptionItem[]>([]);
  const [argsLabel, setArgsLabel] = useState("");
  const [showArgs, setShowArgs] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [bodyLabel, setBodyLabel] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const loadActionDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ivrResponse, actionResponse] = await Promise.all([
        ivrsApi.get(ivrId),
        ivrsApi.getAction(ivrId, actionId),
      ]);

      const ivrData = ivrResponse.data as any;
      if (ivrData && ivrData.name) {
        setIvrName(ivrData.name);
      }

      const actionArray = actionResponse.data as any[];
      const actionData = actionArray && actionArray.length > 0 ? actionArray[0] : null;

      if (actionData && actionData.id) {
        const actionItem: IvrAction = {
          id: actionData.id,
          digits: actionData.digits || "",
          match_prefix: actionData.match_prefix || "0",
          action: actionData.action || "",
          body: actionData.body || "",
          args: actionData.args,
        };
        setAction(actionItem);
        setFormData({
          digits: actionItem.digits,
          match_prefix: actionItem.match_prefix,
          action: actionItem.action,
          args: actionItem.args || "",
          body: actionItem.body,
        });
      } else {
        setAction(null);
      }
    } catch (error) {
      console.error("Failed to load action detail:", error);
      toast.error(tt("loadFailed"));
      setAction(null);
    } finally {
      setIsLoading(false);
    }
  }, [ivrId, actionId, tt]);

  const handleBack = useCallback(() => {
    router.push(`/ivr/${ivrId}`);
  }, [router, ivrId]);

  const handleDestTypeChange = useCallback(
    async (value: string) => {
      setArgsOptions([]);
      setFormData((prev) => ({ ...prev, args: "", body: "" }));
      setShowArgs(false);
      setShowBody(false);
      setIsActionLoading(true);
      setIsMultiSelect(false);
      setSelectedValues([]);

      const currentAction = action;

      try {
        switch (value) {
          case "IVR_CONFERENCE": {
            const response = await ivrsApi.getConferenceProfiles();
            const profiles = response.data as any[];
            let currentId: string | null = null;
            const options = profiles.map((profile: any) => {
              if (currentAction?.args == profile.id) {
                currentId = String(profile.id);
              }
              return {
                value: String(profile.id),
                label: profile.name,
              };
            });
            setArgsOptions(options);
            setArgsLabel(tt("confProfiles"));
            setFormData((prev) => ({ ...prev, args: currentId || options[0]?.value || "" }));
            setShowArgs(true);
            break;
          }
          case "IVR_EXTENSION": {
            const response = await ivrsApi.getExtensions();
            const extensions = (response.data as any).data || [];
            const currentText = currentAction?.args;
            const options = extensions
              .filter((ext: any) => ext && ext.extn)
              .map((ext: any) => ({
                value: `${ext.extn}|${ext.domain}`,
                label: `${ext.name}|${ext.extn}|${ext.domain}`,
              }));
            setArgsOptions(options);
            setArgsLabel(tt("extensions"));

            // 解析已选中的值（JSON 数组格式）
            let defaultValues: string[] = [];
            if (currentText) {
              try {
                const parsed = JSON.parse(currentText);
                if (Array.isArray(parsed)) {
                  defaultValues = parsed.map((item: any) => item.extn).filter(Boolean);
                }
              } catch (e) {
                // 如果不是 JSON 格式，使用原始值
                defaultValues = [currentText];
              }
            }
            setSelectedValues(defaultValues);
            setIsMultiSelect(true);
            setFormData((prev) => ({ ...prev, args: currentText || "" }));
            setShowArgs(true);
            break;
          }
          case "IVR_SYSTEM": {
            setBodyLabel(tt("body"));
            setFormData((prev) => ({ ...prev, body: currentAction?.body || "" }));
            setShowBody(true);
            break;
          }
          case "IVR_MEETING_ROOM": {
            const response = await ivrsApi.getMeetingRooms();
            const rooms = (response.data as any).data || [];
            let currentId: string | null = null;
            const options = rooms
              .filter((room: any) => room && room.id && room.name)
              .map((room: any) => {
                if (currentAction?.args == room.id) {
                  currentId = String(room.id);
                }
                return {
                  value: String(room.id),
                  label: room.name,
                };
              });
            setArgsOptions(options);
            setArgsLabel(tt("rooms"));
            setFormData((prev) => ({ ...prev, args: currentId || options[0]?.value || "" }));
            setShowArgs(true);
            break;
          }
          case "IVR_CONFERENCE_ROOM": {
            const response = await ivrsApi.getConferenceRooms();
            const rooms = (response.data as any).data || [];
            let currentId: string | null = null;
            const options = rooms
              .filter((room: any) => room && room.id && room.name)
              .map((room: any) => {
                if (currentAction?.args == room.id) {
                  currentId = String(room.id);
                }
                return {
                  value: String(room.id),
                  label: room.name,
                };
              });
            setArgsOptions(options);
            setArgsLabel(tt("rooms"));
            setFormData((prev) => ({ ...prev, args: currentId || options[0]?.value || "" }));
            setShowArgs(true);
            break;
          }
          case "IVR_SUB": {
            const response = await ivrsApi.list();
            const ivrs = (response.data as any).data || [];
            let currentId: string | null = null;
            const options = ivrs.map((ivrItem: any) => {
              if (currentAction?.args == ivrItem.id) {
                currentId = String(ivrItem.id);
              }
              return {
                value: String(ivrItem.id),
                label: ivrItem.name,
              };
            });
            setArgsOptions(options);
            setArgsLabel(tt("ivr"));
            setFormData((prev) => ({ ...prev, args: currentId || options[0]?.value || "" }));
            setShowArgs(true);
            break;
          }
          case "IVR_SCRIPT": {
            const response = await ivrsApi.getScripts();
            const scripts = response.data as any[];
            let currentId: string | null = null;
            const options = scripts
              .filter((sp: any) => sp && sp.id && typeof sp.id === "number")
              .map((sp: any) => {
                if (currentAction?.args == sp.id) {
                  currentId = String(sp.id);
                }
                return {
                  value: String(sp.id),
                  label: sp.name,
                };
              });
            setArgsOptions(options);
            setArgsLabel(tt("scripts"));
            setFormData((prev) => ({ ...prev, args: currentId || options[0]?.value || "" }));
            setShowArgs(true);
            break;
          }
          case "IVR_PLAY": {
            const response = await ivrsApi.getIvrMediaFiles();
            const files = (response.data as any).data || [];
            let currentId: string | null = null;
            const options = files.map((file: any) => {
              if (currentAction?.args == file.id) {
                currentId = String(file.id);
              }
              return {
                value: String(file.id),
                label: file.name,
              };
            });
            setArgsOptions(options);
            setArgsLabel(tt("soundFiles"));
            setFormData((prev) => ({ ...prev, args: currentId || options[0]?.value || "" }));
            setShowArgs(true);
            break;
          }
          case "IVR_TTS": {
            setArgsLabel(tt("body"));
            setFormData((prev) => ({ ...prev, args: currentAction?.args || "" }));
            setShowArgs(true);
            break;
          }
          case "IVR_QUEUE": {
            const response = await ivrsApi.getQueues();
            const data = response.data as any;
            const queues = Array.isArray(data) ? data : data.data || [];
            let currentId: string | null = null;
            const options = queues
              .filter(
                (queue: any) => queue && queue.id && queue.name && typeof queue.id === "number",
              )
              .map((queue: any) => {
                const queueText = `${queue.name}[${queue.cti_template || ""}] - ${queue.description || ""}`;
                if (currentAction?.args == queue.id) {
                  currentId = String(queue.id);
                }
                return {
                  value: String(queue.id),
                  label: queueText,
                };
              });
            setArgsOptions(options);
            setArgsLabel(tt("callCenterQueue"));
            setFormData((prev) => ({ ...prev, args: currentId || options[0]?.value || "" }));
            setShowArgs(true);
            break;
          }
          case "IVR_ROUTE": {
            const response = await ivrsApi.getContexts();
            const contexts = (response.data as any).data || [];
            let currentId: string | null = null;
            const options = contexts.map((context: any) => {
              if (currentAction?.args == context.id) {
                currentId = String(context.id);
              }
              return {
                value: String(context.id),
                label: context.name,
              };
            });
            setArgsOptions(options);
            setArgsLabel(tt("args"));
            setBodyLabel(tt("number"));
            setFormData((prev) => ({
              ...prev,
              args: currentId || options[0]?.value || "",
              body: currentAction?.body || "",
            }));
            setShowArgs(true);
            setShowBody(true);
            break;
          }
          case "IVR_BACK":
          case "IVR_EXIT":
          case "IVR_TOP":
          case "IVR_HANGUP":
          default:
            break;
        }
      } catch (error) {
        console.error("Failed to load action options:", error);
      } finally {
        setIsActionLoading(false);
      }
    },
    [action, tt],
  );

  useEffect(() => {
    if (isEditing && formData.action) {
      void handleDestTypeChange(formData.action);
    }
  }, [isEditing, formData.action, handleDestTypeChange]);

  const handleEdit = () => {
    if (action) {
      setFormData({
        digits: action.digits,
        match_prefix: action.match_prefix,
        action: action.action,
        args: action.args || "",
        body: action.body,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    if (action) {
      setFormData({
        digits: action.digits,
        match_prefix: action.match_prefix,
        action: action.action,
        args: action.args || "",
        body: action.body,
      });
    }
    setIsEditing(false);
    setShowArgs(false);
    setShowBody(false);
    setIsMultiSelect(false);
    setSelectedValues([]);
  };

  const handleSave = useCallback(async () => {
    if (!action) return;

    setIsSubmitting(true);
    try {
      // 处理多选分机的情况
      let finalArgs = formData.args;
      if (isMultiSelect && selectedValues.length > 0) {
        const members = selectedValues.map((value) => ({ extn: value }));
        finalArgs = JSON.stringify(members);
      }

      const updateData: any = {
        id: action.id,
        digits: formData.digits,
        match_prefix: formData.match_prefix === "1" ? "1" : "0",
        action: formData.action,
        body: formData.body,
        args: finalArgs,
      };

      const response = await ivrsApi.updateAction(ivrId, actionId, updateData);

      const responseData = response.data as any;
      if (responseData?.code !== 200 && !responseData?.data) {
        throw new Error(responseData?.message || responseData?.text || "Update failed");
      }

      const updatedAction: IvrAction = {
        ...action,
        digits: updateData.digits,
        match_prefix: updateData.match_prefix,
        action: updateData.action,
        body: updateData.body,
        args: updateData.args,
      };
      setAction(updatedAction);

      toast.success(tc("updateSuccess"));
      setIsEditing(false);
      setShowArgs(false);
      setShowBody(false);
      setIsMultiSelect(false);
      setSelectedValues([]);
    } catch (error: any) {
      console.error("Failed to update action:", error);
      toast.error(`${tc("updateFailed")}: ${error?.message || error?.text || error}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [action, formData, ivrId, actionId, tc, isMultiSelect, selectedValues]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadActionDetail();
  }, [router, loadActionDetail]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("ivr")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">{tt("loading")}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!action) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("ivr")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">{tt("actionNotFound")}</div>
            <Button onClick={handleBack} className="mt-4">
              <Edit2Icon className="mr-2 h-4 w-4" />
              {tt("backToList")}
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("ivr")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/ivr">{t("ivr")}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href={`/ivr/${ivrId}`}>{ivrName}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{action.digits}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>

                  <div className="rounded-lg border bg-background mt-8">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">IVR ACTION Info</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancel}
                              disabled={isSubmitting || isActionLoading}
                            >
                              <XIcon className="mr-1 h-3.5 w-3.5" />
                              {tc("cancel")}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-teal-500 hover:bg-teal-600"
                              onClick={() => void handleSave()}
                              disabled={isSubmitting || isActionLoading}
                            >
                              <CheckIcon className="mr-1 h-3.5 w-3.5" />
                              {tc("save")}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground"
                            onClick={handleEdit}
                          >
                            <Edit2Icon className="h-4 w-4" />
                            <span className="sr-only">{tt("edit")}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-destructive text-xs">*</span>
                            <span className="text-muted-foreground text-sm">{tt("digits")}</span>
                          </div>
                          {isEditing ? (
                            <Input
                              type="text"
                              value={formData.digits}
                              onChange={(e) => setFormData({ ...formData, digits: e.target.value })}
                              className="w-[300px]"
                            />
                          ) : (
                            <div className="min-h-[2.25rem] py-1 text-sm">{action.digits}</div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-muted-foreground text-sm">{tt("matchPrefix")}</span>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={formData.match_prefix === "1"}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, match_prefix: checked ? "1" : "0" })
                                }
                              />
                              <span className="text-sm">
                                {formData.match_prefix === "1" ? tt("yes") : tt("no")}
                              </span>
                            </div>
                          ) : (
                            <div className="min-h-[2.25rem] py-1 text-sm">
                              {String(action.match_prefix) === "1" ? tt("yes") : tt("no")}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-destructive text-xs">*</span>
                            <span className="text-muted-foreground text-sm">{tt("action")}</span>
                          </div>
                          {isEditing ? (
                            <Select
                              value={formData.action}
                              onValueChange={(value) => setFormData({ ...formData, action: value })}
                              disabled={isActionLoading}
                            >
                              <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder={tt("select")} />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ACTION_TYPE_LABELS).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="min-h-[2.25rem] py-1 text-sm">
                              {ACTION_TYPE_LABELS[action.action] || action.action}
                            </div>
                          )}
                        </div>
                        {(isEditing && showArgs) || (!isEditing && action.args) ? (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-muted-foreground text-sm">
                              {isEditing ? argsLabel : tt("args")}
                            </span>
                            {isEditing ? (
                              argsOptions.length > 0 ? (
                                isMultiSelect ? (
                                  <div className="space-y-2">
                                    <ScrollArea className="max-h-[200px] rounded-md border p-2">
                                      <div className="space-y-1">
                                        {argsOptions.map((option) => (
                                          <label
                                            key={option.value}
                                            className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted cursor-pointer"
                                          >
                                            <Checkbox
                                              checked={selectedValues.includes(option.value)}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  setSelectedValues([
                                                    ...selectedValues,
                                                    option.value,
                                                  ]);
                                                } else {
                                                  setSelectedValues(
                                                    selectedValues.filter(
                                                      (v) => v !== option.value,
                                                    ),
                                                  );
                                                }
                                              }}
                                            />
                                            <span className="truncate">{option.label}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                    <div className="text-xs text-muted-foreground">
                                      {tt("selectedCount", { count: selectedValues.length })}
                                    </div>
                                  </div>
                                ) : (
                                  <Select
                                    value={formData.args}
                                    onValueChange={(value) =>
                                      setFormData({ ...formData, args: value })
                                    }
                                  >
                                    <SelectTrigger className="w-[300px]">
                                      <SelectValue placeholder={tt("select")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {argsOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )
                              ) : (
                                <Input
                                  type="text"
                                  value={formData.args}
                                  onChange={(e) =>
                                    setFormData({ ...formData, args: e.target.value })
                                  }
                                  placeholder={
                                    formData.action === "IVR_TTS"
                                      ? tt("ttsPlaceholder")
                                      : tt("enterValue")
                                  }
                                  className="w-[300px]"
                                />
                              )
                            ) : (
                              <div className="min-h-[2.25rem] py-1 text-sm">{action.args}</div>
                            )}
                          </div>
                        ) : null}
                      </div>
                      {(isEditing && showBody) || (!isEditing && action.body) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-muted-foreground text-sm">
                              {isEditing ? bodyLabel : tt("body")}
                            </span>
                            {isEditing ? (
                              formData.action === "IVR_SYSTEM" ? (
                                <Textarea
                                  value={formData.body}
                                  onChange={(e) =>
                                    setFormData({ ...formData, body: e.target.value })
                                  }
                                  placeholder="log ERR line1&#10;log ERR line2"
                                  className="min-h-[100px] font-mono text-sm w-[300px]"
                                />
                              ) : (
                                <Input
                                  type="text"
                                  value={formData.body}
                                  onChange={(e) =>
                                    setFormData({ ...formData, body: e.target.value })
                                  }
                                  placeholder={tt("enterNumber")}
                                  className="w-[300px]"
                                />
                              )
                            ) : (
                              <div className="min-h-[2.25rem] py-1 text-sm">{action.body}</div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
