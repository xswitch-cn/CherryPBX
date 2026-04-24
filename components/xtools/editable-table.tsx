import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Edit, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

// 可编辑表格的属性接口
export interface EditableTableProps {
  data: any[];
  columns: any[];
  onSave: (record: any) => void;
  onDelete?: (record: any) => void;
  onAdd?: () => void;
  onImport?: () => void;
  canEdit?: boolean;
  canAdd?: boolean;
  canImport?: boolean;
  canDelete?: boolean;
  title?: string;
  description?: string;
}

// 可编辑单元格组件
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  required,
  handleSave,
  ...restProps
}: any) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(children);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    setValue(children);
  };

  const cancelEdit = () => {
    toast.info("Cancel Edit");
    setEditing(false);
    setValue(children);
  };

  const keyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 27) {
      cancelEdit();
    }
  };

  const save = async () => {
    try {
      if (required && !value) {
        toast.error(`${typeof title === "string" ? title : "Param"} is required`);
        return;
      }
      setEditing(false);
      handleSave({ ...record, [dataIndex]: value });
    } catch (errInfo) {
      console.log("errInfo", errInfo);
      toast.error("Save Failed");
    }
  };

  let childNode = children;

  if (editable) {
    required = required !== false;
    childNode = editing ? (
      <div className="flex items-center gap-2 w-full h-full p-2">
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={keyDown}
            onBlur={void save}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => void save}>
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={cancelEdit}>
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    ) : (
      <div
        className={cn(
          "flex items-center gap-2 cursor-pointer group w-full h-full p-2",
          "bg-muted/50 hover:bg-muted/70",
        )}
        onClick={toggleEdit}
      >
        <span className="flex-1">{children}</span>
        <Edit className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }
  return <TableCell {...restProps}>{childNode}</TableCell>;
};

// 可编辑表格组件
export const EditableTable: React.FC<EditableTableProps> = ({
  data,
  columns,
  onSave,
  onDelete,
  onAdd,
  onImport,
  canEdit = true,
  canAdd = true,
  canImport = true,
  canDelete = true,
  title,
  description,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // 处理保存
  const handleSave = (record: any) => {
    onSave(record);
  };

  // 处理删除
  const handleDelete = (record: any) => {
    if (onDelete) {
      onDelete(record);
    }
  };

  // 处理添加
  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    }
  };

  // 处理导入
  const handleImport = () => {
    if (onImport) {
      onImport();
    }
  };

  // 处理编辑模式切换
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // 处理列配置
  const processedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: isEditing && col.editable,
        type: col.type,
        options: col.options,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        highlight: isEditing,
      }),
    };
  });

  // 添加操作列
  if (canDelete) {
    processedColumns.push({
      title: "Action",
      dataIndex: "delete",
      render: (_: any, record: any) => (
        <Button variant="destructive" size="sm" onClick={() => handleDelete(record)}>
          Delete
        </Button>
      ),
    });
  }

  return (
    <div className="w-full">
      {/* 表格标题和操作按钮 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-lg">{title}</h3>
          {isEditing && (
            <p className="text-xs text-muted-foreground mt-1">
              点击灰色区域可进行编辑，Enter后直接保存，点击其它区域或取消按钮取消修改
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant={isEditing ? "default" : "ghost"} onClick={handleToggleEdit}>
              {isEditing ? "完成" : "编辑"}
            </Button>
          )}
          {isEditing && canEdit && (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              取消
            </Button>
          )}
          {canAdd && (
            <Button variant="default" onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" />
              添加
            </Button>
          )}
          {canImport && (
            <Button variant="outline" onClick={handleImport}>
              <Upload className="mr-1 h-4 w-4" />
              导入
            </Button>
          )}
        </div>
      </div>

      {/* 表格描述 */}
      {description && <div className="mb-4 text-sm text-muted-foreground">{description}</div>}

      {/* 表格 */}
      <Table>
        <TableCaption>{description}</TableCaption>
        <TableHeader>
          <TableRow>
            {processedColumns.map((col, index) => (
              <TableHead key={index}>{col.title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((record, index) => (
              <TableRow key={record.id || index}>
                {processedColumns.map((col, colIndex) => {
                  const value = record[col.dataIndex];
                  if (col.onCell) {
                    const cellProps = col.onCell(record);
                    return (
                      <EditableCell key={colIndex} {...cellProps}>
                        {value}
                      </EditableCell>
                    );
                  }
                  return (
                    <TableCell key={colIndex}>
                      {col.render ? col.render(value, record) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={processedColumns.length} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-2 text-muted-foreground">暂无数据</div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
