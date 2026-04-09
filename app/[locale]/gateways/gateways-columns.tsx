"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { Gateway } from "@repo/api-client";
import { gatewaysApi } from "@/lib/api-client";
import { useRouter } from "@/navigation";

interface TranslationFunctions {
  t: (key: string, params?: Record<string, any>) => string;
  tt: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, params?: Record<string, any>) => string;
}

export function createGatewaysColumns({
  t,
  tt,
  tc,
  onRefresh,
  router,
  onHandleDelete,
}: TranslationFunctions & { onRefresh?: () => Promise<void> } & {
  router: ReturnType<typeof useRouter>;
  onHandleDelete: (gateway: Gateway) => void;
}): ColumnDef<Gateway>[] {
  const handleToggleEnabled = async (gateway: Gateway) => {
    try {
      const newStatus = gateway.disabled === "0" ? "1" : "0";
      await gatewaysApi.upDisabled(gateway.id, { disabled: Number(newStatus) });
      toast.success(
        newStatus === "0"
          ? tt("enableSuccess") || "网关已启用"
          : tt("disableSuccess") || "网关已禁用",
      );
      // 刷新列表
      await onRefresh?.();
    } catch (error) {
      console.error("Failed to update gateway status:", error);
      toast.error(
        gateway.disabled === "0"
          ? tt("enableFailed") || "启用网关失败"
          : tt("disableFailed") || "禁用网关失败",
      );
    }
  };

  const handleGatewayAction = async (gwname: string, action: string) => {
    try {
      await gatewaysApi.upGateways({ gwname, action });
      const actionLabels: Record<string, string> = {
        reg: tt("regSuccess") || "注册成功",
        unreg: tt("unregSuccess") || "注销成功",
        start: tt("startSuccess") || "启动成功",
        stop: tt("stopSuccess") || "停止成功",
      };
      toast.success(actionLabels[action]);
      await onRefresh?.();
    } catch (error) {
      console.error(`Failed to ${action} gateway:`, error);
      const failLabels: Record<string, string> = {
        reg: tt("regFailed") || "注册失败",
        unreg: tt("unregFailed") || "注销失败",
        start: tt("startFailed") || "启动失败",
        stop: tt("stopFailed") || "停止失败",
      };
      toast.error(failLabels[action]);
    }
  };

  return [
    {
      accessorKey: "name",
      header: () => t("name"),
      cell: ({ row }) => <span className="font-medium text-primary">{row.original.name}</span>,
    },
    {
      accessorKey: "realm",
      header: () => t("server"),
    },
    {
      accessorKey: "username",
      header: () => t("username"),
    },
    {
      accessorKey: "gateway_state",
      header: () => t("Register Status"),
      cell: ({ row }) => {
        const gatewayState = row.original.gateway_state;

        // 已注册 - 绿色
        if (gatewayState === "REGED") {
          return (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-green-600">{t("Registered")}</span>
            </div>
          );
        }

        // 注册失败 - 红色圆点 + 黄色文字
        if (gatewayState === "FAILED" || gatewayState === "FAIL_WAIT") {
          return (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-yellow-700">{t("Register Failed")}</span>
            </div>
          );
        }

        // 尝试中 - 橙色
        if (gatewayState === "TRYING") {
          return (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-orange-600">{t("Trying")}</span>
            </div>
          );
        }

        // 默认状态
        return (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-300" />
            <span className="text-gray-500">{t("Unregistered")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "gateway_status",
      header: () => t("Gateway Status"),
      cell: ({ row }) => {
        const className = row.original.gateway_status;
        // 正常状态：绿色边框 + 白底
        if (className === "REGED" || className === "NOREG" || className === "UP") {
          return (
            <Badge
              variant="outline"
              className="border-green-500 text-green-600 bg-white font-normal"
            >
              {t("Normal")}
            </Badge>
          );
        }
        // Ping 失败
        if (className === "FAILED" || className === "PING_FAILED") {
          return (
            <Badge variant="outline" className="border-red-500 text-red-600 bg-white font-normal">
              {t("Ping Failed")}
            </Badge>
          );
        }

        // Trying 状态
        if (className === "TRYING") {
          return <Badge variant="outline">{t("Trying")}</Badge>;
        }
        // FAIL_WAIT 状态
        if (className === "FAIL_WAIT") {
          return <Badge variant="outline">{t("FAIL_WAIT")}</Badge>;
        }
        return (
          <Badge
            variant="outline"
            className="border-gray-200 bg-gray-100 text-gray-500 font-normal"
          >
            {t("Stop")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "location",
      header: () => t("Location"),
    },
    {
      accessorKey: "disabled",
      header: () => tc("enabled"),
      cell: ({ row }) => {
        return (
          <Switch
            checked={row.original.disabled === "0"}
            onCheckedChange={() => {
              void handleToggleEnabled(row.original);
            }}
          />
        );
      },
    },
    {
      id: "actions",
      header: () => tc("Action"),
      cell: ({ row }) => {
        const gateway = row.original;
        const gateway_status = row.original.gateway_status;
        const gateway_state = row.original.gateway_state;

        return (
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary"
              onClick={() => {
                router.push(`/gateways/${row.original.id}`);
              }}
            >
              {tc("viewDetails")}
            </Button>
            {/* 注册/注销按钮 - 有用户名时显示 */}
            {gateway_status !== "UP" && gateway_state !== "NOREG" && (
              <>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary"
                  onClick={() => void handleGatewayAction(gateway.name, "reg")}
                >
                  {tc("register")}
                </Button>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-destructive"
                  onClick={() => void handleGatewayAction(gateway.name, "unreg")}
                >
                  {tc("unreg")}
                </Button>
                <Separator orientation="vertical" className="mx-1 h-4" />
              </>
            )}

            {/* 启动/停止按钮 - 未禁用时显示 */}
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary"
              onClick={() => void handleGatewayAction(gateway.name, "start")}
            >
              {tc("start")}
            </Button>
            <Separator orientation="vertical" className="mx-1 h-4" />
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-destructive"
              onClick={() => void handleGatewayAction(gateway.name, "stop")}
            >
              {tc("stop")}
            </Button>
            <Separator orientation="vertical" className="mx-1 h-4" />

            {/* 非注册/正常按钮 - 有用户名时显示 */}
            {gateway_status === "UP" && gateway_state === "NOREG" && (
              <>
                <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                  {tc("NOREG")}
                </Button>
                <Separator orientation="vertical" className="mx-1 h-4" />
              </>
            )}

            {/* 克隆和删除按钮 - 始终显示 */}
            {/* <Button variant="link" size="sm" className="h-auto p-0 text-primary">
              {tc("clone")}
            </Button> */}
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-destructive"
              onClick={() => {
                onHandleDelete(gateway);
              }}
            >
              {tc("delete")}
            </Button>
          </div>
        );
      },
    },
  ];
}
