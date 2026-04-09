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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { type Gateway } from "@repo/api-client";

interface CreateGatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  gateways: Gateway[];
}

export function CreateGatewayDialog({
  open,
  onOpenChange,
  onSubmit,
  gateways,
}: CreateGatewayDialogProps) {
  const t = useTranslations("gateways");
  const tc = useTranslations("common");
  const tt = useTranslations("table");

  const createGatewaySchema = z.object({
    name: z
      .string()
      .min(1, t("nameRequired"))
      .regex(/^[^\u4e00-\u9fa5]+$/, tc("Cannot input Chinese")),
    realm: z.string().min(1, t("realmRequired")),
    username: z.string().min(1, t("usernameRequired")),
    password: z.string().min(1, t("passwordRequired")),
    description: z.string().optional().or(z.literal("")),
    template: z.string().optional().or(z.literal("")),
    register: z.string(),
  });

  type CreateGatewayFormData = z.infer<typeof createGatewaySchema>;

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateGatewayFormData>({
    resolver: zodResolver(createGatewaySchema),
    defaultValues: {
      name: "",
      realm: "",
      username: "",
      password: "",
      description: "",
      template: "-1",
      register: "yes",
    },
  });

  useEffect(() => {
    if (!open && form) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (data: CreateGatewayFormData) => {
    try {
      // 转换表单数据为 API 所需格式
      const apiData: any = {
        name: data.name,
        realm: data.realm,
        username: data.username,
        password: data.password,
      };

      // 只添加非空字段
      if (data.description) {
        apiData.description = data.description;
      }

      if (data.template && data.template !== "-1") {
        apiData.profile_id = data.template;
      }

      // register 字段可能需要特定格式
      apiData.register = data.register === "yes" ? "true" : "false";

      console.log("Submitting gateway data:", apiData);
      await onSubmit(apiData);
      // 只有成功时才重置表单和关闭弹框
      form.reset();
      onOpenChange(false);
    } catch (e) {
      // Error handled in parent component
      // 创建失败时不关闭弹框，让用户可以修正后重试
      console.error("Failed to create gateway:", e);
      // 阻止异常继续传播
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("createGateway")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleSubmit)(e);
            }}
          >
            <div className="grid gap-4 py-4">
              {/* Name */}
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
                      <Input
                        placeholder="gw1"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          void form.trigger("name");
                        }}
                      />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* Server (Realm) */}
              <FormField
                control={form.control}
                name="realm"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      <span className="text-destructive mr-1">*</span>
                      {t("server")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input placeholder="example.com" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      <span className="text-destructive mr-1">*</span>
                      {t("username")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      <span className="text-destructive mr-1">*</span>
                      {tc("password")}
                    </FormLabel>
                    <FormControl className="col-span-8 relative">
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
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

              {/* Template (Profile) */}
              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      {tc("template") || "模板"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="col-span-8 w-full">
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="-1">Default</SelectItem>
                          </SelectGroup>
                          {gateways.map((item) => (
                            <SelectGroup key={item?.id}>
                              <SelectItem value={item?.id}>{`Gateway[${item?.name}]`}</SelectItem>
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* Register */}
              <FormField
                control={form.control}
                name="register"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right justify-center flex">
                      {tc("register") || "注册"}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex items-center gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="register-yes" />
                          <label htmlFor="register-yes" className="text-sm cursor-pointer">
                            {tc("yes") || "是"}
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="register-no" />
                          <label htmlFor="register-no" className="text-sm cursor-pointer">
                            {tc("no") || "否"}
                          </label>
                        </div>
                      </RadioGroup>
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
