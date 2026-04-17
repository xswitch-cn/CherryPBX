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
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Blacklist } from "../blacklist-columns";

// 创建Blacklist的表单数据类型
const createBlacklistSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  listType: z.string().min(1),
  userType: z.string().min(1),
});

export type CreateBlacklistFormData = z.infer<typeof createBlacklistSchema>;

// 创建Blacklist的对话框
export function CreateBlacklistDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBlacklistFormData) => Promise<void>;
}) {
  const tt = useTranslations("blacklist");
  const ttt = useTranslations("table");

  const form = useForm<CreateBlacklistFormData>({
    resolver: zodResolver(createBlacklistSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      listType: "",
      userType: "",
    },
  });

  const handleSubmit = async (data: CreateBlacklistFormData) => {
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
          <DialogTitle>{tt("createBlacklist")}</DialogTitle>
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
                      <Input {...field} placeholder={tt("name")} />
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
                      <Input {...field} placeholder={tt("description")} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* 名单类型 */}
              <FormField
                control={form.control}
                name="listType"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right">
                      <span className="text-destructive mr-1">*</span>
                      {tt("listType")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <div className="w-full">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={tt("listType")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">{tt("blacklist")}</SelectItem>
                            <SelectItem value="1">{tt("whitelist")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* 限制用户类型 */}
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right">
                      <span className="text-destructive mr-1">*</span>
                      {tt("userType")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <div className="w-full">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={tt("userType")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">{tt("caller")}</SelectItem>
                            <SelectItem value="1">{tt("called")}</SelectItem>
                            <SelectItem value="2">{tt("callerAndCalled")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tt("close")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {tt("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// 删除Blacklist的对话框
export function DeleteBlacklistDialog({
  open,
  onOpenChange,
  blacklist,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blacklist: Blacklist | null;
  onSubmit: (id: number) => Promise<void>;
}) {
  const tt = useTranslations("blacklist");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{tt("deleteBlacklist")}</DialogTitle>
          <DialogDescription>
            {tt("areYouSureDelete", { name: blacklist?.name || "" })}
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
              if (blacklist) {
                void onSubmit(blacklist.id);
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
