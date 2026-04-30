"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { toast } from "sonner";
import { Link } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";

import { logsApi, type LogConfig, type LogSetting } from "@/lib/api-client";
import { CreateLogConfigDialog } from "./components/create-log-config-dialog";
import { CreateLogSettingDialog } from "./components/create-log-setting-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

export default function LogsPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("logs");
  const ttt = useTranslations("common");

  const [configs, setConfigs] = useState<LogConfig[]>([]);
  const [settings, setSettings] = useState<LogSetting[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateSettingDialogOpen, setIsCreateSettingDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LogConfig | null>(null);
  const [isDeleteSettingDialogOpen, setIsDeleteSettingDialogOpen] = useState(false);
  const [deleteSettingTarget, setDeleteSettingTarget] = useState<LogSetting | null>(null);
  const [quickDeleteMode, setQuickDeleteMode] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [settingsEditing, setSettingsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ id: number; field: "k" | "v" } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");

  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await logsApi.listConfigs();
      console.log("Configs response:", response.data);
      setConfigs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load log configs:", error);
      toast.error(tt("failedToLoadConfigs") || "加载日志配置失败");
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, [tt]);

  const loadSettings = useCallback(async () => {
    try {
      const response = await logsApi.listSettings();
      console.log("Settings response:", response.data);
      setSettings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load log settings:", error);
      toast.error(tt("failedToLoadSettings") || "加载日志设置失败");
      setSettings([]);
    }
  }, [tt]);

  const handleCreateConfig = useCallback(
    async (data: { name: string; description?: string }) => {
      try {
        await logsApi.createConfig(data);
        toast.success(tt("createConfigSuccess") || "创建日志配置成功");
        await loadConfigs();
        setIsCreateDialogOpen(false);
      } catch (error: any) {
        console.error("Failed to create log config:", error);
        toast.error(
          `${tt("createConfigFailed") || "创建日志配置失败"}: ${error?.message || error?.text || error}`,
        );
      }
    },
    [loadConfigs, tt],
  );

  const handleDeleteConfig = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      await logsApi.deleteConfig(deleteTarget.id);
      toast.success(tt("deleteConfigSuccess") || "删除日志配置成功");
      await loadConfigs();
    } catch (error: any) {
      console.error("Failed to delete log config:", error);
      toast.error(
        `${tt("deleteConfigFailed") || "删除日志配置失败"}: ${error?.message || error?.text || error}`,
      );
    } finally {
      setDeleteTarget(null);
      setIsDeleteDialogOpen(false);
    }
  }, [deleteTarget, loadConfigs, tt]);

  const handleToggleConfig = useCallback(
    async (config: LogConfig) => {
      try {
        const newDisabled = config.disabled === 0 ? 1 : 0;
        await logsApi.toggleConfig(config.id, newDisabled);
        setConfigs((prev) =>
          prev.map((c) => (c.id === config.id ? { ...c, disabled: newDisabled } : c)),
        );
        toast.success(
          newDisabled === 0
            ? tt("enableConfigSuccess") || "启用日志配置成功"
            : tt("disableConfigSuccess") || "禁用日志配置成功",
        );
      } catch (error: any) {
        console.error("Failed to toggle log config:", error);
        toast.error(
          `${tt("toggleConfigFailed") || "切换日志配置状态失败"}: ${error?.message || error?.text || error}`,
        );
      }
    },
    [tt],
  );

  const handleCreateSetting = useCallback(
    async (data: { k: string; v: string }) => {
      try {
        await logsApi.createSetting({ ...data, realm: "UNIMRCP-SETTINGS" });
        toast.success(tt("createSettingSuccess") || "添加设置成功");
        await loadSettings();
        setIsCreateSettingDialogOpen(false);
      } catch (error: any) {
        console.error("Failed to create log setting:", error);
        toast.error(
          `${tt("createSettingFailed") || "添加设置失败"}: ${error?.message || error?.text || error}`,
        );
      }
    },
    [loadSettings, tt],
  );

  const handleDeleteSetting = useCallback(async () => {
    if (!deleteSettingTarget) return;

    try {
      await logsApi.deleteSetting(deleteSettingTarget.id);
      toast.success(tt("deleteSettingSuccess") || "删除设置成功");
      setSettings((prev) => prev.filter((s) => s.id !== deleteSettingTarget.id));
    } catch (error: any) {
      console.error("Failed to delete log setting:", error);
      toast.error(
        `${tt("deleteSettingFailed") || "删除设置失败"}: ${error?.message || error?.text || error}`,
      );
    } finally {
      setDeleteSettingTarget(null);
      setIsDeleteSettingDialogOpen(false);
    }
  }, [deleteSettingTarget, tt]);

  const handleToggleSetting = useCallback(
    async (setting: LogSetting) => {
      try {
        const newDisabled = setting.disabled === 0 ? 1 : 0;
        await logsApi.updateSetting(setting.id, { action: "toggle" });
        setSettings((prev) =>
          prev.map((s) => (s.id === setting.id ? { ...s, disabled: newDisabled } : s)),
        );
        toast.success(
          newDisabled === 0
            ? tt("enableSettingSuccess") || "启用设置成功"
            : tt("disableSettingSuccess") || "禁用设置成功",
        );
      } catch (error: any) {
        console.error("Failed to toggle log setting:", error);
        toast.error(
          `${tt("toggleSettingFailed") || "切换设置状态失败"}: ${error?.message || error?.text || error}`,
        );
      }
    },
    [tt],
  );

  const handleStartEdit = useCallback((setting: LogSetting, field: "k" | "v") => {
    setEditingCell({ id: setting.id, field });
    setEditValue(field === "k" ? setting.k : setting.v);
    setOriginalValue(field === "k" ? setting.k : setting.v);
    setSettingsEditing(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingCell || editValue === originalValue) {
      setEditingCell(null);
      setEditValue("");
      setOriginalValue("");
      return;
    }

    try {
      await logsApi.updateSetting(editingCell.id, { [editingCell.field]: editValue });
      setSettings((prev) =>
        prev.map((s) => (s.id === editingCell.id ? { ...s, [editingCell.field]: editValue } : s)),
      );
      toast.success(tt("saveSuccess") || "保存成功");
    } catch (error: any) {
      console.error("Failed to update log setting:", error);
      toast.error(`${tt("saveFailed") || "保存失败"}: ${error?.message || error?.text || error}`);
    } finally {
      setEditingCell(null);
      setEditValue("");
      setOriginalValue("");
    }
  }, [editingCell, editValue, originalValue, tt]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue("");
    setOriginalValue("");
    setSettingsEditing(false);
  }, []);

  const handleDownloadLogs = useCallback(async () => {
    try {
      const response = await logsApi.downloadLogs();
      window.open(response.data.url, "_blank");
      toast.success(tt("downloadLogsSuccess") || "下载日志成功");
    } catch (error: any) {
      console.error("Failed to download logs:", error);
      toast.error(
        `${tt("downloadLogsFailed") || "下载日志失败"}: ${error?.message || error?.text || error}`,
      );
    }
  }, [tt]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadConfigs();
    void loadSettings();
  }, [router, loadConfigs, loadSettings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && editingCell) {
        void handleSaveEdit();
      } else if (e.key === "Escape") {
        handleCancelEdit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingCell, handleSaveEdit, handleCancelEdit]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("logs")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                      {tt("new") || "新建"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void handleDownloadLogs()}>
                      {tt("downloadLogs") || "下载日志"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="quick-delete" className="text-sm font-medium">
                      {tt("quickDeleteMode") || "快速删除模式"}
                    </Label>
                    <Switch
                      id="quick-delete"
                      checked={quickDeleteMode}
                      onCheckedChange={setQuickDeleteMode}
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                      <TableRow>
                        <TableHead>{tt("id") || "ID"}</TableHead>
                        <TableHead>{tt("name") || "名称"}</TableHead>
                        <TableHead>{tt("description") || "描述"}</TableHead>
                        <TableHead>{tt("enableLog") || "启用/禁用日志"}</TableHead>
                        <TableHead>{tt("actions") || "操作"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configs.length > 0 ? (
                        configs.map((config) => (
                          <TableRow key={config.id}>
                            <TableCell className="font-medium">{config.id}</TableCell>
                            <TableCell>{config.name}</TableCell>
                            <TableCell>{config.description || "-"}</TableCell>
                            <TableCell>
                              <Button
                                variant={config.disabled === 0 ? "default" : "outline"}
                                size="sm"
                                onClick={() => void handleToggleConfig(config)}
                              >
                                {config.disabled === 0 ? ttt("yes") || "是" : ttt("no") || "否"}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                                    size="icon"
                                  >
                                    <EllipsisVerticalIcon />
                                    <span className="sr-only">{tt("actions")}</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const locale = document.documentElement.lang || "zh";
                                      window.location.href = `/${locale}/logs/${config.id}`;
                                    }}
                                  >
                                    {ttt("Details")}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => {
                                      setDeleteTarget(config);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    {tt("delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            {loading
                              ? ttt("loading") || "加载中..."
                              : tt("noConfigs") || "暂无日志配置"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 overflow-hidden rounded-lg border">
                  <div
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                    onClick={() => setSettingsExpanded(!settingsExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tt("settings") || "设置"}</span>
                      {settingsExpanded ? (
                        <span className="text-sm text-muted-foreground">
                          {tt("collapse") || "收起"}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {tt("expand") || "展开"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {settingsEditing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                        >
                          {tt("cancel")}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSettingsEditing(true);
                          }}
                        >
                          {tt("edit")}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCreateSettingDialogOpen(true);
                        }}
                      >
                        {tt("add")}
                      </Button>
                    </div>
                  </div>

                  {settingsExpanded && (
                    <div className="border-t">
                      <div className="px-4 py-2 bg-muted/30 text-sm text-muted-foreground">
                        {settingsEditing &&
                          (tt("clickToEdit") ||
                            "点击灰色区域可进行编辑, Enter后直接保存, 点击其它区域或取消按钮取消修改")}
                      </div>
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>{tt("name")}</TableHead>
                            <TableHead>{tt("value")}</TableHead>
                            <TableHead>{tt("enabled")}</TableHead>
                            <TableHead>{tt("delete")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {settings.length > 0 ? (
                            settings.map((setting) => (
                              <TableRow key={setting.id}>
                                <TableCell className="font-medium">{setting.k}</TableCell>
                                <TableCell>
                                  {editingCell?.id === setting.id && editingCell?.field === "v" ? (
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="w-full px-2 py-1 bg-muted rounded border border-input"
                                      autoFocus
                                    />
                                  ) : settingsEditing ? (
                                    <span
                                      className="cursor-pointer bg-muted px-2 py-1 rounded hover:bg-muted/80"
                                      onClick={() => handleStartEdit(setting, "v")}
                                    >
                                      {setting.v}
                                    </span>
                                  ) : (
                                    <span>{setting.v}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant={setting.disabled === 0 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => void handleToggleSetting(setting)}
                                  >
                                    {setting.disabled === 0
                                      ? ttt("yes") || "是"
                                      : ttt("no") || "否"}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => {
                                      setDeleteSettingTarget(setting);
                                      setIsDeleteSettingDialogOpen(true);
                                    }}
                                  >
                                    {tt("delete")}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="h-16 text-center">
                                {tt("noSettings")}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <CreateLogConfigDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => void handleCreateConfig(data)}
      />

      <CreateLogSettingDialog
        open={isCreateSettingDialogOpen}
        onOpenChange={setIsCreateSettingDialogOpen}
        onSubmit={(data) => void handleCreateSetting(data)}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={tt("deleteConfig") || "删除日志配置"}
        description={
          tt("deleteConfigConfirm", { name: deleteTarget?.name || "" }) ||
          `确定要删除配置 "${deleteTarget?.name}" 吗？`
        }
        onSubmit={handleDeleteConfig}
      />

      <DeleteConfirmDialog
        open={isDeleteSettingDialogOpen}
        onOpenChange={setIsDeleteSettingDialogOpen}
        title={tt("deleteSetting") || "删除设置"}
        description={
          tt("deleteSettingConfirm", { name: deleteSettingTarget?.k || "" }) ||
          `确定要删除设置 "${deleteSettingTarget?.k}" 吗？`
        }
        onSubmit={handleDeleteSetting}
      />
    </SidebarProvider>
  );
}
