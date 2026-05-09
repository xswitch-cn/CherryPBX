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
import { toast } from "sonner";
import { ivrsApi } from "@/lib/api-client";

interface IvrActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ivrId: number;
  onActionAdded: () => void;
}

const ACTION_TYPES = [
  { value: "IVR_QUEUE", label: "队列" },
  { value: "IVR_PLAY", label: "播放语音" },
  { value: "IVR_TRANSFER", label: "转接" },
  { value: "IVR_HANGUP", label: "挂断" },
  { value: "IVR_MEETING", label: "会议" },
  { value: "IVR_CONFERENCE", label: "会议室" },
  { value: "IVR_EXTENSION", label: "分机" },
];

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

  const handleSubmit = async () => {
    if (!digits || !actionType) {
      toast.error(t("fillRequiredFields"));
      return;
    }

    try {
      await ivrsApi.addAction(ivrId, {
        digits,
        match_prefix: matchPrefix ? "1" : "0",
        action: actionType,
        args: "",
        body: "",
      });
      toast.success(t("addSuccess"));
      onActionAdded();
      onOpenChange(false);
      setDigits("");
      setMatchPrefix(false);
      setActionType("");
    } catch (error) {
      console.error("Failed to add action:", error);
      toast.error(t("addFailed"));
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
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectAction")} />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
          <Button onClick={() => void handleSubmit()} className="bg-teal-600 hover:bg-teal-700">
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
