"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm, FormProvider, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";

/**
 * 筛选字段类型
 */
export type FilterFieldType = "search" | "select" | "custom";

/**
 * 筛选字段配置
 */
export interface FilterField {
  /** 字段名 */
  name: string;
  /** 字段类型 */
  type: FilterFieldType;
  /** 字段标签/占位符 */
  label?: string;
  /** 搜索框占位符 */
  placeholder?: string;
  /** Select 选项（仅 type="select" 时使用） */
  options?: Array<{ value: string; label: string }> | any[];
  /** 选项的 label 字段名（用于自定义数据格式，默认 'label'） */
  optionLabelKey?: string;
  /** 选项的 value 字段名（用于自定义数据格式，默认 'value'） */
  optionValueKey?: string;
  /** 自定义渲染函数（仅 type="custom" 时使用） */
  render?: (form: UseFormReturn<Record<string, any>>) => React.ReactNode;
  /** 字段宽度 */
  width?: string;
  /** 是否只读 */
  disabled?: boolean;
}

/**
 * 筛选表单 Props
 */
interface ListFilterFormProps {
  /** 筛选字段配置 */
  fields: FilterField[];
  /** 筛选条件变化回调 */
  onFilterChange: (filters: Record<string, any>) => void;
  /** 默认值 */
  defaultValues?: Record<string, any>;
  /** 是否显示清除按钮 */
  showClearButton?: boolean;
  /** 是否显示应用按钮 */
  showApplyButton?: boolean;
  /** 国际化翻译前缀 */
  translationPrefix?: string;
  /** 自定义操作按钮区域 */
  renderActions?: (form: UseFormReturn<Record<string, any>>) => React.ReactNode;
}

/**
 * 通用列表筛选表单组件
 *
 * @example
 * ```tsx
 * // Routes 页面使用示例
 * <ListFilterForm
 *   fields={[
 *     {
 *       name: "name",
 *       type: "search",
 *       placeholder: t("searchRoutes"),
 *       width: "200px"
 *     },
 *     {
 *       name: "dest_type",
 *       type: "select",
 *       label: t("destinationType"),
 *       options: destinationTypes.map(item => ({
 *         value: item.k,
 *         label: t(item.k)
 *       })),
 *       width: "180px"
 *     },
 *     {
 *       name: "status",
 *       type: "select",
 *       label: t("status"),
 *       options: [
 *         { value: "", label: t("all") || "全部" },
 *         { value: "active", label: t("active") || "启用" },
 *         { value: "inactive", label: t("inactive") || "停用" }
 *       ],
 *       width: "120px"
 *     }
 *   ]}
 *   onFilterChange={handleFilterChange}
 *   defaultValues={{
 *     name: filters.name || "",
 *     dest_type: filters.dest_type || "",
 *     status: filters.disabled !== undefined ? (filters.disabled === 0 ? "active" : "inactive") : ""
 *   }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Extensions 页面使用示例
 * <ListFilterForm
 *   fields={[
 *     {
 *       name: "extension",
 *       type: "search",
 *       placeholder: "搜索分机号...",
 *       width: "200px"
 *     },
 *     {
 *       name: "department",
 *       type: "select",
 *       label: "部门",
 *       options: departments.map(dept => ({
 *         value: dept.id,
 *         label: dept.name
 *       })),
 *       width: "150px"
 *     },
 *     {
 *       name: "device_type",
 *       type: "select",
 *       label: "设备类型",
 *       options: [
 *         { value: "", label: "全部" },
 *         { value: "ip_phone", label: "IP 电话" },
 *         { value: "soft_phone", label: "软电话" }
 *       ],
 *       width: "150px"
 *     }
 *   ]}
 *   onFilterChange={handleFilterChange}
 * />
 * ```
 */
export function ListFilterForm({
  fields,
  onFilterChange,
  defaultValues = {},
  showClearButton = true,
  showApplyButton = true,
  translationPrefix = "common",
  renderActions,
}: ListFilterFormProps) {
  const t = useTranslations(translationPrefix);

  const methods = useForm<Record<string, any>>({
    defaultValues,
    mode: "onChange",
  });

  const { handleSubmit, watch, reset } = methods;
  const formValues = watch();

  // 应用筛选
  const applyFilters = () => {
    const newFilters: Record<string, any> = {};

    fields.forEach((field) => {
      let value = formValues[field.name];

      // 将特殊值 "__empty__" 转换回空字符串
      if (value === "__empty__") {
        value = "";
      }

      if (value !== undefined && value !== "") {
        newFilters[field.name] = value;
      }
    });

    onFilterChange(newFilters);
  };

  // 清除筛选
  const clearFilters = () => {
    const emptyValues: Record<string, any> = {};
    fields.forEach((field) => {
      emptyValues[field.name] = "";
    });
    reset(emptyValues);
    onFilterChange({});
  };

  // 处理回车搜索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  // 渲染单个字段
  const renderField = (field: FilterField) => {
    switch (field.type) {
      case "search": {
        return (
          <div className="relative" style={{ width: field.width }}>
            <Input
              placeholder={field.placeholder}
              value={formValues[field.name] || ""}
              onChange={(e) => methods.setValue(field.name, e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 pl-8 pr-4"
              disabled={field.disabled}
            />
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        );
      }

      case "select": {
        // 获取 label 和 value 的字段名，默认为 'label' 和 'value'
        const labelKey = field.optionLabelKey || "label";
        const valueKey = field.optionValueKey || "value";

        return (
          <Select
            value={formValues[field.name] || ""}
            onValueChange={(value) => {
              // 将特殊值 "__empty__" 转换回空字符串
              methods.setValue(field.name, value === "__empty__" ? "" : value);
            }}
            disabled={field.disabled}
          >
            <SelectTrigger className="w-auto h-9" style={{ width: field.width }}>
              <SelectValue placeholder={field.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {field.options?.map((option, index) => {
                  // 支持两种格式：{ value, label } 或自定义字段名
                  const label =
                    typeof option === "object" && option !== null
                      ? option[labelKey] || option.label
                      : String(option);
                  const value =
                    typeof option === "object" && option !== null
                      ? option[valueKey] || option.value
                      : String(option);

                  return (
                    <SelectItem key={value || `__empty__-${index}`} value={value || "__empty__"}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        );
      }

      case "custom": {
        return field.render?.(methods);
      }

      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit(applyFilters)(e);
        }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          {/* 筛选字段 */}
          {fields.map((field) => (
            <React.Fragment key={field.name}>{renderField(field)}</React.Fragment>
          ))}

          {/* 操作按钮 */}
          {(showClearButton || showApplyButton || renderActions) && (
            <div className="flex items-center gap-2 ml-auto">
              {renderActions?.(methods)}
              {showClearButton && (
                <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                  {t("clearFilters") || "清除筛选"}
                </Button>
              )}
              {showApplyButton && (
                <Button type="submit" size="sm">
                  {t("applyFilters") || "应用筛选"}
                </Button>
              )}
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
