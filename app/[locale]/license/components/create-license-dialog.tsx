"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type License } from "@repo/api-client";

interface CreateLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateLicenseDialog({ open, onOpenChange, onSubmit }: CreateLicenseDialogProps) {
  const t = useTranslations("license");
  const tc = useTranslations("common");
  const tt = useTranslations("table");

  const createLicenseSchema = z.object({
    name: z.string().min(1, tc("nameRequired")),
    description: z.string().optional().or(z.literal("")),
  });

  type CreateLicenseFormData = z.infer<typeof createLicenseSchema>;

  const form = useForm<CreateLicenseFormData>({
    resolver: zodResolver(createLicenseSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open && form) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (data: CreateLicenseFormData) => {
    try {
      await onSubmit(data);
      // 只有成功时才重置表单和关闭弹框
      form.reset();
      onOpenChange(false);
    } catch (e) {
      // Error handled in parent component
      // 创建失败时不关闭弹框，让用户可以修正后重试
      console.error("Failed to create license:", e);
      // 阻止异常继续传播
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("createLicense")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleSubmit)(e);
            }}
          >
            <div className="grid gap-4 py-4">
              {/* name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      <span className="text-destructive mr-1">*</span>
                      {t("name")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      {t("description") || "描述"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tt("close") || "关闭"}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? tt("submitting") || "提交中..."
                  : tt("submit") || "提交"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
