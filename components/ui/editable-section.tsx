"use client";

import React, { useState, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useForm, UseFormReturn, FieldValues, DefaultValues, SubmitHandler } from "react-hook-form";
import { useFormState } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { PencilIcon, XIcon, CheckIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
} from "@/components/ui/combobox";

/**
 * 字段类型
 */
export type FieldType =
  | "text"
  | "number"
  | "password"
  | "select"
  | "textarea"
  | "switch"
  | "radio"
  | "custom"
  | "multi-select";

/**
 * Select 选项
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * 可编辑字段属性
 */
interface EditableFieldProps {
  /** 字段标签 */
  label: string;
  /** 字段名（用于表单） */
  name?: string;
  /** 字段值（详情模式） */
  value?: ReactNode;
  /** 详情模式的占位符 */
  placeholder?: string;
  /** 字段类型 */
  type?: FieldType;
  /** Select 选项（仅 type="select" 时使用） */
  options?: SelectOption[];
  /** 是否为必填字段 */
  required?: boolean;
  /** 编辑模式的内容渲染函数（type="custom" 时使用） */
  renderEdit?: (field: any) => ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 输入框占位符 */
  inputPlaceholder?: string;
  /** 最小值（type="number" 时使用） */
  min?: number;
  /** 最大值（type="number" 时使用） */
  max?: number;
  /** 步长（type="number" 时使用） */
  step?: number;
  /** Switch 标签（type="switch" 时使用） */
  switchLabel?: string;
  /** Switch 选中值（type="switch" 时使用） */
  switchCheckedValue?: string;
  /** Switch 未选中值（type="switch" 时使用） */
  switchUncheckedValue?: string;
  /** RadioGroup 排列方向（type="radio" 时使用） */
  radioDirection?: "row" | "column";
  /** 编辑状态（由父组件自动注入） */
  isEditing?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /**  onChange 回调函数 */
  onChange?: (value: any) => void;
}

/**
 * 可编辑字段组件
 * 根据编辑状态和 type 属性自动切换显示内容
 */
