"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { numberTransformApi } from "@/lib/api-client";

const formSchema = z.object({
  name: z.string().min(1, { message: "请输入规则名称" }),
  description: z.string().optional(),
  type: z.string().min(1, { message: "请选择类型" }),
});

export function CreateNumberTransformDialog({
  open,
  onOpenChange,
  onDataChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataChange: () => void;
}) {
  const t = useTranslations("numberTransform");
  const tt = useTranslations("common");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
    },
  });

  const handleCreate = async (data: z.infer<typeof formSchema>) => {
    try {
      await numberTransformApi.create({
        name: data.name,
        description: data.description,
        type: data.type,
      });
      toast.success(t("createdSuccessfully") || "创建成功");
      onOpenChange(false);
      form.reset();
      onDataChange();
    } catch (error) {
      console.error("Failed to create number transform:", error);
      toast.error(t("createFailed") || "创建失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("createNumberChangeTable") || "创建号码变换表"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleCreate)(e);
            }}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      <span className="text-destructive mr-1">*</span>
                      {t("name") || "名称"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input placeholder={t("name") || "请输入规则名称"} {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      <span className="text-destructive mr-1">*</span>
                      {t("tableType") || "类型"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("tableType") || "请选择类型"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exact">{t("exactMatch") || "精确匹配"}</SelectItem>
                          <SelectItem value="prefix">{t("prefixMatch") || "前缀匹配"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      {t("description") || "描述"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Textarea placeholder={t("description") || "请输入描述"} {...field} />
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
