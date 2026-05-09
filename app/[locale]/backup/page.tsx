"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";
import { backupApi, type SchemaItem } from "@/lib/api-client";

export default function BackupPage() {
  const t = useTranslations("pages");
  const tb = useTranslations("backup");
  const ttt = useTranslations("common");

  const [currentLocale, setCurrentLocale] = useState("zh");
  const [cdrBackup, setCdrBackup] = useState(true);
  const [databaseBackupLoading, setDatabaseBackupLoading] = useState(false);

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupFiles, setBackupFiles] = useState<SchemaItem[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string>("");
  const [backupFileLoading, setBackupFileLoading] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setCurrentLocale(document.documentElement.lang || "zh");
    }
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      window.location.href = "/login";
    }
  }, []);

  const handleCdrBackupChange = useCallback((checked: boolean) => {
    setCdrBackup(Boolean(checked));
  }, []);

  const handleDatabaseBackup = useCallback(async () => {
    setDatabaseBackupLoading(true);

    try {
      const res = await backupApi.backupSchema({ cdr_backup: cdrBackup });
      console.log("BackupSchema response:", res);
      if (res?.data?.code === 200) {
        toast.success(tb("backupSuccess") || "备份成功，可在媒体文件中下载", {
          duration: 5000,
        });
      } else {
        toast.error(tb("backupFail") + (res?.data?.message || ""), {
          duration: 5000,
        });
      }
    } catch (err: any) {
      toast.error(tb("backupFail") + (err?.message || ""), {
        duration: 5000,
      });
    } finally {
      setDatabaseBackupLoading(false);
    }
  }, [cdrBackup, tb]);

  const handleBackupFile = useCallback(async () => {
    try {
      const res = await backupApi.getSchemas();
      const formattedData = res?.data?.map((value, index) => ({ id: index, name: value }));
      setBackupFiles(formattedData || []);
      setShowBackupModal(true);
    } catch (err) {
      console.error("BackupFile error:", err);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedSchema) return;

    setBackupFileLoading(true);

    try {
      const res = await backupApi.switchSchema({ schema_name: selectedSchema });
      if (res?.data?.code === 200) {
        setShowBackupModal(false);
        setSelectedSchema("");
        toast.success(tb("restoreSuccess") || "还原成功");
      }
    } catch (err: any) {
      toast.error((tb("restoreFail") || "还原失败") + (err?.message || ""));
    } finally {
      setBackupFileLoading(false);
    }
  }, [selectedSchema, tb]);

  const handleCancelModal = useCallback(() => {
    setShowBackupModal(false);
    setSelectedSchema("");
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("backup")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <CommonBreadcrumb
                  items={[
                    { label: t("maintenance"), href: `/${currentLocale}/dashboard` },
                    { label: t("backup"), isCurrentPage: true },
                  ]}
                />
              </div>

              <div className="px-4 lg:px-6">
                <div className="space-y-4">
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-semibold mb-1">
                            {tb("databaseBackup")}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {tb("databaseBackupDescription")}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">{tb("includeCdrs")}</Label>
                            <Switch checked={cdrBackup} onCheckedChange={handleCdrBackupChange} />
                          </div>
                          <Button
                            onClick={void handleDatabaseBackup}
                            disabled={databaseBackupLoading}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            {databaseBackupLoading && (
                              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {tb("startBackup")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-semibold mb-1">
                            {tb("databaseRestore")}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {tb("databaseRestoreDescription")}
                          </CardDescription>
                        </div>
                        <Button onClick={void handleBackupFile} variant="outline">
                          {tb("selectBackupFile")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <Dialog open={showBackupModal} onOpenChange={setShowBackupModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{tb("selectBackupFile")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {backupFiles.length > 0 ? (
              <RadioGroup value={selectedSchema} onValueChange={setSelectedSchema}>
                <div className="space-y-2">
                  {backupFiles.map((file) => (
                    <div key={file.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={file.name || ""} id={file.name || ""} />
                      <Label htmlFor={file.name} className="cursor-pointer">
                        {file.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                {tb("noBackupFiles") || "暂无备份文件"}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelModal}>
              {ttt("cancel")}
            </Button>
            <Button onClick={void handleConfirm} disabled={!selectedSchema || backupFileLoading}>
              {backupFileLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
              {ttt("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
