"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { extensionsApi, hotlinesApi } from "@/lib/api-client";

const createDidSchema = z.object({
  line_number: z.string().min(1, { message: "线路号码不能为空" }),
  description: z.string().optional(),
  numbers: z.string().min(1, { message: "绑定分机不能为空" }),
});

type CreateDidFormData = z.infer<typeof createDidSchema>;

export function CreateDidDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  const t = useTranslations("did");
  const tt = useTranslations("table");
  const ttt = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [extnOptions, setExtnOptions] = useState<Array<{ value: string; label: string }>>([]);

  const form = useForm<CreateDidFormData>({
    resolver: zodResolver(createDidSchema),
    defaultValues: {
      line_number: "",
      description: "",
      numbers: "",
    },
  });

  const loadExtensions = useCallback(async () => {
    try {
      const response = await extensionsApi.list({ page_size: 5000 });
      const extensionData = response.data.data || [];

      const options = extensionData.map((ext) => ({
        value: ext.extn,
        label: `${ext.name} | ${ext.extn}`,
      }));
      setExtnOptions(options);
    } catch (error) {
      console.error("Failed to load extensions:", error);
      toast.error(ttt("failedToLoadExtensions") || "加载分机失败");
    }
  }, [ttt]);

  useEffect(() => {
    if (open) {
      void loadExtensions();
    }
  }, [open, loadExtensions]);

  const handleCreate = async (data: CreateDidFormData) => {
    try {
      setLoading(true);
      await hotlinesApi.create(data);
      toast.success(t("createdDidSuccess") || "DID创建成功");
      onSubmit();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Failed to create did:", error);
      toast.error(
        `${t("createdDidFailed") || "DID创建失败"}: ${error?.message || error?.text || error}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("addDid")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleCreate)(e);
            }}
          >
            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="line_number"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel htmlFor="line_number" className="col-span-4 text-right">
                      <span className="text-destructive mr-1">*</span>
                      {t("DID Number") || "DID号码"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input
                        id="line_number"
                        {...field}
                        placeholder={t("lineNumberPlaceholder") || "请输入DID号码"}
                      />
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
                    <FormLabel htmlFor="description" className="col-span-4 text-right">
                      {t("description") || "描述"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input
                        id="description"
                        {...field}
                        placeholder={t("descriptionPlaceholder") || "请输入描述"}
                      />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numbers"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel htmlFor="numbers" className="col-span-4 text-right">
                      <span className="text-destructive mr-1">*</span>
                      {t("Binding Extension") || "绑定分机"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="numbers">
                          <SelectValue placeholder={t("selectExtension") || "请选择分机"} />
                        </SelectTrigger>
                        <SelectContent>
                          {extnOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {ttt("close") || "关闭"}
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600">
                {loading ? tt("submitting") || "提交中" : ttt("submit") || "提交"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
