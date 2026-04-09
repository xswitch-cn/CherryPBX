"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
// @ts-ignore - Known issue with react-hook-form and zod resolver type inference
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ContextItem } from "@repo/api-client";
import { ChooseOneUser } from "./choose-one-user";

interface CreateExtensionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateExtensionFormData) => Promise<void>;
  contexts?: ContextItem[];
}

export interface CreateExtensionFormData {
  name: string;
  extn: string;
  endNumber: string;
  password: string;
  context: string;
  login: string;
}

export function CreateExtensionDialog({
  open,
  onOpenChange,
  onSubmit,
  contexts,
}: CreateExtensionDialogProps) {
  const t = useTranslations("extensions");
  const tt = useTranslations("table");
  const [tabIndex, setTabIndex] = useState("0");

  const createExtensionSchema = useMemo(() => {
    return z.object({
      name: z.string().min(1, t("Please enter name")),
      extn: z.string().min(1, t("Please enter number")),
      endNumber: z.string(),
      password: z.string().min(8, t("Password length must be at least 8 characters")),
      context: z.string().min(1, t("Please select context")),
      login: z.string().min(1, t("Please select extension user")),
    });
  }, [t]);

  const form = useForm<CreateExtensionFormData>({
    resolver: zodResolver(createExtensionSchema),
    defaultValues: {
      name: "",
      extn: "",
      endNumber: "",
      password: "",
      context: contexts?.[0]?.key || "",
      login: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        extn: "",
        endNumber: "",
        password: "",
        context: contexts?.[0]?.key || "",
        login: "",
      });
      setTabIndex("0");
    }
  }, [open, form, contexts]);

  const handleSubmit = async (data: CreateExtensionFormData) => {
    try {
      await onSubmit(data);
      form.reset({
        name: "",
        extn: "",
        endNumber: "",
        password: "",
        context: contexts?.[0]?.key || "",
        login: "",
      });
      setTabIndex("0");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to create extension:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("addExtension")}</DialogTitle>
          <DialogDescription>{t("addExtensionDescription") || "创建新的分机"}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleSubmit)(e);
            }}
          >
            <Tabs value={tabIndex} onValueChange={setTabIndex}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="0" className="flex-1">
                  {t("singleExtension")}
                </TabsTrigger>
                <TabsTrigger value="1" className="flex-1">
                  {t("batchExtension")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="0">
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
                          <Input placeholder={t("name") || "张三"} {...field} />
                        </FormControl>
                        <FormMessage className="col-span-8 col-start-5" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="extn"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-12 items-center gap-x-4">
                        <FormLabel className="col-span-4 text-right justify-center flex">
                          <span className="text-destructive mr-1">*</span>
                          {t("number") || "号码"}
                        </FormLabel>
                        <FormControl className="col-span-8">
                          <Input placeholder={t("number") || "1000"} {...field} />
                        </FormControl>
                        <FormMessage className="col-span-8 col-start-5" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-12 items-center gap-x-4">
                        <FormLabel className="col-span-4 text-right justify-center flex">
                          <span className="text-destructive mr-1">*</span>
                          {t("password") || "密码"}
                        </FormLabel>
                        <FormControl className="col-span-8">
                          <Input
                            type="password"
                            placeholder={t("password") || "请输入密码"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-8 col-start-5" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="context"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-12 items-center gap-x-4">
                        <FormLabel className="col-span-4 text-right justify-center flex">
                          <span className="text-destructive mr-1">*</span>
                          {t("context")}
                        </FormLabel>
                        <FormControl className="col-span-8">
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="col-span-8 w-full">
                              <SelectValue placeholder={t("selectContext") || "选择呼叫源"} />
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

                  <FormField
                    control={form.control}
                    name="login"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-12 items-center gap-x-4">
                        <FormLabel className="col-span-4 text-right justify-center flex">
                          <span className="text-destructive mr-1">*</span>
                          {t("extensionUser") || "分机用户"}
                        </FormLabel>
                        <FormControl className="col-span-8">
                          <div className="w-full">
                            <ChooseOneUser
                              value={field.value || undefined}
                              onChange={(userId, user) => {
                                field.onChange(user ? user.login : userId);
                              }}
                              placeholder={t("chooseAUser") || "选择用户"}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="col-span-8 col-start-5" />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="1">
                <div className="grid gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="extn"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-12 items-center gap-x-4">
                        <FormLabel className="col-span-4 text-right justify-center flex">
                          <span className="text-destructive mr-1">*</span>
                          {t("startNumber") || "开始号码"}
                        </FormLabel>
                        <FormControl className="col-span-8">
                          <Input placeholder={t("startNumber") || "1000"} {...field} />
                        </FormControl>
                        <FormMessage className="col-span-8 col-start-5" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endNumber"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-12 items-center gap-x-4">
                        <FormLabel className="col-span-4 text-right justify-center flex">
                          <span className="text-destructive mr-1">*</span>
                          {t("endNumber") || "结束号码"}
                        </FormLabel>
                        <FormControl className="col-span-8">
                          <Input placeholder={t("endNumber") || "1020"} {...field} />
                        </FormControl>
                        <FormMessage className="col-span-8 col-start-5" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-12 items-center gap-x-4">
                        <FormLabel className="col-span-4 text-right justify-center flex">
                          <span className="text-destructive mr-1">*</span>
                          {t("password") || "密码"}
                        </FormLabel>
                        <FormControl className="col-span-8">
                          <Input
                            type="password"
                            placeholder={t("password") || "请输入密码"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-8 col-start-5" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="context"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-12 items-center gap-x-4">
                        <FormLabel className="col-span-4 text-right justify-center flex">
                          <span className="text-destructive mr-1">*</span>
                          {t("context")}
                        </FormLabel>
                        <FormControl className="col-span-8">
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="col-span-8 w-full">
                              <SelectValue placeholder={t("selectContext") || "选择呼叫源"} />
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

                  <FormField
                    control={form.control}
                    name="login"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-12 items-center gap-x-4">
                        <FormLabel className="col-span-4 text-right justify-center flex">
                          <span className="text-destructive mr-1">*</span>
                          {t("extensionUser") || "分机用户"}
                        </FormLabel>
                        <FormControl className="col-span-8">
                          <div className="w-full">
                            <ChooseOneUser
                              value={field.value || undefined}
                              onChange={(userId, user) => {
                                field.onChange(user ? user.login : userId);
                              }}
                              placeholder={t("chooseAUser") || "选择用户"}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="col-span-8 col-start-5" />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

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
