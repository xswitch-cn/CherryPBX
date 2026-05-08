"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { routesApi, Route, ContextItem } from "@/lib/api-client";
import { type BlackItem, type DictItem } from "@repo/api-client";
import { toast } from "sonner";
import {
  EditableSection,
  EditableField,
  type SelectOption,
} from "@/components/ui/editable-section";
import { NumberTransformationFields } from "@/components/ui/number-transformation-fields";
import { Destination } from "../components/destination";
import { ActionList, type ActionItem } from "../components/action-list";
import { use } from "react";
import { getLabels } from "@/lib/utils";

interface RouteDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function RouteDetailsPage({ params }: RouteDetailsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("routes");
  const tc = useTranslations("common");
  const tb = useTranslations("blacklist");

  const routeId = resolvedParams.id;
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [blacklists, setBlacklists] = useState<BlackItem[]>([]);
  const [toneDicts, setToneDicts] = useState<DictItem[]>([]);
  const [codecDicts, setCodecDicts] = useState<DictItem[]>([]);
  const [destinationTypes, setDestinationTypes] = useState<DictItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [numberTranslation, setNumberTranslation] = useState<any[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);

  const loadRouteDetail = useCallback(async () => {
    try {
      const response = await routesApi.getById(routeId);
      setRoute(response.data);
      setActions(response.data?.params || []);
    } catch (error) {
      console.error("Failed to load route detail:", error);
      toast.error(tt("loadFailed") || "加载路由详情失败");
    } finally {
      setIsLoading(false);
    }
  }, [routeId, tt]);

  const getContexts = async () => {
    const res = await routesApi.getContexts();
    setContexts(res.data?.data || []);
  };

  const getBlacklists = async () => {
    const res = await routesApi.getBlacklists();
    setBlacklists(res.data?.data || []);
  };

  const getDicts = async () => {
    const res = await routesApi.getDicts("TONE");
    const codecRes = await routesApi.getDicts("CODEC");
    const destRes = await routesApi.getDicts("DEST");
    setDestinationTypes(destRes.data || []);
    setToneDicts(res.data || []);
    setCodecDicts(codecRes.data || []);
  };

  const getNumberTransformData = async () => {
    // 获取号码变换表
    const numberTransRes = await routesApi.getNumberTranslation();
    const numberTransData =
      numberTransRes.data?.data?.map((item: any) => ({
        value: item?.id,
        label: item?.name,
      })) || [];
    setNumberTranslation(numberTransData);

    // 获取 Distributors
    const distributorsRes = await routesApi.getDistributors();
    const distributorsData =
      distributorsRes.data?.data?.map((item: any) => ({
        value: item.id.toString(),
        label: item.name,
      })) || [];
    setDistributors(distributorsData);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsLoading(true);
    void getContexts();
    void getBlacklists();
    void getDicts();
    void getNumberTransformData();
    void loadRouteDetail();
  }, [routeId, router, loadRouteDetail]);

  const handleSave = async (finalData: any) => {
    try {
      if (
        finalData.dest_type === "FS_DEST_RING_EXTNS" ||
        finalData.dest_type === "FS_DEST_SEQ_EXTNS"
      ) {
        finalData.dest_uuid = JSON.stringify(
          finalData?.dest_uuid?.map((item: string) => {
            return {
              extn: item,
            };
          }),
        );
      }
      await routesApi.update(routeId, finalData);
      await loadRouteDetail();
      toast.success(tc("saveSuccess"));
      return true;
    } catch (error) {
      console.error("Failed to save route:", error);
      toast.error(tc("saveFailed"));
      return false;
    }
  };

  const handleCancel = () => {
    console.log("取消编辑");
  };

  const routeType: SelectOption[] = [
    { value: "0", label: tt("emergencyCall") },
    { value: "1", label: tt("internal") },
    { value: "2", label: tt("local") },
    { value: "3", label: tt("domestic") },
    { value: "4", label: tt("international") },
  ];

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("routes")} />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground">{tt("loading") || "加载中..."}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const getRouteDisplay = (id?: string) => {
    const route = blacklists.find((r) => r.id === id);
    return route ? `${route.name}[${route.list_type === "0" ? tb("block") : tb("allow")}]` : "-";
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("routes")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {/* 面包屑导航 */}
                <CommonBreadcrumb
                  items={[
                    { label: t("routes"), href: "/routes" },
                    { label: route?.name, isCurrentPage: true },
                  ]}
                />

                <EditableSection
                  title={tc("basicInfo")}
                  defaultValues={route || {}}
                  onSave={handleSave}
                  onCancel={handleCancel}
                >
                  <EditableField
                    label={tt("routeName")}
                    name="name"
                    value={route?.name}
                    type="text"
                    inputPlaceholder="请输入路由名称"
                    required
                  />

                  <EditableField
                    label={tt("callSource")}
                    name="context"
                    value={getLabels(contexts, route?.context, "name", "key")}
                    type="select"
                    options={contexts.map((item) => ({
                      value: item.key,
                      label: item.name,
                    }))}
                  />

                  <EditableField
                    label={tt("calledPrefix")}
                    name="prefix"
                    value={route?.prefix || "-"}
                    type="text"
                  />

                  <EditableField
                    label={tt("maxNumberLength")}
                    name="max_length"
                    value={route?.max_length?.toString() || "-"}
                    type="number"
                    min={1}
                    max={32}
                  />

                  <EditableField
                    label={tt("description")}
                    name="description"
                    value={route?.description || "-"}
                    type="textarea"
                    inputPlaceholder="请输入描述"
                    className="md:col-span-2"
                  />
                </EditableSection>

                <EditableSection
                  title="扩展信息"
                  defaultValues={{
                    ...route,
                    auto_record: route?.auto_record?.toString(),
                    route_type: route?.route_type?.toString(),
                    proxy_media: route?.proxy_media?.toString(),
                    did_enabled: route?.did_enabled?.toString(),
                    ringback_enabled: route?.ringback_enabled?.toString(),
                    media_codec: route?.media_codec ? route.media_codec.split(",") : null,
                  }}
                  onSave={handleSave}
                  onCancel={handleCancel}
                >
                  <EditableField
                    label={tt("autoRecord")}
                    name="auto_record"
                    value={route?.auto_record === 1 ? tc("yes") : tc("no")}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                    required
                  />

                  <EditableField
                    label={tt("blackWhiteList")}
                    name="blacklist"
                    value={route?.blacklist ? getRouteDisplay(route?.blacklist) : "-"}
                    type="select"
                    options={blacklists.map((item) => ({
                      value: item.id,
                      label: `${item.name}[${item.list_type === "0" ? tb("block") : tb("allow")}]`,
                    }))}
                  />

                  <EditableField
                    label={tt("routeType")}
                    name="route_type"
                    value={getLabels(routeType, route?.route_type?.toString())}
                    type="radio"
                    options={routeType}
                  />

                  <EditableField
                    label={tt("proxyMedia")}
                    name="proxy_media"
                    value={route?.proxy_media === 1 ? tc("yes") : tc("no")}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                    required
                  />

                  <EditableField
                    label={tt("mediaCodec")}
                    name="media_codec"
                    value={route?.media_codec || "-"}
                    type="multi-select"
                    options={codecDicts.map((item) => ({
                      value: item?.v ? item.v : "",
                      label: item.k,
                    }))}
                  />

                  <EditableField
                    label={tt("enabledDID")}
                    name="did_enabled"
                    value={route?.did_enabled === 1 ? tc("yes") : tc("no")}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                    required
                  />

                  <EditableField
                    label={tt("ringbackOn")}
                    name="ringback_enabled"
                    value={route?.ringback_enabled === 1 ? tc("yes") : tc("no")}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                    required
                  />

                  <EditableField
                    label={tt("ringbackTone")}
                    name="ringback_tone"
                    value={route?.ringback_tone ? JSON.parse(route.ringback_tone)?.media_k : "-"}
                    type="select"
                    options={toneDicts.map((item) => ({
                      value: JSON.stringify({
                        media_id: item?.id,
                        media_path: `tone_stream://${item?.v}`,
                        media_type: "RINGTONE",
                        media_k: item?.k,
                      }),
                      label: `[${tc(item.k)}]${item.v}`,
                    }))}
                  />
                </EditableSection>

                {/* 号码变换 */}
                <EditableSection
                  title="号码变换"
                  defaultValues={{
                    sdnc: route?.sdnc || "", // 主叫号码变换字段
                    dnc: route?.dnc || "", // 被叫号码变换字段
                  }}
                  onSave={handleSave}
                  onCancel={handleCancel}
                >
                  {/* 主叫号码变换字段 */}
                  <NumberTransformationFields
                    mode="sdnc"
                    numberTranslation={numberTranslation}
                    distributors={distributors}
                  />

                  {/* 被叫号码变换字段 */}
                  <NumberTransformationFields
                    mode="dnc"
                    numberTranslation={numberTranslation}
                    distributors={distributors}
                  />
                </EditableSection>

                {/* 目的地控制 */}
                <EditableSection
                  title="目的地控制"
                  defaultValues={{
                    dest_type: route?.dest_type || "",
                    dest_uuid: route?.dest_uuid || "",
                    body: route?.body || "",
                  }}
                  onSave={handleSave}
                  onCancel={handleCancel}
                >
                  {/* 动作列表 */}
                  <ActionList
                    actions={actions}
                    onActionsChange={setActions}
                    isEditing={true}
                    routeId={routeId}
                    loadRouteDetail={() => void loadRouteDetail()}
                  />

                  {/* 目的地选择 */}
                  <Destination destinationTypes={destinationTypes} />
                </EditableSection>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
