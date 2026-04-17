"use client";

import { useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// 字段类型定义
export type FieldType = "text" | "number" | "select" | "date" | "textarea" | "email" | "password";

// 单个字段的配置
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  // select 类型的选项
  options?: Array<{ value: string; label: string }>;
  // 验证规则
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
  // 是否禁用
  disabled?: boolean;
  // 描述文本
  description?: string;
  // 日期选择器的额外配置
  dateConfig?: {
    disabledDates?: (date: Date) => boolean;
    mode?: "single" | "multiple" | "range";
  };
  // 是否隐藏（根据条件）
  hidden?: boolean;
  // 依赖的其他字段值（用于条件显示）
  dependsOn?: {
    field: string;
    value: any;
  };
  // 表单字段值（由 react-hook-form 提供）
  value?: any;
  // 表单字段变更处理函数（由 react-hook-form 提供）
  onChange?: (value: any) => void;
}

// 表单配置
export interface FormConfig {
  fields: FieldConfig[];
  schema?: z.ZodType<any>;
  defaultValues?: Record<string, any>;
}

// 动态表单对话框的 props
export interface DynamicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  config: FormConfig;
  onSubmit: (values: any) => Promise<void> | void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  contentClassName?: string;
}

// 构建 Zod Schema
export const buildZodSchema = (fields: FieldConfig[], t: (key: string) => string) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    if (field.hidden) return;

    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "number":
        fieldSchema = z.string().min(1, `${field.label}${t("required")}`);
        break;
      case "date":
        fieldSchema = z.date().refine((val) => val !== undefined, {
          message: `${field.label}${t("options")}`,
        });
        break;
      case "email":
        fieldSchema = z.string().email("请输入有效的邮箱地址");
        break;
      default:
        fieldSchema = z.string();
        break;
    }

    // 添加必填验证
    if (field.required && field.type !== "date") {
      try {
        // 尝试作为字符串类型处理
        const errorMessage =
          field.type === "select"
            ? `${field.label}${t("options")}`
            : `${field.label}${t("required")}`;
        fieldSchema = (fieldSchema as z.ZodString).min(1, errorMessage);
      } catch {
        // 如果不是字符串类型，保持原样
        console.warn(`无法为字段 ${field.name} 应用 min 验证`);
      }
    }

    // 添加自定义验证
    if (field.validation) {
      if (field.validation.minLength) {
        fieldSchema = (fieldSchema as z.ZodString).min(
          field.validation.minLength,
          `最少${field.validation.minLength}个字符`,
        );
      }
      if (field.validation.maxLength) {
        fieldSchema = (fieldSchema as z.ZodString).max(
          field.validation.maxLength,
          `最多${field.validation.maxLength}个字符`,
        );
      }
      if (field.validation.min !== undefined && field.type === "number") {
        fieldSchema = z.string().refine(
          (val) => {
            const num = Number(val);
            return !isNaN(num) && num >= field.validation!.min!;
          },
          { message: `最小值为${field.validation.min}` },
        );
      }
      if (field.validation.max !== undefined && field.type === "number") {
        fieldSchema = z.string().refine(
          (val) => {
            const num = Number(val);
            return !isNaN(num) && num <= field.validation!.max!;
          },
          { message: `最大值为${field.validation.max}` },
        );
      }
      if (field.validation.pattern) {
        fieldSchema = (fieldSchema as z.ZodString).regex(field.validation.pattern, "格式不正确");
      }
    }

    // 如果非必填，允许为空
    if (!field.required && field.type !== "date") {
      fieldSchema = fieldSchema.optional().or(z.literal(""));
    }

    shape[field.name] = fieldSchema;
  });

  return z.object(shape);
};