export function EditableField({
  label,
  name,
  value,
  placeholder = "-",
  type = "text",
  options,
  required = false,
  renderEdit,
  className,
  inputPlaceholder = "",
  min,
  max,
  step,
  switchLabel,
  switchCheckedValue = "yes",
  switchUncheckedValue = "no",
  radioDirection = "row",
  isEditing = false,
  disabled = false,
  onChange,
}: EditableFieldProps) {
  const form = useFormContext();
  const registerFieldName = React.useContext(RenderedFieldsContext);
  const t = useTranslations("common");

  // 将字段名注册到渲染字段集合中
  React.useEffect(() => {
    if (name && registerFieldName) {
      registerFieldName.add(name);
    }
  }, [name, registerFieldName]);

  // 根据类型生成验证规则
  const rules = React.useMemo(() => {
    const rules: any = {};
    if (required) {
      rules.required = `${label}${t("required")}`;
    }
    if (type === "number" && min !== undefined) {
      rules.min = { value: min, message: `${label} ${t("minError", { min })}` };
    }
    if (type === "number" && max !== undefined) {
      rules.max = { value: max, message: `${label} ${t("maxError", { max })}` };
    }
    return rules;
  }, [required, type, min, max, label, t]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1">
        {required && <span className="text-destructive text-xs">*</span>}
        <span className="text-muted-foreground text-sm">{label}</span>
      </div>
      {isEditing && form && name ? (
        <FormField
          control={form.control}
          name={name}
          rules={rules}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                {renderEdit ? (
                  renderEdit(field)
                ) : type === "radio" ? (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className={cn(
                      "w-full",
                      radioDirection === "row"
                        ? "flex flex-row flex-wrap gap-4"
                        : "flex flex-col gap-2",
                    )}
                  >
                    {options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                        <label
                          htmlFor={`${name}-${option.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : type === "switch" ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.value === switchCheckedValue || field.value === true}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? switchCheckedValue : switchUncheckedValue)
                      }
                    />
                    {switchLabel && (
                      <span className="text-sm text-muted-foreground">{switchLabel}</span>
                    )}
                  </div>
                ) : type === "select" ? (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      onChange?.(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="col-span-8 w-full">
                      <SelectValue placeholder={inputPlaceholder || "请选择"} />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : type === "number" ? (
                  <Input
                    type="number"
                    placeholder={inputPlaceholder}
                    {...field}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                  />
                ) : type === "password" ? (
                  <Input
                    type="password"
                    placeholder={inputPlaceholder}
                    {...field}
                    disabled={disabled}
                  />
                ) : type === "textarea" ? (
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={inputPlaceholder}
                    {...field}
                    disabled={disabled}
                  />
                ) : type === "multi-select" ? (
                  <Combobox
                    multiple
                    value={field.value || []}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <ComboboxChips>
                      {field.value && field.value.length > 0
                        ? field.value.map((val: string) => {
                            const option = options?.find((opt) => opt.value === val);
                            return (
                              <ComboboxChip key={val}>{option ? option.label : val}</ComboboxChip>
                            );
                          })
                        : null}
                      <ComboboxChipsInput placeholder={inputPlaceholder || "请选择"} />
                    </ComboboxChips>
                    <ComboboxContent>
                      <ComboboxList>
                        {options?.map((option) => (
                          <ComboboxItem key={option.value} value={option.value}>
                            {option.label}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                ) : (
                  <Input placeholder={inputPlaceholder} {...field} disabled={disabled} />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div className="min-h-[2.25rem] py-1 text-sm">
          {type === "multi-select" && Array.isArray(value)
            ? value.length > 0
              ? value
                  .map((v) => {
                    const option = options?.find((opt) => opt.value === v);
                    return option ? option.label : v;
                  })
                  .join(", ")
              : placeholder
            : type === "switch"
              ? ((value) => {
                  const isChecked =
                    value === switchCheckedValue || value === true || value === 1 || value === "1";
                  return isChecked ? t("yes") : t("no");
                })(value)
              : type === "select"
                ? (() => {
                    if (!value) return placeholder;
                    let valueStr: string;
                    if (typeof value === "object") {
                      valueStr = JSON.stringify(value);
                      const option = options?.find((opt) => opt.value === valueStr);
                      if (option) {
                        return option.label;
                      }
                      const objValue = value as any;
                      if (objValue.media_k) {
                        valueStr = objValue.media_k;
                      } else if (objValue.media_path) {
                        valueStr = objValue.media_path;
                      } else {
                        return valueStr;
                      }
                    } else {
                      valueStr = String(value);
                    }
                    const option = options?.find((opt) => opt.value === valueStr);
                    return option ? option.label : valueStr;
                  })()
                : (value ?? placeholder)}
        </div>
      )}
    </div>
  );
}

function useFormContext() {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error("EditableField must be used within a FormContext provided by EditableSection");
  }
  return context;
}

const FormContext = React.createContext<UseFormReturn<any> | null>(null);

// 创建一个用于注册字段名的上下文
const RenderedFieldsContext = React.createContext<Set<string> | null>(null);

/**
 * 可编辑区块属性
 */
interface EditableSectionProps<T extends FieldValues> {
  /** 区块标题 */
  title: string;
  /** 子组件 */
  children: ReactNode;
  /** 默认是否展开 */
  defaultOpen?: boolean;
  /** 表单默认值 */
  defaultValues: DefaultValues<T>;
  /** 保存时的回调，返回表单数据 */
  onSave: (data: Partial<T>) => boolean | void | Promise<boolean | void>;
  /** 取消编辑时的回调 */
  onCancel?: () => void;
  /** 是否显示编辑按钮 */
  showEditButton?: boolean;
  /** 是否禁用编辑 */
  disabled?: boolean;
  /** 只提交当前渲染的字段（默认为 true） */
  submitRenderedFieldsOnly?: boolean;
}

/**
 * 可编辑区块组件
 * 支持详情/编辑两种模式切换，使用 react-hook-form 管理表单状态
 */
export function EditableSection<T extends FieldValues>({
  title,
  children,
  defaultOpen = true,
  defaultValues,
  onSave,
  onCancel,
  showEditButton = true,
  disabled = false,
  submitRenderedFieldsOnly = true,
}: EditableSectionProps<T>) {
  const t = useTranslations("common");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 收集当前渲染的字段名
  const renderedFieldNames = React.useRef<Set<string>>(new Set());

  const form = useForm<T>({
    defaultValues,
    mode: "onChange",
  });

  const formState = useFormState({ control: form.control });

  const handleEdit = () => {
    // 重置表单为当前值
    form.reset(defaultValues);
    // 清空已渲染字段集合
    renderedFieldNames.current = new Set();
    setIsEditing(true);
  };

  const handleSave: SubmitHandler<T> = async () => {
    setIsSubmitting(true);
    try {
      const allValues = form.getValues();
      // const filterValues = (values: any, dirtyFields: any): any => {
      //   if (typeof values !== "object" || values === null) {
      //     return values;
      //   }
      //   if (Array.isArray(values)) {
      //     return values;
      //   }
      //   const result: any = {};
      //   for (const key of Object.keys(values)) {
      //     if (key === "sdnc" || key === "dnc") {
      //       result[key] = values[key];
      //     } else if (dirtyFields && typeof dirtyFields === "object" && key in dirtyFields) {
      //       result[key] = filterValues(values[key], dirtyFields[key]);
      //     }
      //   }
      //   return result;
      // };
      let filteredData = allValues;
      if (submitRenderedFieldsOnly && renderedFieldNames.current.size > 0) {
        const renderedOnlyData: any = {};
        for (const fieldName of renderedFieldNames.current) {
          if (fieldName in filteredData) {
            renderedOnlyData[fieldName] = filteredData[fieldName];
          }
        }
        filteredData = renderedOnlyData;
      }

      // 等待 onSave 执行完成并检查是否成功
      const saveResult = await onSave(filteredData);

      // 只有当 onSave 返回 true 或 undefined（未明确返回 false）时才关闭编辑模式
      if (saveResult !== false) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error during save:", error);
      // 发生错误时不关闭编辑模式
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    setIsEditing(false);
    onCancel?.();
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // 克隆子组件并传递编辑状态和表单上下文
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<{ isEditing?: boolean }>, {
        isEditing,
      });
    }
    return child;
  });

  return (
    <div className="rounded-lg border bg-background mt-8">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleOpen}>
            <svg
              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <h3 className="font-medium">{title}</h3>
        </div>
        {showEditButton && !disabled && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting}>
                  <XIcon className="mr-1 h-3.5 w-3.5" />
                  {t("cancel")}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={(e) => {
                    e.preventDefault();
                    void form.handleSubmit(handleSave)(e);
                  }}
                  disabled={isSubmitting}
                >
                  <CheckIcon className="mr-1 h-3.5 w-3.5" />
                  {t("save")}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground"
                onClick={handleEdit}
              >
                <PencilIcon className="h-4 w-4" />
                <span className="sr-only">{t("edit")}</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 内容 */}
      {isOpen && (
        <div className="p-4">
          <FormContext.Provider value={form}>
            <RenderedFieldsContext.Provider value={renderedFieldNames.current}>
              <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {childrenWithProps}
                  </div>
                </form>
              </Form>
            </RenderedFieldsContext.Provider>
          </FormContext.Provider>
        </div>
      )}
    </div>
  );
}
