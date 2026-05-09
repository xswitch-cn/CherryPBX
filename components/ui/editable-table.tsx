"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

/**
 * Select 选项
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * 操作按钮配置
 */
export interface TableAction {
  /** 操作类型 */
  type: "delete" | "custom";
  /** 操作标签 */
  label?: string;
  /** 自定义点击回调（type="custom" 时使用） */
  onClick?: (row: unknown) => void;
}

/**
 * 列定义
 */
export interface EditableTableColumn<TData> {
  /** 列的键名 */
  key: keyof TData | string;
  /** 列标题 */
  header: string;
  /** 列宽 */
  width?: string;
  /** 字段类型 */
  type?: "text" | "number" | "select" | "switch" | "action" | "radio";
  /** Select/Radio 选项（type="select" 或 type="radio" 时使用） */
  options?: SelectOption[];
  /** 占位符 */
  placeholder?: string;
  /** 自定义渲染 */
  render?: (row: TData) => React.ReactNode;
  /** 是否显示详细信息链接 */
  showInfo?: boolean;
  /** 详细信息点击回调 */
  onInfoClick?: (row: TData) => void;
  /** 操作按钮配置（type="action" 时使用） */
  actions?: TableAction[];
  /** RadioGroup 排列方向（type="radio" 时使用） */
  radioDirection?: "row" | "column";
}

/**
 * 行数据变更回调
 */
export interface EditableTableRowChange<TData> {
  rowId: string;
  key: string;
  value: unknown;
  /** 整行最新数据（包含本次变更） */
  rowData: TData;
}

/**
 * 可编辑表格属性
 */
export interface EditableTableProps<TData> {
  /** 列定义 */
  columns: EditableTableColumn<TData>[];
  /** 表格数据 */
  data: TData[];
  /** 获取每行的唯一标识 */
  getRowId?: (row: TData, index: number) => string;
  /** 单元格值变更回调 */
  onChange?: (change: EditableTableRowChange<TData>) => void;
  /** 删除行回调 */
  onDelete?: (row: TData, rowId: string) => void | Promise<void>;
  /** 是否显示删除确认对话框 */
  showDeleteConfirm?: boolean;
  /** 删除确认对话框标题 */
  deleteConfirmTitle?: string;
  /** 删除确认对话框描述 */
  deleteConfirmDescription?: string;
  /** 空数据提示文本 */
  emptyText?: string;
  /** 自定义类名 */
  className?: string;
  /** Switch 选中值 */
  switchCheckedValue?: string | number;
  /** Switch 未选中值 */
  switchUncheckedValue?: string | number;
  /** 是否处于编辑模式 */
  isEditing?: boolean;
}

/**
 * 可编辑表格单元格组件
 */
