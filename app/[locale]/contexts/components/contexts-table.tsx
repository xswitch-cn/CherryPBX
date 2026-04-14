import React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type Context } from "../contexts-columns";

// 创建Context的表单数据类型
const createContextSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  hotline_enabled: z.boolean().default(false),
});

export type CreateContextFormData = z.infer<typeof createContextSchema>;

// 创建Context的对话框
export function CreateContextDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateContextFormData) => Promise<void>;
}) {
  const tt = useTranslations("contexts");
  const ttt = useTranslations("table");

  const form = useForm<CreateContextFormData>({
    resolver: zodResolver(createContextSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      hotline_enabled: false,
    },
  });

  const handleSubmit = async (data: CreateContextFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch {
      // 错误在父组件处理
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{tt("newContext")}</DialogTitle>
          <DialogDescription>{tt("addContext")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleSubmit)(e);
            }}
          >
            <div className="grid gap-4 py-4">
              {/* 名称 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right">
                      <span className="text-destructive mr-1">*</span>
                      {tt("name")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* 描述 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right">{tt("description")}</FormLabel>
                    <FormControl className="col-span-8">
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* 启用DID */}
              <FormField
                control={form.control}
                name="hotline_enabled"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right">{tt("didEnabled")}</FormLabel>
                    <FormControl className="col-span-8">
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {ttt("close")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? ttt("submitting") : ttt("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// 查看Context详情的对话框
export function ViewContextDialog({
  open,
  onOpenChange,
  context,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: Context | null;
}) {
  const tt = useTranslations("contexts");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tt("contexts")} {tt("Details")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          {context && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right font-medium">{tt("id")}：</Label>
                <span>{context.id}</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right font-medium">{tt("name")}：</Label>
                <span>{context.name}</span>
              </div>
              <div className="flex items-start gap-4">
                <Label className="w-24 text-right font-medium pt-2">{tt("description")}：</Label>
                <span>{context.description || tt("no")}</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right font-medium">{tt("identifier")}：</Label>
                <span>{context.key}</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24 text-right font-medium">{tt("didEnabled")}：</Label>
                <span>{context.didEnabled ? tt("yes") : tt("no")}</span>
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

// 删除Context的对话框
export function DeleteContextDialog({
  open,
  onOpenChange,
  context,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: Context | null;
  onSubmit: (id: number) => Promise<void>;
}) {
  const tt = useTranslations("contexts");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{tt("deleteContext")}</DialogTitle>
          <DialogDescription>
            {tt("areYouSureDelete", { name: context?.name || "" })}
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
              if (context) {
                void onSubmit(context.id);
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
