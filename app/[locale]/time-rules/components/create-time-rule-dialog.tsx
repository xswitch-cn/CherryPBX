"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const createTimeRuleSchema = z.object({
  name: z.string().min(1, "规则名称不能为空"),
  description: z.string().optional(),
});

type CreateTimeRuleForm = z.infer<typeof createTimeRuleSchema>;

interface CreateTimeRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTimeRuleForm) => Promise<void>;
}

export function CreateTimeRuleDialog({ open, onOpenChange, onSubmit }: CreateTimeRuleDialogProps) {
  const t = useTranslations("timeRules");
  const tt = useTranslations("common");

  const form = useForm<CreateTimeRuleForm>({
    resolver: zodResolver(createTimeRuleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleSubmit = async (data: CreateTimeRuleForm) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("addRule")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit(handleSubmit)();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">{t("ruleName")}</Label>
            <Input id="name" {...form.register("name")} placeholder={t("ruleName")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder={t("description")}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {tt("cancel")}
            </Button>
            <Button type="submit" className="ml-2 bg-primary text-white hover:bg-primary/90">
              {tt("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