// 渲染单个表单项
const FormFieldRenderer = ({
  field,
  form,
  t,
}: {
  field: FieldConfig;
  form: UseFormReturn<any>;
  t: (key: string) => string;
}) => {
  if (field.hidden) return null;

  // 检查依赖条件
  if (field.dependsOn) {
    const dependentValue = form.watch(field.dependsOn.field);
    if (dependentValue !== field.dependsOn.value) {
      return null;
    }
  }

  const renderInput = () => {
    switch (field.type) {
      case "select":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.required && <span className="text-destructive ml-1">*</span>}
                  {field.label}
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    formField.onChange(value);
                    if (field.onChange) {
                      field.onChange(value);
                    }
                  }}
                  value={formField.value}
                  disabled={field.disabled}
                >
                  <FormControl>
                    <SelectTrigger className="col-span-8 w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "date":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.required && <span className="text-destructive ml-1">*</span>}
                  {field.label}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground",
                        )}
                        disabled={field.disabled}
                      >
                        {formField.value ? (
                          format(formField.value, "yyyy-MM-dd")
                        ) : (
                          <span>{field.placeholder || t("selectDate")}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode={field.dateConfig?.mode || "single"}
                      selected={formField.value}
                      onSelect={formField.onChange}
                      disabled={field.dateConfig?.disabledDates}
                      initialFocus
                      required={field.required || false}
                    />
                  </PopoverContent>
                </Popover>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "textarea":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.required && <span className="text-destructive ml-1">*</span>}
                  {field.label}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    {...formField}
                    value={formField.value ?? ""}
                    disabled={field.disabled}
                  />
                </FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "number":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.required && <span className="text-destructive ml-1">*</span>}
                  {field.label}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    {...formField}
                    value={formField.value ?? ""}
                    type="number"
                  />
                </FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "email":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    value={formField.value ?? ""}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    type="email"
                  />
                </FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "password":
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    value={formField.value ?? ""}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    type="password"
                  />
                </FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => {
              const safeValue = formField.value ?? (field.type === "number" ? undefined : "");
              return (
                <FormItem>
                  <FormLabel>
                    {field.required && <span className="text-destructive ml-1">*</span>}
                    {field.label}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...formField}
                      value={safeValue}
                      placeholder={field.placeholder}
                      disabled={field.disabled}
                      type="text"
                    />
                  </FormControl>
                  {field.description && <FormDescription>{field.description}</FormDescription>}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        );
    }
  };

  return renderInput();
};

// 主组件
export function DynamicFormDialog({
  open,
  onOpenChange,
  title,
  description,
  config,
  onSubmit,
  onCancel,
  submitText,
  cancelText,
  loading = false,
  contentClassName,
}: DynamicFormDialogProps) {
  const tc = useTranslations("common");

  // 构建默认值
  const defaultValues = useMemo(() => {
    const values: Record<string, any> = {};
    config.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        values[field.name] = field.defaultValue;
      } else if (field.type === "date") {
        values[field.name] = undefined;
      } else {
        values[field.name] = "";
      }
    });
    return { ...config.defaultValues, ...values };
  }, [config]);

  // 构建 schema
  const schema = useMemo(() => {
    return config.schema || buildZodSchema(config.fields, tc);
  }, [config, tc]);

  const form = useForm({
    resolver: zodResolver(schema as z.ZodType<any, any, any>),
    defaultValues,
  });

  // 当 schema 变化时重置表单（用于动态添加/删除字段的场景）
  useEffect(() => {
    const currentValues = form.getValues();
    const newDefaultValues: Record<string, any> = {};

    config.fields.forEach((field) => {
      // 如果字段已经有值，保留它
      if (currentValues[field.name] !== undefined && currentValues[field.name] !== "") {
        newDefaultValues[field.name] = currentValues[field.name];
      } else if (field.defaultValue !== undefined) {
        // 否则使用字段的 defaultValue
        newDefaultValues[field.name] = field.defaultValue;
      } else if (field.type === "date") {
        newDefaultValues[field.name] = undefined;
      } else {
        newDefaultValues[field.name] = "";
      }
    });

    form.reset(newDefaultValues);
  }, [schema]);

  // 当对话框打开状态改变时重置表单
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset(defaultValues);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (values: any) => {
    const result = onSubmit(values);
    if (result instanceof Promise) {
      result.catch((error: unknown) => {
        console.error("Form submission error:", error);
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("sm:max-w-[600px] max-h-[80vh] overflow-y-auto", contentClassName)}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleSubmit)(e);
            }}
            className="space-y-4"
          >
            {config.fields.map((field) => (
              <FormFieldRenderer key={field.name} field={field} form={form} t={tc} />
            ))}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                {cancelText || tc("cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {submitText || tc("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
