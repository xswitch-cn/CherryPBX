import React, { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { routesApi } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { InboxIcon } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GripVertical, PlusIcon, ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export interface ActionItem {
  id: number;
  k: string;
  v: string;
  disabled: number;
  order?: number;
}

interface ActionListProps {
  actions: ActionItem[];
  onActionsChange: (actions: ActionItem[]) => void;
  isEditing?: boolean;
  routeId: string;
  loadRouteDetail: () => void;
}

// 可排序的表格行组件
function SortableRow({ action, children }: { action: ActionItem; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn("border-b transition-colors hover:bg-muted/50", isDragging && "bg-muted")}
    >
      {children}
    </tr>
  );
}

// 添加/编辑动作对话框
function ActionDialog({
  open,
  onOpenChange,
  action,
  onSave,
  applications,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: ActionItem;
  onSave: (action: ActionItem | Omit<ActionItem, "id">) => void | Promise<void>;
  applications: { value: string; label: string }[];
}) {
  const t = useTranslations("routes");
  const tc = useTranslations("common");
  const [activeTab, setActiveTab] = useState("script");
  const [optionData, setOptionData] = useState<{ value: string; label: string }[]>([]);

  const form = useForm();

  React.useEffect(() => {
    if (action) {
      form.reset({
        k: action.k || "",
        v: action.v || "",
        disabled: action.disabled ?? 0,
        id: action.id,
      });
    } else {
      form.reset();
    }
    setActiveTab("script");
  }, [action, form]);

  useEffect(() => {
    const fetchScripts = async () => {
      const k = form.watch("k");
      if (k === "uploaded_scripts") {
        try {
          const res = await routesApi.getScripts();
          if (res.data) {
            const options = res.data.map((item: any) => ({
              value: item.abs_path,
              label: item.name,
            }));
            setOptionData(options);
          }
        } catch (error) {
          console.error("Failed to fetch scripts:", error);
        }
      } else if (k === "inner_scripts") {
        try {
          const res = await routesApi.getXuiScripts();
          if (Array.isArray(res.data)) {
            const options = res.data.map((item: any) => ({
              value: item.v,
              label: `${t(item.d)}|${item.k}`,
            }));
            setOptionData(options);
          }
        } catch (error) {
          console.error("Failed to fetch xui scripts:", error);
        }
      }
    };
    void fetchScripts();
  }, [t, form.watch("k")]);

  const handleSubmit = async (data: any) => {
    if (!data.k) return;
    try {
      await onSave(data as Omit<ActionItem, "id">);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      onOpenChange(false);
    }
  };

  // 关闭弹框时重置表单
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setActiveTab("manual");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{action ? tc("editAction") : tc("addAction")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(handleSubmit)(e);
            }}
            className="space-y-4"
          >
            {action?.id ? (
              <>
                <div className="space-y-2 mt-4">
                  <FormField
                    control={form.control}
                    name="k"
                    rules={{ required: `${tc("actionName")} ${tc("required")}` }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive text-xs">*</span>
                          {tc("actionName")}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={tc("inputParams")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <FormField
                    control={form.control}
                    name="v"
                    rules={{ required: tc("actionParams") + " " + tc("required") }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="text-destructive text-xs">*</span>
                          {tc("actionParams")}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={tc("inputParams")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <FormField
                    control={form.control}
                    name="disabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{tc("enabled")}</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === 0}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? 0 : 1);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v);
                  form.reset();
                }}
                className="mt-4"
              >
                <TabsList className="grid w-full grid-cols-3">
                  {/* <TabsTrigger value="manual">{tc("manualAdd")}</TabsTrigger> */}
                  <TabsTrigger value="script">{tc("selectScript")}</TabsTrigger>
                  <TabsTrigger value="custom">{tc("customInput")}</TabsTrigger>
                </TabsList>
                {activeTab === "custom" ? (
                  <div className="space-y-2 mt-4">
                    <FormField
                      control={form.control}
                      name="k"
                      rules={{ required: tc("actionName") + " " + tc("required") }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-destructive text-xs">*</span>
                            {tc("actionName")}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder={tc("inputParams")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="space-y-2 mt-4">
                    <FormField
                      control={form.control}
                      name="k"
                      rules={{ required: tc("actionName") + " " + tc("required") }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-destructive text-xs">*</span>
                            {activeTab === "script" ? t("Script Source") : tc("actionName")}
                          </FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="col-span-8 w-full">
                                <SelectValue
                                  placeholder={
                                    activeTab === "script" ? "" : tc("selectApplication")
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {activeTab === "script" ? (
                                  <>
                                    <SelectItem value="inner_scripts">
                                      {t("Built-in Scripts")}
                                    </SelectItem>
                                    <SelectItem value="uploaded_scripts">
                                      {t("Media File Upload Script")}
                                    </SelectItem>
                                  </>
                                ) : (
                                  applications.map((app) => (
                                    <SelectItem key={app.value} value={app.value}>
                                      {app.label}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {activeTab === "script" ? (
                  <div className="space-y-2 mt-4">
                    <FormField
                      control={form.control}
                      name="v"
                      rules={{ required: tc("options") + " " + tc("required") }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-destructive text-xs">*</span>
                            {tc("options")}
                          </FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="col-span-8 w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {optionData.map((item: { value: string; label: string }) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="space-y-2 mt-4">
                    <FormField
                      control={form.control}
                      name="v"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tc("actionParams")}</FormLabel>
                          <FormControl>
                            <Input placeholder={tc("inputParams")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </Tabs>
            )}
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tc("close")}
              </Button>
              <Button type="submit" disabled={!form.watch("k")}>
                {tc("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function ActionList({
  actions,
  onActionsChange,
  routeId,
  loadRouteDetail,
}: ActionListProps & {
  loadRouteDetail: () => void;
}) {
  const tc = useTranslations("common");
  const t = useTranslations("routes");
  const [isExpanded, setIsExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionItem>({} as ActionItem);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!dialogOpen) {
      setEditingAction({} as ActionItem);
    }
  }, [dialogOpen]);

  useEffect(() => {
    if (!deleteDialogOpen) {
      setEditingAction({} as ActionItem);
    }
  }, [deleteDialogOpen]);

  // 模拟的应用列表（实际应从 API 获取）
  const applications = [
    { value: "ai_channel_state_answer", label: "AI Channel State Answer" },
    { value: "bgsystem", label: "BG System" },
    { value: "hangup", label: "Hangup" },
    { value: "playback", label: "Playback" },
    { value: "record", label: "Record" },
  ];
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 处理拖拽结束
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = actions.findIndex((a) => a.id === active.id);
        const newIndex = actions.findIndex((a) => a.id === over.id);
        const activeIdNum = typeof active.id === "string" ? Number(active.id) : active.id;
        const overIdNum = typeof over.id === "string" ? Number(over.id) : over.id;
        void routesApi
          .drag(activeIdNum, overIdNum)
          .then(() => {
            const newActions = arrayMove(actions, oldIndex, newIndex);
            onActionsChange(newActions);
          })
          .catch((error) => {
            console.error("Drag failed:", error);
            toast.error(tc("dragFailed"));
          });
      }
    },
    [actions, onActionsChange, tc],
  );

  // 添加动作
  const handleAddAction = () => {
    setDialogOpen(true);
  };

  // 删除动作
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await routesApi.deleteParams(routeId, editingAction.id);
      toast.success(tc("deleteSuccess"));
      loadRouteDetail();
    } catch (error) {
      toast.error(tc("deleteFailed"));
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // 保存动作（新增或编辑）
  const handleSaveAction = async (newAction: ActionItem | Omit<ActionItem, "id">) => {
    try {
      if ("id" in newAction && editingAction && editingAction.id) {
        // 编辑模式
        await routesApi.editParams(routeId, newAction);
      } else {
        // 新增模式
        await routesApi.addParams(routeId, newAction);
      }
      toast.success(tc("saveSuccess"));
      loadRouteDetail();
    } catch (error) {
      toast.error(tc("saveFailed"));
      throw error;
    }
  };

  // 切换启用状态
  const handleToggleEnabled = async (id: number) => {
    try {
      await routesApi.editDisabled(routeId, {
        action: "toggle",
        id,
      });
      toast.success(tc("saveSuccess"));
      loadRouteDetail();
    } catch (error) {
      toast.error(tc("saveFailed"));
      throw error;
    }
  };

  return (
    <div className="col-span-full space-y-2">
      {/* 折叠头部 */}
      <div
        className="flex items-center justify-between p-3 rounded-md bg-gray-100/50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium text-sm">
            {tc("actions")} ({actions.length})
          </span>
        </div>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{tc("actionsDescription")}</p>
            <Button size="sm" variant="outline" onClick={handleAddAction}>
              <PlusIcon className="h-4 w-4 mr-1" />
              {tc("add")}
            </Button>
          </div>
          <div className="rounded-lg border bg-card">
            <div className="max-h-[300px] overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm border-b">
                    <tr>
                      <th className="w-[60px] h-12 px-4 text-left align-middle font-medium text-sm text-muted-foreground">
                        {tc("sort")}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-sm text-muted-foreground">
                        {tc("name")}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-sm text-muted-foreground">
                        {tc("param")}
                      </th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-sm text-muted-foreground">
                        {tc("enabled")}
                      </th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-sm text-muted-foreground">
                        {tc("operations")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <Empty className="py-8">
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <InboxIcon />
                              </EmptyMedia>
                              <EmptyTitle>{tc("noData")}</EmptyTitle>
                            </EmptyHeader>
                          </Empty>
                        </td>
                      </tr>
                    ) : (
                      <SortableContext
                        items={actions.map((a) => a.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {actions.map((action) => (
                          <SortableRow key={action.id} action={action}>
                            <TableCell className="w-[60px] py-3 px-4">
                              <div className="flex items-center justify-center">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TableCell>
                            <TableCell className="text-sm py-3 px-4 font-medium">
                              {action.k}
                            </TableCell>
                            <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                              {action.v || "-"}
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="flex items-center justify-center">
                                <Switch
                                  checked={action.disabled === 0}
                                  onCheckedChange={() => void handleToggleEnabled(action.id)}
                                  className="data-[state=checked]:bg-foreground"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-4 text-center">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-teal-600 hover:text-teal-700"
                                  onClick={() => {
                                    setEditingAction(action);
                                    setDialogOpen(true);
                                  }}
                                >
                                  {tc("edit")}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setEditingAction(action);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  {tc("delete")}
                                </Button>
                              </div>
                            </TableCell>
                          </SortableRow>
                        ))}
                      </SortableContext>
                    )}
                  </tbody>
                </table>
              </DndContext>
            </div>
          </div>
        </div>
      )}

      {/* 添加/编辑对话框 */}
      <ActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        action={editingAction}
        onSave={handleSaveAction}
        applications={applications}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("Delete Action")}
        description={tc("DeleteItem", { item: editingAction.k })}
        onSubmit={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
