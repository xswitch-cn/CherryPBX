"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, Edit2Icon, XIcon } from "lucide-react";
import { logsApi, type LogConfig, type LogParam, type LogMap } from "@/lib/api-client";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { EditableSection, EditableField } from "@/components/ui/editable-section";

interface ParamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { k: string; v: string }) => void;
  title: string;
}

function ParamDialog({ open, onOpenChange, onSubmit, title }: ParamDialogProps) {
  const [k, setK] = useState("");
  const [v, setV] = useState("");
  const tt = useTranslations("logs");
  const ttt = useTranslations("common");

  const handleSubmit = () => {
    if (!k.trim() || !v.trim()) return;
    onSubmit({ k: k.trim(), v: v.trim() });
    setK("");
    setV("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setK("");
    setV("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-12 items-center gap-x-4">
            <label className="col-span-4 text-right text-sm font-medium">
              <span className="text-destructive mr-1">*</span>
              {tt("name")}
            </label>
            <div className="col-span-8">
              <Input
                type="text"
                value={k}
                onChange={(e) => setK(e.target.value)}
                placeholder={tt("enterName")}
              />
            </div>
          </div>
          <div className="grid grid-cols-12 items-center gap-x-4">
            <label className="col-span-4 text-right text-sm font-medium">
              <span className="text-destructive mr-1">*</span>
              {tt("value")}
            </label>
            <div className="col-span-8">
              <Input
                type="text"
                value={v}
                onChange={(e) => setV(e.target.value)}
                placeholder={tt("enterValue")}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            {ttt("close")}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!k.trim() || !v.trim()}>
            {ttt("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ParamTableProps {
  data: (LogParam | LogMap)[];
  isEditing: boolean;
  onEditStart: (item: LogParam | LogMap, field: "k" | "v") => void;
  onToggle: (item: LogParam | LogMap) => void;
  onDelete: (item: LogParam | LogMap) => void;
  editingCell: { id: number; field: "k" | "v" } | null;
  editValue: string;
  onEditValueChange: (value: string) => void;
}

function ParamTable({
  data,
  isEditing,
  onEditStart,
  onToggle,
  onDelete,
  editingCell,
  editValue,
  onEditValueChange,
}: ParamTableProps) {
  const tt = useTranslations("logs");
  const ttt = useTranslations("common");

  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>{tt("name") || "名称"}</TableHead>
          <TableHead>{tt("value") || "值"}</TableHead>
          <TableHead>{tt("enabled") || "启用"}</TableHead>
          <TableHead>{tt("actions") || "操作"}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {editingCell?.id === item.id && editingCell?.field === "k" ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => onEditValueChange(e.target.value)}
                    className="w-full px-2 py-1 bg-muted rounded border border-input"
                    autoFocus
                  />
                ) : isEditing ? (
                  <span
                    className="cursor-pointer bg-muted px-2 py-1 rounded hover:bg-muted/80"
                    onClick={() => onEditStart(item, "k")}
                  >
                    {item.k}
                  </span>
                ) : (
                  <span>{item.k}</span>
                )}
              </TableCell>
              <TableCell>
                {editingCell?.id === item.id && editingCell?.field === "v" ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => onEditValueChange(e.target.value)}
                    className="w-full px-2 py-1 bg-muted rounded border border-input"
                    autoFocus
                  />
                ) : isEditing ? (
                  <span
                    className="cursor-pointer bg-muted px-2 py-1 rounded hover:bg-muted/80"
                    onClick={() => onEditStart(item, "v")}
                  >
                    {item.v}
                  </span>
                ) : (
                  <span>{item.v}</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant={item.disabled === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToggle(item)}
                >
                  {item.disabled === 0 ? ttt("yes") || "是" : ttt("no") || "否"}
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => onDelete(item)}
                >
                  {tt("delete") || "删除"}
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              {tt("noSettings") || "暂无数据"}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function LogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("pages");
  const tt = useTranslations("logs");
  const ttt = useTranslations("common");

  const logId = Number(params.id);

  const [config, setConfig] = useState<LogConfig | null>(null);
  const [paramsData, setParamsData] = useState<LogParam[]>([]);
  const [mapsData, setMapsData] = useState<LogMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteConfigDialogOpen, setIsDeleteConfigDialogOpen] = useState(false);

  const [isParamsEditing, setIsParamsEditing] = useState(false);
  const [isMapsEditing, setIsMapsEditing] = useState(false);

  const [isCreateParamDialogOpen, setIsCreateParamDialogOpen] = useState(false);
  const [isCreateMapDialogOpen, setIsCreateMapDialogOpen] = useState(false);

  const [paramsEditingCell, setParamsEditingCell] = useState<{
    id: number;
    field: "k" | "v";
  } | null>(null);
  const [paramsEditValue, setParamsEditValue] = useState("");
  const [paramsOriginalValue, setParamsOriginalValue] = useState("");

  const [mapsEditingCell, setMapsEditingCell] = useState<{ id: number; field: "k" | "v" } | null>(
    null,
  );
  const [mapsEditValue, setMapsEditValue] = useState("");
  const [mapsOriginalValue, setMapsOriginalValue] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "param" | "map";
    item: LogParam | LogMap;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const configResponse = await logsApi.getConfigById(logId);
      setConfig(configResponse.data);

      const paramsResponse = await logsApi.listParams(logId);
      setParamsData(Array.isArray(paramsResponse.data) ? paramsResponse.data : []);

      const mapsResponse = await logsApi.listMaps(logId);
      setMapsData(Array.isArray(mapsResponse.data) ? mapsResponse.data : []);
    } catch (error) {
      console.error("Failed to load log config:", error);
      toast.error(tt("failedToLoadConfig") || "加载日志配置失败");
    } finally {
      setLoading(false);
    }
  }, [logId, tt]);

  const handleSaveBasicInfo = useCallback(
    async (formData: any) => {
      if (!config) return false;

      try {
        await logsApi.updateConfig(config.id, {
          name: formData.name,
          description: formData.description,
        });
        setConfig((prev) =>
          prev ? { ...prev, name: formData.name, description: formData.description } : null,
        );
        toast.success(tt("saveSuccess") || "保存成功");
        return true;
      } catch (error: any) {
        console.error("Failed to update log config:", error);
        toast.error(`${tt("saveFailed") || "保存失败"}: ${error?.message || error?.text || error}`);
        return false;
      }
    },
    [config, tt],
  );

  const handleCancelBasicInfo = useCallback(() => {
    // 取消编辑，EditableSection 会自动重置表单
  }, []);

  const handleDeleteConfig = useCallback(async () => {
    if (!config) return;

    try {
      await logsApi.deleteConfig(config.id);
      toast.success(tt("deleteSuccess") || "删除成功");
      router.push("/logs");
    } catch (error: any) {
      console.error("Failed to delete log config:", error);
      toast.error(`${tt("deleteFailed") || "删除失败"}: ${error?.message || error?.text || error}`);
    } finally {
      setIsDeleteConfigDialogOpen(false);
    }
  }, [config, router, tt]);

  const handleCreateParam = useCallback(
    async (data: { k: string; v: string }) => {
      try {
        await logsApi.createParam(logId, data);
        toast.success(tt("createParamSuccess") || "添加参数成功");
        void loadData();
      } catch (error: any) {
        console.error("Failed to create param:", error);
        toast.error(
          `${tt("createParamFailed") || "添加参数失败"}: ${error?.message || error?.text || error}`,
        );
      }
    },
    [logId, loadData, tt],
  );

  const handleCreateMap = useCallback(
    async (data: { k: string; v: string }) => {
      try {
        await logsApi.createMap(logId, data);
        toast.success(tt("createMapSuccess") || "添加映射成功");
        void loadData();
      } catch (error: any) {
        console.error("Failed to create map:", error);
        toast.error(
          `${tt("createMapFailed") || "添加映射失败"}: ${error?.message || error?.text || error}`,
        );
      }
    },
    [logId, loadData, tt],
  );

  const handleStartParamsEdit = useCallback((item: LogParam, field: "k" | "v") => {
    setParamsEditingCell({ id: item.id, field });
    setParamsEditValue(field === "k" ? item.k : item.v);
    setParamsOriginalValue(field === "k" ? item.k : item.v);
  }, []);

  const handleSaveParamsEdit = useCallback(async () => {
    if (!paramsEditingCell) return;

    if (paramsEditValue === paramsOriginalValue) {
      setParamsEditingCell(null);
      setParamsEditValue("");
      return;
    }

    const param = paramsData.find((p) => p.id === paramsEditingCell.id);
    if (!param) return;

    try {
      await logsApi.updateParam(logId, paramsEditingCell.id, {
        k: paramsEditingCell.field === "k" ? paramsEditValue : param.k,
        v: paramsEditingCell.field === "v" ? paramsEditValue : param.v,
        realm: param.realm,
      });
      setParamsData((prev) =>
        prev.map((p) =>
          p.id === paramsEditingCell.id ? { ...p, [paramsEditingCell.field]: paramsEditValue } : p,
        ),
      );
      toast.success(tt("saveSuccess") || "保存成功");
    } catch (error: any) {
      console.error("Failed to update param:", error);
      toast.error(`${tt("saveFailed") || "保存失败"}: ${error?.message || error?.text || error}`);
    } finally {
      setParamsEditingCell(null);
      setParamsEditValue("");
    }
  }, [paramsEditingCell, paramsEditValue, paramsOriginalValue, logId, paramsData, tt]);

  const handleCancelParamsEdit = useCallback(() => {
    setParamsEditingCell(null);
    setParamsEditValue("");
    setIsParamsEditing(false);
  }, []);

  const handleStartMapsEdit = useCallback((item: LogMap, field: "k" | "v") => {
    setMapsEditingCell({ id: item.id, field });
    setMapsEditValue(field === "k" ? item.k : item.v);
    setMapsOriginalValue(field === "k" ? item.k : item.v);
  }, []);

  const handleSaveMapsEdit = useCallback(async () => {
    if (!mapsEditingCell) return;

    if (mapsEditValue === mapsOriginalValue) {
      setMapsEditingCell(null);
      setMapsEditValue("");
      return;
    }

    const mapItem = mapsData.find((m) => m.id === mapsEditingCell.id);
    if (!mapItem) return;

    try {
      await logsApi.updateParam(logId, mapsEditingCell.id, {
        k: mapsEditingCell.field === "k" ? mapsEditValue : mapItem.k,
        v: mapsEditingCell.field === "v" ? mapsEditValue : mapItem.v,
        realm: mapItem.realm,
      });
      setMapsData((prev) =>
        prev.map((m) =>
          m.id === mapsEditingCell.id ? { ...m, [mapsEditingCell.field]: mapsEditValue } : m,
        ),
      );
      toast.success(tt("saveSuccess") || "保存成功");
    } catch (error: any) {
      console.error("Failed to update map:", error);
      toast.error(`${tt("saveFailed") || "保存失败"}: ${error?.message || error?.text || error}`);
    } finally {
      setMapsEditingCell(null);
      setMapsEditValue("");
    }
  }, [mapsEditingCell, mapsEditValue, mapsOriginalValue, logId, mapsData, tt]);

  const handleCancelMapsEdit = useCallback(() => {
    setMapsEditingCell(null);
    setMapsEditValue("");
    setIsMapsEditing(false);
  }, []);

  const handleToggleParam = useCallback(
    async (param: LogParam) => {
      try {
        const newDisabled = param.disabled === 0 ? 1 : 0;
        await logsApi.toggleParam(logId, param.id, {
          k: param.k,
          v: param.v,
          realm: param.realm,
        });
        setParamsData((prev) =>
          prev.map((p) => (p.id === param.id ? { ...p, disabled: newDisabled } : p)),
        );
        toast.success(
          newDisabled === 0
            ? tt("enableParamSuccess") || "启用参数成功"
            : tt("disableParamSuccess") || "禁用参数成功",
        );
      } catch (error: any) {
        console.error("Failed to toggle param:", error);
        toast.error(
          `${tt("toggleParamFailed") || "切换参数状态失败"}: ${error?.message || error?.text || error}`,
        );
      }
    },
    [logId, tt],
  );

  const handleToggleMap = useCallback(
    async (map: LogMap) => {
      try {
        const newDisabled = map.disabled === 0 ? 1 : 0;
        await logsApi.toggleParam(logId, map.id, {
          k: map.k,
          v: map.v,
          realm: map.realm,
        });
        setMapsData((prev) =>
          prev.map((m) => (m.id === map.id ? { ...m, disabled: newDisabled } : m)),
        );
        toast.success(
          newDisabled === 0
            ? tt("enableMapSuccess") || "启用映射成功"
            : tt("disableMapSuccess") || "禁用映射成功",
        );
      } catch (error: any) {
        console.error("Failed to toggle map:", error);
        toast.error(`${tt("toggleMapFailed")}: ${error?.message || error?.text || error}`);
      }
    },
    [logId, tt],
  );

  const handleDeleteParamOrMap = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "param") {
        await logsApi.deleteParam(logId, deleteTarget.item.id);
        setParamsData((prev) => prev.filter((p) => p.id !== deleteTarget.item.id));
        toast.success(tt("deleteParamSuccess"));
      } else {
        await logsApi.deleteParam(logId, deleteTarget.item.id);
        setMapsData((prev) => prev.filter((m) => m.id !== deleteTarget.item.id));
        toast.success(tt("deleteMapSuccess"));
      }
    } catch (error: any) {
      console.error("Failed to delete:", error);
      toast.error(`${tt("deleteFailed")}: ${error?.message || error?.text || error}`);
    } finally {
      setDeleteTarget(null);
      setIsDeleteDialogOpen(false);
    }
  }, [deleteTarget, logId, tt]);

  const handleOpenDeleteDialog = useCallback((type: "param" | "map", item: LogParam | LogMap) => {
    setDeleteTarget({ type, item });
    setIsDeleteDialogOpen(true);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (paramsEditingCell) {
          void handleSaveParamsEdit();
        } else if (mapsEditingCell) {
          void handleSaveMapsEdit();
        }
      } else if (e.key === "Escape") {
        if (paramsEditingCell) {
          setParamsEditingCell(null);
          setParamsEditValue("");
        } else if (mapsEditingCell) {
          setMapsEditingCell(null);
          setMapsEditValue("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paramsEditingCell, mapsEditingCell, handleSaveParamsEdit, handleSaveMapsEdit]);

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("logs")} />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-lg">{ttt("loading") || "加载中..."}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!config) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("logs")} />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-lg">{tt("configNotFound") || "日志配置不存在"}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("logs")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <CommonBreadcrumb
                  items={[
                    { label: t("logs"), href: `/${String(params.locale)}/logs` },
                    { label: config.name, isCurrentPage: true },
                  ]}
                />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">{config.name}</h1>
                    <span className="text-muted-foreground">ID: {config.id}</span>
                  </div>
                  <Button variant="destructive" onClick={() => setIsDeleteConfigDialogOpen(true)}>
                    {tt("delete")}
                  </Button>
                </div>

                <EditableSection
                  title={tt("basicInfo")}
                  defaultValues={{
                    ...config,
                  }}
                  onSave={handleSaveBasicInfo}
                  onCancel={handleCancelBasicInfo}
                >
                  <EditableField
                    label={tt("name")}
                    name="name"
                    value={config.name}
                    type="text"
                    inputPlaceholder={tt("namePlaceholder")}
                  />
                  <EditableField
                    label={tt("description")}
                    name="description"
                    value={config.description || ""}
                    type="textarea"
                    inputPlaceholder={tt("descriptionPlaceholder")}
                  />
                </EditableSection>

                <div className="overflow-hidden rounded-lg border mb-6">
                  <div className="p-4 border-b bg-muted">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{"Param"}</h3>
                      <div className="flex items-center gap-2">
                        {isParamsEditing ? (
                          <Button variant="outline" size="sm" onClick={handleCancelParamsEdit}>
                            <XIcon className="h-4 w-4" />
                            {tt("cancel")}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsParamsEditing(true)}
                          >
                            <Edit2Icon className="h-4 w-4" />
                            {tt("edit")}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCreateParamDialogOpen(true)}
                        >
                          <PlusIcon className="h-4 w-4" />
                          {tt("add")}
                        </Button>
                      </div>
                    </div>
                    {isParamsEditing && (
                      <p className="text-sm text-muted-foreground mt-2">{tt("clickToEdit")}</p>
                    )}
                  </div>
                  <ParamTable
                    data={paramsData}
                    isEditing={isParamsEditing}
                    onEditStart={handleStartParamsEdit}
                    onToggle={(item) => void handleToggleParam(item)}
                    onDelete={(item) => handleOpenDeleteDialog("param", item)}
                    editingCell={paramsEditingCell}
                    editValue={paramsEditValue}
                    onEditValueChange={setParamsEditValue}
                  />
                </div>

                <div className="overflow-hidden rounded-lg border">
                  <div className="p-4 border-b bg-muted">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{"Map"}</h3>
                      <div className="flex items-center gap-2">
                        {isMapsEditing ? (
                          <Button variant="outline" size="sm" onClick={handleCancelMapsEdit}>
                            <XIcon className="h-4 w-4" />
                            {tt("cancel")}
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setIsMapsEditing(true)}>
                            <Edit2Icon className="h-4 w-4" />
                            {tt("edit")}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCreateMapDialogOpen(true)}
                        >
                          <PlusIcon className="h-4 w-4" />
                          {tt("add")}
                        </Button>
                      </div>
                    </div>
                    {isMapsEditing && (
                      <p className="text-sm text-muted-foreground mt-2">{tt("clickToEdit")}</p>
                    )}
                  </div>
                  <ParamTable
                    data={mapsData}
                    isEditing={isMapsEditing}
                    onEditStart={handleStartMapsEdit}
                    onToggle={(item) => void handleToggleMap(item)}
                    onDelete={(item) => handleOpenDeleteDialog("map", item)}
                    editingCell={mapsEditingCell}
                    editValue={mapsEditValue}
                    onEditValueChange={setMapsEditValue}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <DeleteConfirmDialog
        open={isDeleteConfigDialogOpen}
        onOpenChange={setIsDeleteConfigDialogOpen}
        title={tt("deleteConfig")}
        description={
          tt("deleteConfigConfirm", { name: config.name }) || `确定要删除配置 "${config.name}" 吗？`
        }
        onSubmit={handleDeleteConfig}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={tt("delete")}
        description={
          tt("deleteConfirm", { name: deleteTarget?.item.k || "" }) ||
          `确定要删除 "${deleteTarget?.item.k}" 吗？`
        }
        onSubmit={handleDeleteParamOrMap}
      />

      <ParamDialog
        open={isCreateParamDialogOpen}
        onOpenChange={setIsCreateParamDialogOpen}
        onSubmit={(data) => void handleCreateParam(data)}
        title={tt("addParam")}
      />

      <ParamDialog
        open={isCreateMapDialogOpen}
        onOpenChange={setIsCreateMapDialogOpen}
        onSubmit={(data) => void handleCreateMap(data)}
        title={tt("addMap")}
      />
    </SidebarProvider>
  );
}
