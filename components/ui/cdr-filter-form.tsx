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
  name: string;
  type: FilterFieldType;
  label?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  render?: (form: UseFormReturn<Record<string, any>>) => React.ReactNode;
  width?: string;
  disabled?: boolean;
}

/**
 * 筛选表单 Props
 */
interface CdrFilterFormProps {
  fields: FilterField[];
  onFilterChange: (filters: Record<string, any>) => void;
  defaultValues?: Record<string, any>;
  showClearButton?: boolean;
  showApplyButton?: boolean;
  translationPrefix?: string;
  renderActions?: (form: UseFormReturn<Record<string, any>>) => React.ReactNode;
}

export function CdrFilterForm({
  fields,
  onFilterChange,
  defaultValues = {},
  showClearButton = true,
  showApplyButton = true,
  translationPrefix = "common",
  renderActions,
}: CdrFilterFormProps) {
  const t = useTranslations(translationPrefix);
  const methods = useForm<Record<string, any>>({
    defaultValues,
    mode: "onChange",
  });

  const { handleSubmit, watch, reset } = methods;
  const formValues = watch();

  const applyFilters = () => {
    const newFilters: Record<string, any> = {};

    Object.entries(formValues).forEach(([key, value]) => {
      if (value === "__empty__") {
        value = "";
      }

      if (value !== undefined && value !== "") {
        newFilters[key] = value;
      }
    });

    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyValues: Record<string, any> = {};
    Object.keys(formValues).forEach((key) => {
      emptyValues[key] = "";
    });
    reset(emptyValues);
    onFilterChange({});
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

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
                {field.options?.map((option) => (
                  <SelectItem key={option.value || "__empty__"} value={option.value || "__empty__"}>
                    {option.label}
                  </SelectItem>
                ))}
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
        <div className="flex items-center gap-2 flex-wrap">
          {fields.map((field) => (
            <React.Fragment key={field.name}>{renderField(field)}</React.Fragment>
          ))}

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
