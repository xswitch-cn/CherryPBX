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
import { type IVR } from "../ivr-columns";

export type CreateIvrFormData = {
  name: string;
  description?: string;
};

export function CreateIvrDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateIvrFormData) => Promise<void>;
}) {
  const tt = useTranslations("ivr");
  const ttt = useTranslations("table");

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
    ],
  };

  return (
    <DynamicFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tt("newIvr")}
      config={formConfig}
      onSubmit={onSubmit}
      submitText={ttt("submit")}
      cancelText={ttt("close")}
      contentClassName="sm:max-w-[500px]"
    />
  );
}

export function DeleteIvrDialog({
  open,
  onOpenChange,
  ivr,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ivr: IVR | null;
  onSubmit: (id: number) => Promise<void>;
}) {
  const tt = useTranslations("ivr");
  const ttt = useTranslations("table");

  const handleDelete = () => {
    if (ivr) {
      void onSubmit(ivr.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tt("delete")}</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {ttt("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {ttt("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
