"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ListTable } from "@/components/ui/list-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ipBlacklistsApi } from "@/lib/api-client";
import { type IpBlacklist, type ListIpBlacklistsQuery } from "@repo/api-client";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { CreateIpBlackDialog } from "./components/create-black-dialog";
import { createIpBlackColumns } from "./black-columns";
import {
  PlusIcon,
  XIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// 扩展 IpBlacklist 类型，添加解析后的字段
type ParsedIpBlacklist = IpBlacklist & {
  target_name?: string;
  ip_address?: string;
  target_protocol?: string;
  target_port?: string;
  rule_spec?: string;
};

export default function IpBlacklistPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const ti = useTranslations("ipBlacklist");
  const tc = useTranslations("common");

  const [ipBlacklists, setIpBlacklists] = useState<ParsedIpBlacklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ParsedIpBlacklist | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [verifyIp, setVerifyIp] = useState("");
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ ip: string; inBlacklist: boolean } | null>(
    null,
  );

  // 查询黑名单最后更新时间
  const queryBlackListLastUpdateTime = useCallback(async () => {
    try {
      const response = await ipBlacklistsApi.UpdateTime();
      const result = response.data?.data || [];
      const lastTime = result.pop()?.v;
      if (lastTime) {
        setLastUpdateTime(lastTime);
      }
    } catch (error) {
      console.error("Failed to query update time:", error);
    }
  }, []);

  // 加载数据列表
  const loadIpBlacklists = useCallback(
    async (ip?: string) => {
      setIsLoading(true);
      try {
        const queryParams: ListIpBlacklistsQuery = {};
        if (ip) {
          queryParams.ip = ip;
        }

        const response = await ipBlacklistsApi.list(queryParams);
        const responseData = response.data as any;
        const rawData = responseData?.data || [];

        // 解析 iptables 规则数据
        const parsedData = rawData.map((item: any) => {
          let target_name = "";
          let ip_address = "";
          let target_protocol = "all";
          let target_port = "all";

          const singleRuleArr = item.rule_spec?.split(" ") || [];
          for (let index = 0; index < singleRuleArr.length; index++) {
            ip_address = singleRuleArr[2];

            if (singleRuleArr[index] === "--comment") {
              target_name = singleRuleArr[index + 1];
            }

            if (singleRuleArr[index] === "-p") {
              target_protocol = singleRuleArr[index + 1];
            }

            if (singleRuleArr[index] === "--dport") {
              target_port = singleRuleArr[index + 1];
            }
          }

          return {
            ...item,
            target_name,
            ip_address,
            target_protocol,
            target_port,
          };
        });
        setIpBlacklists(parsedData);
      } catch (error) {
        console.error("Failed to load ip blacklists:", error);
        toast.error(tc("loadFailed"));
      } finally {
        setIsLoading(false);
      }
    },
    [tc],
  );

  // 刷新数据（从自动防御系统获取最新数据）
  const handleRefresh = useCallback(async () => {
    try {
      // 调用更新黑名单 API
      await ipBlacklistsApi.refresh();
      toast.success(ti("refreshSuccess"));
      // 重新查询更新时间
      await queryBlackListLastUpdateTime();
    } catch (error) {
      console.error("Failed to refresh ip blacklists:", error);
      toast.error(ti("refreshFailed"));
    }
  }, [queryBlackListLastUpdateTime, ti]);

  // 验证IP是否在黑名单中
  const handleVerify = async () => {
    if (!verifyIp.trim()) {
      toast.error(ti("pleaseEnterIp"));
      return;
    }
    try {
      const response = await ipBlacklistsApi.verify({ query_ip: verifyIp.trim() });
      const ipsetResult = response.data?.data?.[0]?.ipset_result;
      setVerifyResult({
        ip: verifyIp.trim(),
        inBlacklist: !!ipsetResult,
      });
      setIsVerifyDialogOpen(true);
    } catch (error) {
      console.error("Failed to verify ip:", error);
      toast.error(ti("verifyFailed"));
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");

    // 查询最后更新时间
    void queryBlackListLastUpdateTime();
    // 加载数据
    void loadIpBlacklists();
  }, [router, loadIpBlacklists, queryBlackListLastUpdateTime]);

  // 删除数据
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await ipBlacklistsApi.delete({
        target_ip: deleteTarget.ip_address,
        target_name: deleteTarget.target_name,
        target_port: deleteTarget.target_port,
        target_protocol: deleteTarget.target_protocol,
      });
      toast.success(tc("deleteSuccess") || "删除成功");
      await loadIpBlacklists();
    } catch (error) {
      console.error("Failed to delete ip blacklist:", error);
      toast.error(tc("deleteFailed") || "删除失败");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, tc]);

  // 创建数据
  const handleCreate = useCallback(
    async (data: any) => {
      try {
        await ipBlacklistsApi.create(data);
        toast.success(tc("createSuccess"));
        await loadIpBlacklists();
        setIsCreateDialogOpen(false);
      } catch (error) {
        console.error("Failed to create ip blacklist:", error);
        toast.error(tc("createFailed"));
        throw new Error("create failed");
      }
    },
    [loadIpBlacklists, tc],
  );

  // 列配置
  const columns = createIpBlackColumns<ParsedIpBlacklist>({
    ti,
    tc,
    onDelete: (item: ParsedIpBlacklist) => {
      setDeleteTarget(item);
      setIsDeleteDialogOpen(true);
    },
  });

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("ipBlacklist")} />
        <div className="px-4 lg:px-6 py-4 md:py-6 flex flex-col gap-4">
          {/* 标题区域 - 自动防御黑名单数据 */}
          <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShieldAlertIcon className="h-12 w-12 text-primary" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">!</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{ti("title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {ti("description")} <span className="text-primary">{lastUpdateTime}</span>
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => void handleRefresh()}>
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              {ti("refreshData")}
            </Button>
          </div>

          {/* 操作栏 */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div />
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                {ti("addIp")}
              </Button>
              <div className="flex items-center gap-1">
                <Input
                  placeholder={ti("pleaseEnterIp")}
                  value={verifyIp}
                  onChange={(e) => setVerifyIp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleVerify();
                    }
                  }}
                  className="w-48 h-8"
                />
                {verifyIp && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setVerifyIp("")}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="default" size="sm" onClick={() => void handleVerify()}>
                  {ti("verifyBlacklist")}
                </Button>
              </div>
            </div>
          </div>

          {/* 表格 */}
          <ListTable<IpBlacklist>
            columns={columns}
            data={ipBlacklists}
            isLoading={isLoading}
            emptyText={tc("noData") || "暂无数据"}
            loadingText={tc("loading") || "加载中..."}
            translationPrefix="table"
          />
          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title={ti("deleteIpBlacklist")}
            description={tc("DeleteItem", {
              item: deleteTarget?.target_name || deleteTarget?.ip_address || "",
            })}
            onSubmit={handleConfirmDelete}
            deleteText={tc("confirm") || "确定"}
            cancelText={tc("cancel") || "取消"}
            isLoading={isDeleting}
          />

          {/* 新增对话框 */}
          <CreateIpBlackDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSubmit={handleCreate}
          />

          {/* 验证结果对话框 */}
          <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {verifyResult?.inBlacklist ? (
                    <CheckCircle2Icon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                  {ti("verifyBlacklist")}
                </DialogTitle>
                <DialogDescription>
                  {verifyResult && (
                    <>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          verifyResult.inBlacklist
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {verifyResult.inBlacklist
                          ? ti("ipInBlacklist", { ip: verifyResult.ip })
                          : ti("ipNotInBlacklist", { ip: verifyResult.ip })}
                      </span>
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setIsVerifyDialogOpen(false)}>
                  {tc("confirm") || "确定"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