function EditableTableCell<TData extends Record<string, unknown>>({
  row,
  column,
  rowIndex,
  onChange,
  onDelete,
  getRowId,
  switchCheckedValue,
  switchUncheckedValue,
  isEditing,
}: {
  row: TData;
  column: EditableTableColumn<TData>;
  rowIndex: number;
  onChange?: (change: EditableTableRowChange<TData>) => void;
  onDelete?: (row: TData, rowId: string) => void;
  getRowId: (row: TData, index: number) => string;
  switchCheckedValue: string | number;
  switchUncheckedValue: string | number;
  isEditing?: boolean;
}) {
  const fieldName = column.key as string;
  const rowValue = row[column.key as keyof TData];
  const rowId = getRowId(row, rowIndex);
  const t = useTranslations("common");

  // 文本输入类型的Hooks（始终调用，确保Hooks顺序一致）
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [editValue, setEditValue] = React.useState(String(rowValue ?? ""));
  const [isCellEditing, setIsCellEditing] = React.useState(false);

  // Radio 类型的Hooks（始终调用，确保Hooks顺序一致）
  const [isRadioEditing, setIsRadioEditing] = React.useState(false);
  const [radioTempValue, setRadioTempValue] = React.useState<string>("");

  // 当外部 rowValue 变化时，同步更新本地编辑值
  React.useEffect(() => {
    if (!isCellEditing) {
      setEditValue(String(rowValue ?? ""));
    }
  }, [rowValue, isCellEditing]);

  // 操作列类型
  if (column.type === "action" && column.actions) {
    return (
      <div className="flex items-center gap-2">
        {column.actions.map((action, index) => {
          if (action.type === "delete") {
            return (
              <button
                key={index}
                className="text-teal-500 hover:text-teal-600 text-sm cursor-pointer"
                onClick={() => {
                  const rowId = getRowId(row, rowIndex);
                  onDelete?.(row, rowId);
                }}
                type="button"
              >
                {action.label || t("delete") || "删除"}
              </button>
            );
          }
          if (action.type === "custom" && action.onClick) {
            return (
              <button
                key={index}
                className="text-teal-500 hover:text-teal-600 text-sm cursor-pointer"
                onClick={() => action.onClick?.(row)}
                type="button"
              >
                {action.label || "操作"}
              </button>
            );
          }
          return null;
        })}
      </div>
    );
  }

  // 自定义渲染
  if (column.render) {
    return (
      <div className={cn("flex items-center gap-1", isEditing && "bg-gray-100 rounded p-1")}>
        <span className="text-sm">{column.render(row)}</span>
        {column.showInfo && column.onInfoClick && (
          <button
            className="text-teal-500 hover:text-teal-600 text-sm"
            onClick={() => column.onInfoClick?.(row)}
            type="button"
          >
            {t("details")}
          </button>
        )}
      </div>
    );
  }

  // Switch 类型
  if (column.type === "switch") {
    // 判断是否使用了自定义值（不是默认的 "yes"/"no"）
    const hasCustomValues = switchCheckedValue !== "yes" || switchUncheckedValue !== "no";

    let isChecked: boolean;
    if (hasCustomValues) {
      // 使用自定义值进行严格比较
      isChecked = rowValue === switchCheckedValue;
    } else {
      // 使用默认判断逻辑：true, 1, "1", "yes" 都表示启用
      isChecked = rowValue === true || rowValue === 1 || rowValue === "1" || rowValue === "yes";
    }
    return (
      <div className={cn("flex items-center gap-1", isEditing && "bg-gray-100 rounded p-1")}>
        <Switch
          checked={isChecked}
          onCheckedChange={(checked) => {
            const newValue = checked ? switchCheckedValue : switchUncheckedValue;
            // 只有值真正改变时才触发 onChange
            if (newValue !== rowValue) {
              const newRowData = { ...row, [fieldName]: newValue };
              onChange?.({ rowId, key: fieldName, value: newValue, rowData: newRowData });
            }
          }}
        />
        <span className="text-sm text-muted-foreground">{isChecked ? t("yes") : t("no")}</span>
      </div>
    );
  }

  // Select 类型
  if (column.type === "select" && column.options) {
    return (
      <div className={cn("flex items-center gap-1", isEditing && "bg-gray-100 rounded p-1")}>
        <Select
          value={String(rowValue ?? "")}
          onValueChange={(value) => {
            // 只有值真正改变时才触发 onChange
            if (value !== String(rowValue ?? "")) {
              const newRowData = { ...row, [fieldName]: value };
              onChange?.({ rowId, key: fieldName, value, rowData: newRowData });
            }
          }}
        >
          <SelectTrigger className="w-36 h-7 text-sm">
            <SelectValue placeholder={column.placeholder || "请选择"} />
          </SelectTrigger>
          <SelectContent>
            {column.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {column.showInfo && column.onInfoClick && (
          <button
            className="text-teal-500 hover:text-teal-600 text-sm shrink-0"
            onClick={() => column.onInfoClick?.(row)}
            type="button"
          >
            {t("details")}
          </button>
        )}
      </div>
    );
  }

  // Radio 类型
  if (column.type === "radio" && column.options) {
    // 查找当前值对应的选项标签
    const currentOption = column.options.find(
      (opt) => String(opt.value) === String(rowValue ?? ""),
    );
    const displayLabel = currentOption ? currentOption.label : String(rowValue ?? "-");

    // 点击文本进入编辑模式
    const handleRadioClick = () => {
      setRadioTempValue(String(rowValue ?? ""));
      setIsRadioEditing(true);
    };

    // 处理选择变更（只更新临时值，不提交）
    const handleRadioChange = (value: string) => {
      setRadioTempValue(value);
    };

    // 确认提交并退出编辑模式
    const handleRadioConfirm = () => {
      setIsRadioEditing(false);
      // 只有值真正改变时才触发 onChange
      if (radioTempValue !== String(rowValue ?? "")) {
        const newRowData = { ...row, [fieldName]: radioTempValue };
        onChange?.({ rowId, key: fieldName, value: radioTempValue, rowData: newRowData });
      }
    };

    // 取消编辑，恢复原值
    const handleRadioCancel = () => {
      setIsRadioEditing(false);
      setRadioTempValue(String(rowValue ?? ""));
    };

    // 编辑模式：显示 RadioGroup
    if (isRadioEditing) {
      return (
        <div
          className={cn("flex items-center gap-1", isEditing && "bg-gray-100 rounded p-1")}
          onBlur={handleRadioConfirm}
          tabIndex={0}
        >
          <RadioGroup
            value={radioTempValue}
            onValueChange={handleRadioChange}
            autoFocus
            className={cn(
              "w-full",
              column.radioDirection === "row"
                ? "flex flex-row flex-wrap gap-4"
                : "flex flex-col gap-2",
            )}
          >
            {column.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${rowId}-${fieldName}-${option.value}`} />
                <label
                  htmlFor={`${rowId}-${fieldName}-${option.value}`}
                  className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
          {column.showInfo && column.onInfoClick && (
            <button
              className="text-teal-500 hover:text-teal-600 text-sm shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                column.onInfoClick?.(row);
              }}
              type="button"
            >
              {t("details")}
            </button>
          )}
        </div>
      );
    }

    // 详情模式：显示文本，可点击编辑
    return (
      <div
        className={cn(
          "flex items-center gap-1 cursor-pointer",
          isEditing && "bg-gray-100 rounded p-1",
        )}
        onClick={handleRadioClick}
      >
        <span className="text-sm hover:text-foreground">{displayLabel}</span>
        {column.showInfo && column.onInfoClick && (
          <button
            className="text-teal-500 hover:text-teal-600 text-sm shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              column.onInfoClick?.(row);
            }}
            type="button"
          >
            {t("details")}
          </button>
        )}
      </div>
    );
  }

  // 文本输入类型（text / number）
  if (column.type === "text" || column.type === "number") {
    // 点击文本进入编辑模式
    const handleClick = () => {
      setIsCellEditing(true);
      setEditValue(String(rowValue ?? ""));
      // 下一帧聚焦输入框
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        inputRef.current?.blur();
      }
      if (e.key === "Escape") {
        setEditValue(String(rowValue ?? ""));
        setIsCellEditing(false);
      }
    };

    const handleBlur = () => {
      setIsCellEditing(false);
      const newValue = column.type === "number" ? Number(editValue) || 0 : editValue;
      // 只有值真正改变时才触发 onChange
      if (newValue !== rowValue) {
        const newRowData = { ...row, [fieldName]: newValue };
        onChange?.({
          rowId,
          key: fieldName,
          value: newValue,
          rowData: newRowData,
        });
      }
    };

    if (isCellEditing) {
      return (
        <div className={cn("flex items-center gap-1", isEditing && "bg-gray-100 rounded p-1")}>
          <input
            ref={inputRef}
            type={column.type}
            value={editValue}
            placeholder={column.placeholder || "请输入"}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={cn(
              "h-7 w-36 rounded-md border border-input bg-background px-2 py-0.5 text-sm",
              "ring-offset-background placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            )}
          />
          {column.showInfo && column.onInfoClick && (
            <button
              className="text-teal-500 hover:text-teal-600 text-sm shrink-0"
              onClick={() => column.onInfoClick?.(row)}
              type="button"
            >
              {t("details")}
            </button>
          )}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex items-center gap-1 cursor-pointer min-h-[28px]",
          isEditing && "bg-gray-100 rounded p-1",
        )}
        onClick={handleClick}
      >
        <span className="text-sm hover:text-foreground">
          {rowValue === "" || rowValue === undefined || rowValue === null ? (
            <span className="text-muted-foreground italic">{column.placeholder || "-"}</span>
          ) : (
            String(rowValue)
          )}
        </span>
        {column.showInfo && column.onInfoClick && (
          <button
            className="text-teal-500 hover:text-teal-600 text-sm shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              column.onInfoClick?.(row);
            }}
            type="button"
          >
            {t("details")}
          </button>
        )}
      </div>
    );
  }

  // 默认显示
  return (
    <div className={cn("flex items-center gap-2", isEditing && "bg-gray-100 rounded p-1")}>
      <span className="text-sm">{String(rowValue ?? "-")}</span>
      {column.showInfo && column.onInfoClick && (
        <button
          className="text-teal-500 hover:text-teal-600 text-sm"
          onClick={() => column.onInfoClick?.(row)}
          type="button"
        >
          {t("details")}
        </button>
      )}
    </div>
  );
}

/**
 * 可编辑表格组件
 *
 * 基于 shadcn/ui Table 组件，支持行内实时编辑：
 * - 文本/数字输入框：点击编辑，回车或失焦保存
 * - Switch：切换即生效
 * - Select：选择即生效
 * - Radio：选择即生效
 *
 * @example
 * ```tsx
 * <EditableTable
 *   columns={[
 *     { key: "name", header: tc('name') },
 *     { key: "value", header: tc('value'), type: "text" },
 *     { key: "direction", header: "方向", type: "select", options: directionOptions },
 *     { key: "enabled", header: tc('enabled'), type: "switch" },
 *     { key: "rule", header: "规则", type: "radio", options: [
 *       { value: "allow", label: "允许" },
 *       { value: "deny", label: "拒绝" }
 *     ]},
 *   ]}
 *   data={rows}
 *   onChange={({ rowId, key, value, rowData }) => {
 *     // 处理变更
 *   }}
 * />
 * ```
 */
export function EditableTable<TData extends Record<string, unknown>>({
  columns,
  data,
  getRowId = (_, index) => String(index),
  onChange,
  onDelete,
  showDeleteConfirm = true,
  deleteConfirmTitle,
  deleteConfirmDescription,
  emptyText,
  className,
  switchCheckedValue = "yes",
  switchUncheckedValue = "no",
  isEditing = false,
}: EditableTableProps<TData>) {
  const t = useTranslations("common");

  // 内部维护最新行数据
  const [rows, setRows] = React.useState<TData[]>(data);

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{ row: TData; rowId: string } | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  // 当外部 data 变化时同步
  React.useEffect(() => {
    setRows(data);
  }, [data]);

  const handleChange = (change: EditableTableRowChange<TData>) => {
    setRows((prev) =>
      prev.map((row, index) => {
        if (getRowId(row, index) === change.rowId) {
          return change.rowData as TData;
        }
        return row;
      }),
    );
    onChange?.(change);
  };

  const handleDeleteClick = (row: TData, rowId: string) => {
    if (showDeleteConfirm) {
      setDeleteTarget({ row, rowId });
      setDeleteDialogOpen(true);
    } else {
      void handleConfirmDelete(row, rowId);
    }
  };

  const handleConfirmDelete = async (row: TData, rowId: string) => {
    setIsDeleting(true);
    setDeleteDialogOpen(false);
    try {
      await onDelete?.(row, rowId);
      // 从本地状态中移除已删除的行
      setRows((prev) => prev.filter((_, index) => getRowId(_, index) !== rowId));
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const defaultEmptyText = emptyText || t("noData") || "暂无数据";

  return (
    <div className={cn("rounded-lg border bg-background", className)}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/50">
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={String(column.key)}
                style={
                  column.width ? { width: column.width } : { width: `${100 / columns.length}%` }
                }
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <TableRow key={getRowId(row, rowIndex)}>
                {columns.map((column) => (
                  <TableCell
                    key={`${getRowId(row, rowIndex)}-${String(column.key)}`}
                    className="whitespace-nowrap"
                  >
                    <EditableTableCell
                      row={row}
                      column={column}
                      rowIndex={rowIndex}
                      onChange={handleChange}
                      onDelete={handleDeleteClick}
                      getRowId={getRowId}
                      switchCheckedValue={switchCheckedValue}
                      switchUncheckedValue={switchUncheckedValue}
                      isEditing={isEditing}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {defaultEmptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={deleteConfirmTitle || t("Confirm to Delete ?") || "确认删除"}
          onSubmit={() => {
            if (deleteTarget) {
              void handleConfirmDelete(deleteTarget.row, deleteTarget.rowId);
            }
          }}
          deleteText={t("delete") || "删除"}
          cancelText={t("cancel") || "取消"}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
