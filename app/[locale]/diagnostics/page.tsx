"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { diagnosticsApi, mediaFilesApi } from "@/lib/api-client";
import type { MediaFile } from "@/lib/api-client";

interface TestResult {
  type: string;
  target: string;
  result: string;
  timestamp: string;
  details: string;
}

interface CaptureFormData {
  src_ip?: string;
  dst_ip?: string;
  src_port?: string;
  dst_port?: string;
  proto?: string;
}

export default function DiagnosticsPage() {
  const t = useTranslations("pages");
  const td = useTranslations("diagnostics");
  const ttt = useTranslations("common");

  const [pid, setPid] = useState("");
  const [pingLoading, setPingLoading] = useState(false);
  const [pingData, setPingData] = useState("");
  const [pingFormData, setPingFormData] = useState({ ip: "", port: "", nic: "" });

  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);
  const [captureFormData, setCaptureFormData] = useState<CaptureFormData>({
    src_ip: "",
    dst_ip: "",
    src_port: "",
    dst_port: "",
    proto: "",
  });
  const [mfile, setMfile] = useState<MediaFile | null>(null);

  const handlePingSubmit = useCallback(async () => {
    if (!pingFormData.ip) {
      toast.error(td("pleaseEnterIP") || "请输入IP地址");
      return;
    }

    setPingLoading(true);

    try {
      const requestData = {
        ip: pingFormData.ip,
        ...(pingFormData.port && { port: pingFormData.port }),
        ...(pingFormData.nic && { nic: pingFormData.nic }),
      };

      const res = await diagnosticsApi.ping(requestData);
      console.log("Ping response:", res);
      if (res?.data?.code === 200) {
        setPingData(res?.data?.data || "");
        toast.success(ttt("submitSuccess") || "提交成功");
      } else {
        toast.error(td("pingFailed") || "PING失败");
      }
    } catch (error) {
      console.error("Ping error:", error);
      toast.error(td("pingFailed") || "PING失败");
    } finally {
      setPingLoading(false);
    }
  }, [pingFormData, td, ttt]);

  const handleCaptureAll = useCallback(async () => {
    try {
      const res = await diagnosticsApi.capture({});
      console.log("Capture response:", res);
      if (res?.data?.code === 200) {
        const pidValue = res.data.data || "";
        setPid(pidValue);
        localStorage.setItem("xui.pid", pidValue);

        if (pidValue) {
          try {
            const mediaFile = await mediaFilesApi.getById(pidValue);
            setMfile(mediaFile.data);
          } catch (mediaError) {
            console.error("Failed to fetch media file:", mediaError);
          }
        }

        toast.success(ttt("submitSuccess") || "提交成功");
      }
    } catch (error) {
      console.error("Capture error:", error);
      toast.error(td("startFailed") || "启动失败");
    }
  }, [td, ttt]);

  const handleAssignCapture = useCallback(async () => {
    const data = { ...captureFormData };

    if (!data.proto) delete data.proto;
    if (!data.dst_ip) delete data.dst_ip;
    if (!data.src_ip) delete data.src_ip;
    if (!data.dst_port) delete data.dst_port;
    if (!data.src_port) delete data.src_port;

    try {
      const res = await diagnosticsApi.capture(data);
      console.log("Capture response:", res);
      if (res?.data?.code === 200) {
        const pidValue = res.data.data || "";
        setPid(pidValue);
        localStorage.setItem("xui.pid", pidValue);

        if (pidValue) {
          try {
            const mediaFile = await mediaFilesApi.getById(pidValue);
            setMfile(mediaFile.data);
          } catch (mediaError) {
            console.error("Failed to fetch media file:", mediaError);
          }
        }

        setCaptureDialogOpen(false);
        setCaptureFormData({ src_ip: "", dst_ip: "", src_port: "", dst_port: "", proto: "" });
        toast.success(ttt("submitSuccess") || "提交成功");
      }
    } catch (error) {
      console.error("Capture error:", error);
      toast.error(td("startFailed") || "启动失败");
    }
  }, [captureFormData, td, ttt]);

  const handleStopDownload = useCallback(async () => {
    if (!pid) return;

    try {
      await diagnosticsApi.stopCapture({ pid });
      setPid("");
      localStorage.setItem("xui.pid", "");

      if (mfile && mfile.created_at) {
        const date = new Date(mfile.created_at);
        const formattedDate = date.toISOString().replace(/[:.]/g, "-").substring(0, 19);

        let file_name = mfile.name || "";
        const ext = mfile.ext || "pcap";

        if (!file_name.endsWith(ext)) {
          file_name += "." + ext;
        }

        const src = `/api/media_files/${mfile.id}.${ext}`;
        const lang = localStorage.getItem("xui.lang");
        let downloadUrl = src;
        if (lang) {
          downloadUrl += `?language=${lang}`;
        }

        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = `${formattedDate}-${file_name}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }

      toast.info(td("downloadStarted") || "下载已开始，请耐心等待");
    } catch (error) {
      console.error("Stop download error:", error);
      toast.error(td("operationFailed") || "操作失败");
    }
  }, [pid, td, mfile]);

  useEffect(() => {
    const storedPid = localStorage.getItem("xui.pid");
    if (storedPid) {
      setPid(storedPid);
    }
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      window.location.href = "/login";
    }
  }, []);

  const [currentLocale, setCurrentLocale] = useState("zh");

  useEffect(() => {
    if (typeof document !== "undefined") {
      setCurrentLocale(document.documentElement.lang || "zh");
    }
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("diagnostics")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <CommonBreadcrumb
                  items={[
                    { label: t("maintenance") || "维护", href: `/${currentLocale}/dashboard` },
                    { label: t("diagnostics"), isCurrentPage: true },
                  ]}
                />
              </div>

              <div className="px-4 lg:px-6">
                <Card className="mb-6">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {td("networkPacketCapture")}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {td("descriptionOfNetworkPacketCapture")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCaptureDialogOpen(true)}
                        disabled={!!pid}
                      >
                        {td("capture")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={void handleCaptureAll}
                        disabled={!!pid}
                      >
                        {td("captureAll")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={void handleStopDownload}
                        disabled={!pid}
                        className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                      >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        {td("stopAndDownload")}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">{td("ipPing")}</CardTitle>
                    <CardDescription className="text-xs">{td("currentPingValue")}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 items-center gap-x-4">
                        <Label className="col-span-5 text-right">
                          <span className="text-red-500 mr-1">*</span>
                          {td("ip")}
                        </Label>
                        <Input
                          className="col-span-7"
                          value={pingFormData.ip}
                          onChange={(e) => setPingFormData({ ...pingFormData, ip: e.target.value })}
                          placeholder={td("enterIP")}
                        />
                      </div>
                      <div className="grid grid-cols-12 items-center gap-x-4">
                        <Label className="col-span-5 text-right">{td("port")}</Label>
                        <Input
                          className="col-span-7"
                          value={pingFormData.port}
                          onChange={(e) =>
                            setPingFormData({ ...pingFormData, port: e.target.value })
                          }
                          placeholder={td("enterPort")}
                        />
                      </div>
                      <div className="grid grid-cols-12 items-center gap-x-4">
                        <Label className="col-span-5 text-right">{td("networkCard")}</Label>
                        <Input
                          className="col-span-7"
                          value={pingFormData.nic}
                          onChange={(e) =>
                            setPingFormData({ ...pingFormData, nic: e.target.value })
                          }
                          placeholder={td("enterNetworkCard")}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={void handlePingSubmit}
                          disabled={pingLoading}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          {pingLoading ? (
                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {ttt("submit")}
                        </Button>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      {pingLoading ? (
                        <div className="flex flex-col items-center justify-center h-40">
                          <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">{td("acquiring")}</p>
                        </div>
                      ) : (
                        <pre className="bg-muted p-4 rounded-lg max-h-64 overflow-auto text-sm font-mono">
                          {pingData || td("noPingResults")}
                        </pre>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <Dialog open={captureDialogOpen} onOpenChange={setCaptureDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{td("capture")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-12 items-center gap-x-4">
              <Label className="col-span-5 text-right">{td("sourceIP")}</Label>
              <Input
                className="col-span-7"
                value={captureFormData.src_ip}
                onChange={(e) => setCaptureFormData({ ...captureFormData, src_ip: e.target.value })}
                placeholder={td("enterSourceIP")}
              />
            </div>
            <div className="grid grid-cols-12 items-center gap-x-4">
              <Label className="col-span-5 text-right">{td("destinationIP")}</Label>
              <Input
                className="col-span-7"
                value={captureFormData.dst_ip}
                onChange={(e) => setCaptureFormData({ ...captureFormData, dst_ip: e.target.value })}
                placeholder={td("enterDestinationIP")}
              />
            </div>
            <div className="grid grid-cols-12 items-center gap-x-4">
              <Label className="col-span-5 text-right">{td("sourcePort")}</Label>
              <Input
                className="col-span-7"
                value={captureFormData.src_port}
                onChange={(e) =>
                  setCaptureFormData({ ...captureFormData, src_port: e.target.value })
                }
                placeholder={td("enterSourcePort")}
              />
            </div>
            <div className="grid grid-cols-12 items-center gap-x-4">
              <Label className="col-span-5 text-right">{td("destinationPort")}</Label>
              <Input
                className="col-span-7"
                value={captureFormData.dst_port}
                onChange={(e) =>
                  setCaptureFormData({ ...captureFormData, dst_port: e.target.value })
                }
                placeholder={td("enterDestinationPort")}
              />
            </div>
            <div className="grid grid-cols-12 items-center gap-x-4">
              <Label className="col-span-5 text-right">{td("protocol")}</Label>
              <Input
                className="col-span-7"
                value={captureFormData.proto}
                onChange={(e) => setCaptureFormData({ ...captureFormData, proto: e.target.value })}
                placeholder={td("enterProtocol")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCaptureDialogOpen(false)}>
              {ttt("cancel")}
            </Button>
            <Button onClick={void handleAssignCapture}>{ttt("submit")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
