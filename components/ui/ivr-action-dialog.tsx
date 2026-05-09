"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ivrsApi } from "@/lib/api-client";

interface IvrActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ivrId: number;
  onActionAdded: () => void;
}

interface ActionType {
  k: string;
  v: string;
}

interface OptionItem {
  value: string;
  label: string;
}

export function IvrActionDialog({
  open,
  onOpenChange,
  ivrId,
  onActionAdded,
}: IvrActionDialogProps) {
  const t = useTranslations("ivr");
  const [digits, setDigits] = React.useState("");
  const [matchPrefix, setMatchPrefix] = React.useState(false);
  const [actionType, setActionType] = React.useState("");
  const [actionTypes, setActionTypes] = React.useState<ActionType[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [argsOptions, setArgsOptions] = React.useState<OptionItem[]>([]);
  const [argsValue, setArgsValue] = React.useState("");
  const [argsValues, setArgsValues] = React.useState<string[]>([]);
  const [argsLabel, setArgsLabel] = React.useState("");
  const [bodyValue, setBodyValue] = React.useState("");
  const [bodyLabel, setBodyLabel] = React.useState("");
  const [showArgs, setShowArgs] = React.useState(false);
  const [showBody, setShowBody] = React.useState(false);
  const [argsRequired, setArgsRequired] = React.useState(false);
  const [isMultiSelect, setIsMultiSelect] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      void loadActionTypes();
    }
  }, [open]);

  React.useEffect(() => {
    if (actionType) {
      void handleDestTypeChange(actionType);
    }
  }, [actionType]);

  const defaultActionTypes: ActionType[] = [
    { k: "IVR_EXTENSION", v: "转分机" },
    { k: "IVR_QUEUE", v: "转队列" },
    { k: "IVR_CONFERENCE", v: "转预约会议" },
    { k: "IVR_CONFERENCE_ROOM", v: "转会议室" },
    { k: "IVR_MEETING_ROOM", v: "转临时会议" },
    { k: "IVR_SYSTEM", v: "高级指令" },
    { k: "IVR_SCRIPT", v: "执行脚本" },
    { k: "MACRO", v: "执行脚本" },
    { k: "VOICE_MACRO", v: "执行脚本" },
    { k: "IVR_ROUTE", v: "转路由" },
    { k: "IVR_PLAY", v: "播放文件" },
    { k: "IVR_TTS", v: "播放TTS语音" },
    { k: "IVR_SUB", v: "转下级菜单" },
    { k: "IVR_BACK", v: "返回主菜单" },
    { k: "IVR_TOP", v: "返回上级菜单" },
    { k: "IVR_EXIT", v: "退出" },
    { k: "IVR_HANGUP", v: "挂断" },
  ];

  const getActionTypeLabel = (key: string): string => {
    const found = defaultActionTypes.find((item) => item.k === key);
    return found ? found.v : key;
  };

  const loadActionTypes = async () => {
    setIsLoading(true);
    try {
      const response = await ivrsApi.getActionTypes();
      const data = response.data;
      let actionTypes: ActionType[] = [];

      if (Array.isArray(data)) {
        actionTypes = data
          .map((item: any) => {
            const k = item.k || item.key || item.value || "";
            let v = item.v || item.label || "";
            if (!v || v === k) {
              v = getActionTypeLabel(k);
            }
            return { k, v };
          })
          .filter((item) => item.k);
      } else if (typeof data === "object" && data !== null) {
        actionTypes = Object.entries(data).map(([key, value]) => {
          const v = String(value);
          return {
            k: key,
            v: v !== key ? v : getActionTypeLabel(key),
          };
        });
      }

      if (actionTypes.length === 0) {
        actionTypes = defaultActionTypes;
      }

      setActionTypes(actionTypes);
    } catch (error) {
      console.error("Failed to load action types:", error);
      setActionTypes(defaultActionTypes);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestTypeChange = async (value: string) => {
    setArgsOptions([]);
    setArgsValue("");
    setArgsValues([]);
    setBodyValue("");
    setShowArgs(false);
    setShowBody(false);
    setArgsRequired(false);
    setIsMultiSelect(false);

    switch (value) {
      case "IVR_CONFERENCE":
        try {
          const response = await ivrsApi.getConferenceProfiles();
          const profiles = response.data as any[];
          const options = profiles.map((profile) => ({
            value: String(profile.id),
            label: profile.name,
          }));
          setArgsOptions(options);
          setArgsLabel(t("confProfiles"));
          setArgsValue(options.length > 0 ? options[0].value : "");
          setShowArgs(true);
        } catch (error) {
          console.error("Failed to load conference profiles:", error);
        }
        break;

      case "IVR_QUEUE":
        try {
          const response = await ivrsApi.getQueues();
          const data = response.data as any;
          const queues = Array.isArray(data) ? data : data.data || [];
          const options = queues
            .filter((queue: any) => queue && queue.id && queue.name && typeof queue.id === "number")
            .map((queue: any) => ({
              value: String(queue.id),
              label: `${queue.name}${queue.cti_template ? `[${queue.cti_template}]` : ""}${queue.description ? ` - ${queue.description}` : ""}`,
            }));
          setArgsOptions(options);
          setArgsLabel(t("callCenterQueue"));
          setArgsValue(options.length > 0 ? options[0].value : "");
          setShowArgs(true);
        } catch (error) {
          console.error("Failed to load queues:", error);
        }
        break;

      case "IVR_SYSTEM":
        setBodyLabel(t("body"));
        setShowBody(true);
        break;

      case "IVR_MEETING_ROOM":
        try {
          const response = await ivrsApi.getMeetingRooms();
          const rooms = (response.data as any).data || [];
          const options = rooms
            .filter((room: any) => room && room.id && room.name)
            .map((room: any) => ({
              value: String(room.id),
              label: room.name,
            }));
          setArgsOptions(options);
          setArgsLabel(t("rooms"));
          setArgsValue(options.length > 0 ? options[0].value : "");
          setShowArgs(true);
        } catch (error) {
          console.error("Failed to load meeting rooms:", error);
        }
        break;

      case "IVR_CONFERENCE_ROOM":
        try {
          const response = await ivrsApi.getConferenceRooms();
          const rooms = (response.data as any).data || [];
          const options = rooms
            .filter((room: any) => room && room.id && room.name)
            .map((room: any) => ({
              value: String(room.id),
              label: room.name,
            }));
          setArgsOptions(options);
          setArgsLabel(t("rooms"));
          setArgsValue(options.length > 0 ? options[0].value : "");
          setShowArgs(true);
        } catch (error) {
          console.error("Failed to load conference rooms:", error);
        }
        break;

      case "IVR_SUB":
        try {
          const response = await ivrsApi.list();
          const ivrs = (response.data as any).data || [];
          const options = ivrs.map((ivr: any) => ({
            value: String(ivr.id),
            label: ivr.name,
          }));
          setArgsOptions(options);
          setArgsLabel(t("ivr"));
          setArgsValue(options.length > 0 ? options[0].value : "");
          setShowArgs(true);
        } catch (error) {
          console.error("Failed to load ivrs:", error);
        }
        break;

      case "IVR_TTS":
        setArgsLabel(t("body"));
        setArgsValue("");
        setShowArgs(true);
        break;

      case "IVR_SCRIPT":
        try {
          const response = await ivrsApi.getScripts();
          const scripts = response.data as any[];
          const options = scripts
            .filter((sp: any) => sp && sp.id && typeof sp.id === "number")
            .map((sp: any) => ({
              value: String(sp.id),
              label: sp.name,
            }));
          setArgsOptions(options);
          setArgsLabel(t("scripts"));
          setArgsValue(options.length > 0 ? options[0].value : "");
          setShowArgs(true);
          setShowBody(true);
          setBodyLabel(t("body"));
          setArgsRequired(true);
        } catch (error) {
          console.error("Failed to load scripts:", error);
        }
        break;

      case "IVR_EXTENSION":
        try {
          const response = await ivrsApi.getExtensions();
          const extensions = (response.data as any).data || [];
          const options = extensions
            .filter((ext: any) => ext && ext.extn)
            .map((ext: any) => ({
              value: `${ext.extn}|${ext.domain}`,
              label: `${ext.name}|${ext.extn}|${ext.domain}`,
            }));
          setArgsOptions(options);
          setArgsLabel(t("extensions"));
          setArgsValues([]);
          setShowArgs(true);
          setIsMultiSelect(true);
        } catch (error) {
          console.error("Failed to load extensions:", error);
        }
        break;

      case "IVR_PLAY":
        try {
          const response = await ivrsApi.getIvrMediaFiles();
          const files = (response.data as any).data || [];
          const options = files.map((file: any) => ({
            value: String(file.id),
            label: file.name,
          }));
          setArgsOptions(options);
          setArgsLabel(t("soundFiles"));
          setArgsValue(options.length > 0 ? options[0].value : "");
          setShowArgs(true);
          setArgsRequired(true);
        } catch (error) {
          console.error("Failed to load media files:", error);
        }
        break;

      case "IVR_ROUTE":
        try {
          const response = await ivrsApi.getContexts();
          const contexts = (response.data as any).data || [];
          const options = contexts.map((context: any) => ({
            value: String(context.id),
            label: context.name,
          }));
          setArgsOptions(options);
          setArgsLabel(t("args"));
          setArgsValue(options.length > 0 ? options[0].value : "");
          setShowArgs(true);
          setBodyLabel(t("number"));
          setShowBody(true);
        } catch (error) {
          console.error("Failed to load contexts:", error);
        }
        break;
    }
  };

  const handleSubmit = async () => {
    if (!digits || !actionType) {
      toast.error(t("fillRequiredFields"));
      return;
    }

    if (argsRequired && !argsValue && argsValues.length === 0) {
      toast.error(t("fillRequiredFields"));
      return;
    }

    let finalArgs = argsValue;
    if (isMultiSelect && argsValues.length > 0) {
      const members = argsValues.map((value) => ({ extn: value }));
      finalArgs = JSON.stringify(members);
    }

    try {
      const response = await ivrsApi.addAction(ivrId, {
        digits,
        match_prefix: matchPrefix ? "1" : "0",
        action: actionType,
        args: finalArgs,
        body: bodyValue,
      });

      const responseData = response.data as any;
      if (responseData?.code === 200 || responseData?.data) {
        toast.success(t("addSuccess"));
        onActionAdded();
        onOpenChange(false);
        setDigits("");
        setMatchPrefix(false);
        setActionType("");
        setArgsValue("");
        setArgsValues([]);
        setBodyValue("");
      } else {
        toast.error(
          `${t("addFailed")}: ${responseData?.message || responseData?.text || responseData}`,
        );
      }
    } catch (error: any) {
      console.error("Failed to add action:", error);
      toast.error(`${t("addFailed")}: ${error?.message || error?.text || error}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("addIvrKeyAction")}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="text-red-500">*</span>
              {t("digits")}
            </Label>
            <Input
              value={digits}
              onChange={(e) => setDigits(e.target.value)}
              placeholder={t("enterDigits")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>{t("matchPrefix")}</Label>
            <Switch checked={matchPrefix} onCheckedChange={setMatchPrefix} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="text-red-500">*</span>
              {t("action")}
            </Label>
            <Select value={actionType} onValueChange={setActionType} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectAction")} />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((type) => (
                  <SelectItem key={type.k} value={type.k}>
                    {type.v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showArgs && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {argsRequired && <span className="text-red-500">*</span>}
                {argsLabel}
                {isMultiSelect && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({t("selectedCount", { count: argsValues.length })})
                  </span>
                )}
              </Label>
              {argsOptions.length > 0 ? (
                isMultiSelect ? (
                  <ScrollArea className="max-h-[200px] rounded-md border p-2">
                    <div className="space-y-1">
                      {argsOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            checked={argsValues.includes(option.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setArgsValues([...argsValues, option.value]);
                              } else {
                                setArgsValues(argsValues.filter((v) => v !== option.value));
                              }
                            }}
                          />
                          <span className="truncate">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <Select value={argsValue} onValueChange={setArgsValue}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("select")} />
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
                  value={argsValue}
                  onChange={(e) => setArgsValue(e.target.value)}
                  placeholder={actionType === "IVR_TTS" ? t("ttsPlaceholder") : t("enterValue")}
                />
              )}
            </div>
          )}

          {showBody && (
            <div className="space-y-2">
              <Label>{bodyLabel}</Label>
              {actionType === "IVR_SYSTEM" ? (
                <Textarea
                  value={bodyValue}
                  onChange={(e) => setBodyValue(e.target.value)}
                  placeholder="log ERR line1&#10;log ERR line2"
                  className="min-h-[100px] font-mono text-sm"
                />
              ) : (
                <Input
                  value={bodyValue}
                  onChange={(e) => setBodyValue(e.target.value)}
                  placeholder={t("enterNumber")}
                />
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
          <Button onClick={() => void handleSubmit()}>{t("submit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
