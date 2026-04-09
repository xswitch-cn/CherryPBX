"use client";

import { useTranslations } from "next-intl";
// @ts-ignore - Known issue with react-hook-form and zod resolver type inference
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { type ContextItem, type DictItem } from "@repo/api-client";

// 定义表单验证 schema（使用 API 接口定义的字段名）
const createRouteSchema = z.object({
  name: z.string().min(1, "请输入路由名称"),
  description: z.string().optional(),
  prefix: z.string().optional(),
  max_length: z.string(),
  context: z.string().min(1, "请选择呼叫源"),
  dest_type: z.string().min(1, "请选择目的地类型"),
});

type CreateRouteFormData = z.infer<typeof createRouteSchema>;

interface CreateRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRouteFormData) => Promise<void>;
  contexts?: ContextItem[];
  destinationTypes?: DictItem[];
}

export function CreateRouteDialog({
  open,
  onOpenChange,
  onSubmit,
  contexts,
  destinationTypes,
}: CreateRouteDialogProps) {
  const t = useTranslations("routes");
  const tt = useTranslations("table");

  const form = useForm<CreateRouteFormData>({
    resolver: zodResolver(createRouteSchema),
    defaultValues: {
      name: "",
      description: "",
      prefix: "",
      max_length: "12",
      context: "",
      dest_type: "",
    },
  });

  useEffect(() => {
    if (!open && form) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (data: CreateRouteFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch {
      // 错误已在父组件处理
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("addRoute")}</DialogTitle>
          <DialogDescription>{t("addRouteDescription") || "创建新的路由配置"}</DialogDescription>
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
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      <span className="text-destructive mr-1">*</span>
                      {t("routeName")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input placeholder="route_to_beijing" {...field} />
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

              {/* 被叫字冠 */}
              <FormField
                control={form.control}
                name="prefix"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      {t("calledPrefix") || "被叫字冠"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input placeholder="010" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* 最大号长 */}
              <FormField
                control={form.control}
                name="max_length"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      <span className="text-destructive mr-1">*</span>
                      {t("maxNumberLength") || "最大号长"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input placeholder="12" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* 呼叫源 */}
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      <span className="text-destructive mr-1">*</span>
                      {t("callSource") || "呼叫源"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="col-span-8 w-full">
                          <SelectValue placeholder={t("Select context")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {contexts?.map((item) => (
                              <SelectItem value={item.key} key={item.key}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* 目的地类型 */}
              <FormField
                control={form.control}
                name="dest_type"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      <span className="text-destructive mr-1">*</span>
                      {t("destinationType") || "目的地类型"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="col-span-8 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {destinationTypes?.map((item) => (
                              <SelectItem value={item.k} key={item.k}>
                                {t(item.k)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
