import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PhoneIcon, PhoneIncomingIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext, useWatch } from "react-hook-form";
import { FormItem, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { getLabels } from "@/lib/utils";

interface NumberTransformationFieldsProps {
  mode: "sdnc" | "dnc";
  fieldPrefix?: string;
  isEditing?: boolean;
  numberTranslation?: any[];
  distributors?: any[];
}

// 变换类型选项
const TRANSFORM_TYPES = [
  { value: "none", key: "-" },
  { value: "-nnn+nnn", key: "DeleteFromTheBeginningThenAddFromTheBeginning" },
  { value: "-nnn", key: "DeleteFromTheBeginning" },
  { value: "+nnn", key: "AddFromTheBeginning" },
  { value: "rnnn", key: "ReplaceTheCorrespondingDigitFromTheBeginning" },
  { value: "Rnnn", key: "ReplaceTheCorrespondingDigitFromTheEnd" },
  { value: "mxnnn", key: "From one, replace the corresponding number of digits" },
  { value: "ixnnn", key: "Insert before someone" },
  { value: "Ixnnn", key: "Insert after someone" },
  { value: "dxn", key: "Delete the n digit from the x digit" },
  { value: "nnn", key: "ReplaceAllNumbers" },
  { value: "pattern", key: "RegularExpressionSubstitution" },
  { value: "numtab", key: "NumChangeTables" },
  { value: "distributors", key: "Distributors" },
];

// 解析现有值并返回变换类型和参数
function parseTransformValue(value: string): { type: string; params: Record<string, string> } {
  if (!value) return { type: "", params: {} };

  // -nnn+nnn 格式：-123+456
  const matchDeleteThenAdd = value.match(/^-([0-9]+)\+([0-9]+)$/);
  if (matchDeleteThenAdd) {
    return {
      type: "-nnn+nnn",
      params: { delete: matchDeleteThenAdd[1], add: matchDeleteThenAdd[2] },
    };
  }

  // -nnn 格式：-123
  const matchDelete = value.match(/^-([0-9]+)$/);
  if (matchDelete) {
    return { type: "-nnn", params: { delete: matchDelete[1] } };
  }

  // +nnn 格式：+123
  const matchAdd = value.match(/^\+([0-9]+)$/);
  if (matchAdd) {
    return { type: "+nnn", params: { add: matchAdd[1] } };
  }

  // rnnn 格式：r123
  const matchReplaceLower = value.match(/^r([0-9]+)$/);
  if (matchReplaceLower) {
    return { type: "rnnn", params: { replace: matchReplaceLower[1] } };
  }

  // Rnnn 格式：R123
  const matchReplaceUpper = value.match(/^R([0-9]+)$/);
  if (matchReplaceUpper) {
    return { type: "Rnnn", params: { replace: matchReplaceUpper[1] } };
  }

  // mxnnn 格式：m21（从第 2 位开始替换 1 位）
  const matchM = value.match(/^m([0-9]+)([0-9]+)$/);
  if (matchM) {
    return { type: "mxnnn", params: { position: matchM[1], count: matchM[2] } };
  }

  // ixnnn 格式：i21（在第 2 位前插入 1）
  const matchILower = value.match(/^i([0-9]+)([0-9]+)$/);
  if (matchILower) {
    return { type: "ixnnn", params: { position: matchILower[1], insert: matchILower[2] } };
  }

  // Ixnnn 格式：I21（在第 2 位后插入 1）
  const matchIUpper = value.match(/^I([0-9]+)([0-9]+)$/);
  if (matchIUpper) {
    return { type: "Ixnnn", params: { position: matchIUpper[1], insert: matchIUpper[2] } };
  }

  // dxn 格式：d21（从第 2 位开始删掉 1 位）
  const matchD = value.match(/^d([0-9]+)([0-9]+)$/);
  if (matchD) {
    return { type: "dxn", params: { position: matchD[1], count: matchD[2] } };
  }

  // nnn 格式：@132（替换全部）
  const matchN = value.match(/^@(.+)$/);
  if (matchN) {
    return { type: "nnn", params: { replace: matchN[1] } };
  }

  // pattern 格式：/4352/1（正则替换）
  const matchPattern = value.match(/^\/(.+)\/(.+)$/);
  if (matchPattern) {
    return { type: "pattern", params: { pattern: matchPattern[1], replacement: matchPattern[2] } };
  }

  // numtab 格式：s/prefix_nts_3/original_number/nts_number/
  const matchNumtab = value.match(/^s\/prefix_nts_([0-9]+)\/([^/]+)\/([^/]+)\/$/);
  if (matchNumtab) {
    return {
      type: "numtab",
      params: {
        tableId: matchNumtab[1],
        originalNumber: matchNumtab[2],
        ntsNumber: matchNumtab[3],
      },
    };
  }

  // distributors 格式：X/tet
  const matchDistributor = value.match(/^X\/([^/]+)$/);
  if (matchDistributor) {
    return { type: "distributors", params: { distributor: matchDistributor[1] } };
  }

  return { type: "", params: {} };
}

// 根据变换类型和参数生成提交值
function formatTransformValue(type: string, params: Record<string, string>): string {
  if (type === "none" || !type) return "";

  switch (type) {
    case "-nnn+nnn":
      return `-${params.delete || ""}+${params.add || ""}`;
    case "-nnn":
      return `-${params.delete || ""}`;
    case "+nnn":
      return `+${params.add || ""}`;
    case "rnnn":
      return `r${params.replace || ""}`;
    case "Rnnn":
      return `R${params.replace || ""}`;
    case "mxnnn":
      return `m${params.position || ""}${params.count || ""}`;
    case "ixnnn":
      return `i${params.position || ""}${params.insert || ""}`;
    case "Ixnnn":
      return `I${params.position || ""}${params.insert || ""}`;
    case "dxn":
      return `d${params.position || ""}${params.count || ""}`;
    case "nnn":
      return `@${params.replace || ""}`;
    case "pattern":
      return `/${params.pattern || ""}/${params.replacement || ""}`;
    case "numtab":
      return `s/prefix_nts_${params.tableId || "3"}/${params.originalNumber || ""}/${params.ntsNumber || ""}/`;
    case "distributors":
      return `X/${params.distributor || ""}`;
    default:
      return "";
  }
}

export function NumberTransformationFields({
  mode,
  isEditing = false,
  numberTranslation = [],
  distributors = [],
}: NumberTransformationFieldsProps) {
  const t = useTranslations("routes");
  const tc = useTranslations("common");

  const titleKey = mode === "sdnc" ? "callerNumberTransformation" : "calledNumberTransformation";
  const typeLabelKey = mode === "sdnc" ? "callerTransformationType" : "calledTransformationType";
  const fieldName = mode; // sdnc or dnc

  const form = useFormContext();
  const fieldValue = form?.watch(fieldName);

  const [type, setType] = useState<string>("none");
  const [params, setParams] = useState<Record<string, string>>({});

  const transformValue = useWatch({ name: fieldName, control: form.control }) || "";

  useEffect(() => {
    if (transformValue) {
      const parsed = parseTransformValue(transformValue);
      if (parsed.type && parsed.type !== type) {
        setType(parsed.type);
        setParams(parsed.params);
      }
    } else {
      // 如果表单值为空，清空内部状态
      if (type !== "none") {
        setType("none");
        setParams({});
      }
    }
  }, [transformValue]);

  useEffect(() => {
    if (fieldValue && !transformValue) {
      const parsed = parseTransformValue(fieldValue);
      setType(parsed.type || "none");
      setParams(parsed.params);
    }
  }, []);

  // 更新表单值
  const updateFieldValue = (newType: string, newParams: Record<string, string>) => {
    const value = formatTransformValue(newType, newParams);
    form?.setValue(fieldName, value);
  };

  const handleTypeChange = (newType: string) => {
    const newParams: Record<string, string> = {};

    if (newType === "none") {
      updateFieldValue("none", {});
      setType("none");
      setParams({});
      return;
    }

    // 切换类型时，保留可能的参数值
    if (type === newType) {
      updateFieldValue("", {});
      // 同时清空内部状态
      setType("");
      setParams({});
      return;
    }

    setType(newType);
    setParams(newParams);
    updateFieldValue(newType, newParams);
  };

  const handleParamChange = (key: string, value: string) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    updateFieldValue(type, newParams);
  };

  const renderTransformFields = () => {
    if (!type) return null;

    // 字段配置映射
    const fieldConfigs: Record<
      string,
      Array<{
        name: string;
        label: string;
        paramKey: string;
        type?: "input" | "select";
        options?: Array<{ value: string; label: string }>;
      }>
    > = {
      "-nnn+nnn": [
        {
          name: "delete",
          label: "DeleteFromBeginning",
          paramKey: "delete",
        },
        { name: "add", label: "ThenAddToBeginning", paramKey: "add" },
      ],
      "-nnn": [
        {
          name: "delete",
          label: "DeleteFromBeginning",
          paramKey: "delete",
        },
      ],
      "+nnn": [{ name: "add", label: "AddToBeginning", paramKey: "add" }],
      rnnn: [
        {
          name: "replace",
          label: "ReplaceAtTheBeginning",
          paramKey: "replace",
        },
      ],
      Rnnn: [
        {
          name: "replace",
          label: "ReplaceAtTheEnd",
          paramKey: "replace",
        },
      ],
      mxnnn: [
        {
          name: "position",
          label: "StartingAtTheXPosition",
          paramKey: "position",
        },
        {
          name: "count",
          label: "ReplaceTheNumberOfBitsCorrespondingToNnn",
          paramKey: "count",
        },
      ],
      ixnnn: [
        {
          name: "position",
          label: "BeforeTheXPosition",
          paramKey: "position",
        },
        { name: "insert", label: "InsertNnn", paramKey: "insert" },
      ],
      Ixnnn: [
        {
          name: "position",
          label: "AfterTheXPosition",
          paramKey: "position",
        },
        { name: "insert", label: "InsertNnn", paramKey: "insert" },
      ],
      dxn: [
        {
          name: "position",
          label: "StartingTheXPosition",
          paramKey: "position",
        },
        { name: "count", label: "DeleteNDigits", paramKey: "count" },
      ],
      nnn: [
        {
          name: "replace",
          label: "ReplaceAllNumbersWithNnn",
          paramKey: "replace",
        },
      ],
      pattern: [
        {
          name: "pattern",
          label: "RegularExpression",
          paramKey: "pattern",
        },
        {
          name: "replacement",
          label: "ChangeContent",
          paramKey: "replacement",
        },
      ],
      numtab: [
        {
          name: "tableId",
          label: "NumChangeTables",
          paramKey: "tableId",
          type: "select",
          options: numberTranslation,
        },
      ],
      distributors: [
        {
          name: "distributor",
          label: "Distributors",
          paramKey: "distributor",
          type: "select",
          options: distributors,
        },
      ],
    };

    const config = fieldConfigs[type];
    if (!config) return null;

    return (
      <>
        {config.map((field, index) => {
          const fieldFullName = `${fieldName}_${field.paramKey}_${index}` as any;

          return (
            <div key={index} className="md:col-span-1">
              <div className="flex items-center gap-1 mb-2">
                <Label className="text-muted-foreground text-sm">
                  <span className="text-destructive text-xs mr-1">*</span>
                  {t(field.label)}
                </Label>
              </div>
              <FormField
                name={fieldFullName}
                control={form.control}
                rules={{
                  validate: (value) => {
                    if (!type) return true;
                    if (!params[field.paramKey] || params[field.paramKey] === "") {
                      return `${t(field.label)}${tc("required")}`;
                    }
                    return true;
                  },
                }}
                render={({ field: formField, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      {field.type === "select" ? (
                        <Select
                          value={params[field.paramKey] || ""}
                          onValueChange={(value) => handleParamChange(field.paramKey, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type="text"
                          value={params[field.paramKey] || ""}
                          onChange={(e) => handleParamChange(field.paramKey, e.target.value)}
                        />
                      )}
                    </FormControl>
                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                  </FormItem>
                )}
              />
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className={cn("col-span-full rounded-lg border bg-gray-50/50 p-4 mb-4")}>
      {/* 头部 */}
      <div className="mb-4 flex items-center gap-2">
        <Badge variant={mode === "sdnc" ? "default" : "secondary"} className="gap-1">
          {mode === "sdnc" ? (
            <PhoneIcon className="h-3 w-3" />
          ) : (
            <PhoneIncomingIcon className="h-3 w-3" />
          )}
          {mode === "sdnc" ? "主叫" : "被叫"}
        </Badge>
        <h4 className="font-medium">{t(titleKey)}</h4>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 变换类型选择 */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-1 mb-2">
            <Label className="text-muted-foreground text-sm">{t(typeLabelKey)}</Label>
          </div>
          {isEditing ? (
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSFORM_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {t(item.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="min-h-[2.25rem] py-1 text-sm">
              {type ? t(getLabels(TRANSFORM_TYPES, type, "key")) : "-"}
            </div>
          )}
        </div>
        {!isEditing ? (
          <div>
            <Label className="text-muted-foreground text-sm">
              {t(
                fieldName === "sdnc"
                  ? "Caller Number Change Content"
                  : "Callee Number Change Content",
              )}
            </Label>
            <div className="min-h-[2.25rem] py-1 text-sm">{transformValue}</div>
          </div>
        ) : (
          isEditing && renderTransformFields()
        )}
      </div>
    </div>
  );
}
