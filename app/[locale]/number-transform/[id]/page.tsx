"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  numberTransformApi,
  type NumberTransform,
  type NumberTransformItem,
} from "@/lib/api-client";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { EditableTable } from "@/components/xtools";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function NumberTransformDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string; locale: string }>();
  const transformId = params.id;
  const t = useTranslations("numberTransform");
  const tt = useTranslations("pages");
  const ttt = useTranslations("common");

  const [transform, setTransform] = useState<NumberTransform | null>(null);
  const [numberItems, setNumberItems] = useState<NumberTransformItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({ original_number: "", nts_number: "" });
  const [importText, setImportText] = useState("");

  const loadTransform = useCallback(async () => {
    try {
      setLoading(true);
      const response = await numberTransformApi.getById(parseInt(transformId, 10));
      const data = response.data;
      console.log("Number transform data:", data);

      // 从number_translation_info中获取第一个元素作为变换规则信息
      if (data.number_translation_info && data.number_translation_info.length > 0) {
        setTransform(data.number_translation_info[0] || []);
      }

      // 设置号码列表数据 - nts_numbers是一个对象，包含data数组
      const numbers = data.nts_numbers?.data || [];
      setNumberItems(numbers);
    } catch (error) {
      console.error("Failed to load number transform:", error);
      toast.error(ttt("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [transformId, ttt]);

  useEffect(() => {
    void loadTransform();
  }, [loadTransform]);

  const handleSave = async (formData: any) => {
    try {
      setLoading(true);

      await numberTransformApi.update(parseInt(transformId, 10), formData);

      toast.success(ttt("saveSuccess"));
      await loadTransform();
      return true;
    } catch (error: any) {
      console.error("Failed to update number transform:", error);
      toast.error(`${ttt("saveFailed")}: ${error?.message || error?.text || error}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("取消编辑");
  };

  // 处理添加号码
  const handleAddNumber = async () => {
    if (!addFormData.original_number || !addFormData.nts_number) {
      toast.error(ttt("pleaseFillRequiredFields"));
      return;
    }
    try {
      setLoading(true);
      await numberTransformApi.createNumber(parseInt(transformId, 10), {
        original_number: addFormData.original_number,
        nts_number: addFormData.nts_number,
      });
      toast.success(ttt("addSuccess"));
      setAddDialogOpen(false);
      setAddFormData({ original_number: "", nts_number: "" });
      await loadTransform();
    } catch (error: any) {
      console.error("Failed to add number:", error);
      toast.error(`${ttt("addFailed")}: ${error?.message || error?.text || error}`);
    } finally {
      setLoading(false);
    }
  };

  // 处理导入号码
  const handleImportNumbers = async () => {
    if (!importText.trim()) {
      toast.error(ttt("pleaseFillRequiredFields"));
      return;
    }
    try {
      setLoading(true);
      // 解析导入文本，每行格式：原始号码\t新号码
      const lines = importText.split(/\r?\n/);
      const numbers: { original_number: string; nts_number: string }[] = [];
      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          numbers.push({ original_number: parts[0], nts_number: parts[1] });
        }
      }
      if (numbers.length === 0) {
        toast.error(ttt("importFormatError"));
        return;
      }
      await numberTransformApi.importNumbers(parseInt(transformId, 10), numbers);
      toast.success(ttt("importSuccess"));
      setImportDialogOpen(false);
      setImportText("");
      await loadTransform();
    } catch (error: any) {
      console.error("Failed to import numbers:", error);
      toast.error(`${ttt("importFailed")}: ${error?.message || error?.text || error}`);
    } finally {
      setLoading(false);
    }
  };

  // 打开添加弹窗
  const openAddDialog = () => {
    setAddFormData({ original_number: "", nts_number: "" });
    setAddDialogOpen(true);
  };

  // 打开导入弹窗
  const openImportDialog = () => {
    setImportText("");
    setImportDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await numberTransformApi.delete(parseInt(transformId, 10));
      toast.success(ttt("deleteSuccess"));
      router.push(`/${params.locale}/number-transform`);
    } catch (error: any) {
      console.error("Failed to delete number transform:", error);
      toast.error(`${ttt("deleteFailed")}: ${error?.message || error?.text || error}`);
    } finally {
      setLoading(false);
    }
  };

  // 处理号码列表保存
  const handleNumberSave = async (record: NumberTransformItem) => {
    try {
      setLoading(true);
      await numberTransformApi.updateNumber(parseInt(transformId, 10), record.id || 0, {
        original_number: record.original_number,
        nts_number: record.nts_number,
      });
      toast.success(ttt("saveSuccess"));
      await loadTransform();
    } catch (error: any) {
      console.error("Failed to save number:", error);
      toast.error(`${ttt("saveFailed")}: ${error?.message || error?.text || error}`);
    } finally {
      setLoading(false);
    }
  };

  // 处理号码列表删除
  const handleNumberDelete = async (record: NumberTransformItem) => {
    try {
      setLoading(true);
      await numberTransformApi.deleteNumber(parseInt(transformId, 10), record.id || 0);
      toast.success(ttt("deleteSuccess"));
      await loadTransform();
    } catch (error: any) {
      console.error("Failed to delete number:", error);
      toast.error(`${ttt("deleteFailed")}: ${error?.message || error?.text || error}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !transform) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={tt("numberTransform")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">加载中...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!transform) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={tt("numberTransform")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">号码变换规则不存在</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={tt("numberTransform")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <CommonBreadcrumb
                  items={[
                    { label: tt("numberTransform"), href: `/${params.locale}/number-transform` },
                    { label: transform.name, isCurrentPage: true },
                  ]}
                />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">{transform.name}</h1>
                  </div>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    {ttt("delete")}
                  </Button>
                </div>

                <EditableSection
                  title={t("ruleDetails")}
                  defaultValues={{
                    ...transform,
                  }}
                  onSave={handleSave}
                  onCancel={handleCancel}
                >
                  <EditableField
                    label={t("name")}
                    name="name"
                    value={transform.name}
                    type="text"
                    inputPlaceholder={t("name")}
                    required
                  />
                  <EditableField
                    label={t("tableType")}
                    name="type"
                    value={transform.type}
                    type="select"
                    options={[
                      { value: "exact", label: t("exactMatch") },
                      { value: "prefix", label: t("prefixMatch") },
                    ]}
                    required
                  />
                  <EditableField
                    label={t("description")}
                    name="description"
                    value={transform.description || ""}
                    type="textarea"
                    inputPlaceholder={t("description")}
                    className="md:col-span-2"
                  />
                </EditableSection>

                {/* 号码列表部分 */}
                <div className="mt-8">
                  <EditableTable
                    data={numberItems}
                    columns={[
                      {
                        title: t("originalNumber"),
                        dataIndex: "original_number",
                        editable: true,
                      },
                      {
                        title: t("newNumber"),
                        dataIndex: "nts_number",
                        editable: true,
                      },
                    ]}
                    onSave={() => void handleNumberSave}
                    onDelete={() => void handleNumberDelete}
                    onAdd={openAddDialog}
                    onImport={openImportDialog}
                    title={t("numberList")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("deleteRule")}
        description={
          t("deleteItem", { item: transform.name }) || `确定要删除规则 ${transform.name} 吗？`
        }
        onSubmit={handleDelete}
        deleteText={ttt("confirm")}
        cancelText={ttt("cancel")}
        isLoading={loading}
      />

      {/* 添加号码对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("addNumber")}</DialogTitle>
            <DialogDescription>{t("addNumberDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="original_number" className="text-right">
                {t("originalNumber")} *
              </Label>
              <Input
                id="original_number"
                value={addFormData.original_number}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, original_number: e.target.value })
                }
                className="col-span-3"
                placeholder={t("originalNumber")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nts_number" className="text-right">
                {t("newNumber")} *
              </Label>
              <Input
                id="nts_number"
                value={addFormData.nts_number}
                onChange={(e) => setAddFormData({ ...addFormData, nts_number: e.target.value })}
                className="col-span-3"
                placeholder={t("newNumber")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              {ttt("cancel")}
            </Button>
            <Button onClick={() => void handleAddNumber} disabled={loading}>
              {loading ? ttt("submitting") || "提交中..." : ttt("submit") || "提交"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入号码对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{t("importNumbers")}</DialogTitle>
            <DialogDescription>{t("importNumbersDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={t("importPlaceholder")}
              rows={8}
              className="font-mono text-sm"
            />
            <div className="text-sm text-muted-foreground">{t("importFormatNote")}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              {ttt("cancel") || "取消"}
            </Button>
            <Button onClick={() => void handleImportNumbers} disabled={loading}>
              {loading ? ttt("submitting") || "提交中..." : ttt("submit") || "提交"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
