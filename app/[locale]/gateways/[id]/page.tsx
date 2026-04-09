"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTranslations, useLocale } from "next-intl";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { gatewaysApi, routesApi } from "@/lib/api-client";
import { type Gateway, type SiptItem } from "@repo/api-client";
import { use } from "react";
import { toast } from "sonner";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { EditableTable } from "@/components/ui/editable-table";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Button } from "@/components/ui/button";
import { NumberTransformationFields } from "@/components/ui/number-transformation-fields";
import { PlusIcon } from "lucide-react";
import { getLabels } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface GatewayDetailsPageProps {
  params: Promise<{ id: string }>;
}

const basicParam = ["caller-id-in-from", "extension-in-contact", "transport", "ping"];
const registerParam = [
  "auth-username",
  "extension",
  "from-domain",
  "from-user",
  "outbound-proxy",
  "proxy",
  "register-proxy",
  "extension-in-contact",
];
const variableParam = [
  "absolute_codec_string",
  "dtmf_type",
  "rtp_secure_media",
  "ignore_early_media",
  "enable-100rel",
];

// 添加变量的表单验证 schema
const variableFormSchema = z.object({
  k: z.string().min(1, "名称不能为空"),
  v: z.string().min(1, "值不能为空"),
  direction: z.string(),
});

type VariableFormValues = z.infer<typeof variableFormSchema>;

// 添加变量表单组件
function AddVariableForm({
  dialogType,
  onSubmit,
}: {
  gatewayId: string;
  dialogType: "param" | "variable";
  onSubmit: (values: VariableFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const tc = useTranslations("common");
  const tt = useTranslations("gateways");

  const form = useForm<VariableFormValues>({
    resolver: zodResolver(variableFormSchema),
    defaultValues: {
      k: "",
      v: "",
      direction: "0",
    },
  });

  const handleSubmit = (values: VariableFormValues): void => {
    void onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit(handleSubmit)(e);
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="k"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="text-red-500 mr-1">*</span>
                {tt("name")}
              </FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="v"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="text-red-500 mr-1">*</span>
                {tc("value") || "值"}
              </FormLabel>
              <FormControl>
                <Input placeholder="Value" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {dialogType === "variable" && (
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="text-red-500 mr-1">*</span>
                  {tc("direction") || "方向"}
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="col-span-8 w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">全部</SelectItem>
                    <SelectItem value="1">呼入</SelectItem>
                    <SelectItem value="2">呼出</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {tc("close") || "关闭"}
            </Button>
          </DialogClose>
          <Button type="submit">{tc("submit") || "提交"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function GatewayDetailsPage({ params }: GatewayDetailsPageProps) {
  const resolvedParams = use(params);

  const t = useTranslations("pages");
  const tt = useTranslations("gateways");
  const tc = useTranslations("common");
  const locale = useLocale();
  const gatewayId = resolvedParams.id;

  const [gateway, setGateway] = useState<Gateway | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sipProfileslists, setSipProfileslists] = useState<SiptItem[]>([]);
  const [tabType, setTabType] = useState<"0" | "1" | "2">("0");
  const [variateTabType, setVariateTabType] = useState<"0" | "1">("0");
  const [relevancyTabType, setRelevancyTabType] = useState<"routes" | "dods" | "distributors">(
    "routes",
  );
  const [relevanceInfo, setRelevanceInfo] = useState<any[]>([]);
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"param" | "variable">("variable"); // 区分参数和变量
  const [numberTranslation, setNumberTranslation] = useState<any[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);

  const relevanceColumns = {
    routes: [
      { key: "id", header: "ID" },
      { key: "name", header: tt("name") },
      { key: "prefix", header: tt("calledPrefix") },
    ],
    dods: [
      { key: "id", header: "ID" },
      { key: "line_number", header: tt("Line Number") },
    ],
    distributors: [
      { key: "id", header: "ID" },
      { key: "name", header: tt("name") },
    ],
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

  const loadGatewayDetail = useCallback(async () => {
    try {
      const response = await gatewaysApi.getById(gatewayId);
      const gatewayData = response.data;
      setGateway(gatewayData);

      if (gatewayData?.params && gatewayData.params.length > 0) {
        const lparamsResponse = await gatewaysApi.getLparams(locale);
        const lparamsList = lparamsResponse.data || [];
        const lparamsMap = new Map(lparamsList.map((item) => [item.k, item.v]));
        const paramsWithTooltips = gatewayData.params.map((param) => ({
          ...param,
          tooltip: lparamsMap.get(param.k) || "",
        }));
        setGateway((prev) =>
          prev
            ? {
                ...prev,
                params: paramsWithTooltips,
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Failed to load gateway detail:", error);
      toast.error(tc("loadFailed") || "加载网关详情失败");
    } finally {
      setIsLoading(false);
    }
  }, [gatewayId, locale, tc]);

  const getSipProfiles = async () => {
    const res = await gatewaysApi.getSipProfiles();
    setSipProfileslists(res.data || []);
  };

  const getRelevanceInfo = useCallback(async () => {
    const res = await gatewaysApi.getRelevanceInfo(gatewayId);
    setRelevanceInfo(res.data || []);
  }, [gatewayId]);

  useEffect(() => {
    setIsLoading(true);
    void getSipProfiles();
    void getRelevanceInfo();
    void getNumberTransformData();
    void loadGatewayDetail();
  }, [loadGatewayDetail, getRelevanceInfo]);

  const typeParams = useMemo(() => {
    const params = gateway?.params || [];

    switch (tabType) {
      case "0":
        return params.filter((item) => basicParam.includes(item?.k));
      case "1":
        return params.filter((item) => registerParam.includes(item?.k));
      case "2":
        return params.filter(
          (item) => !basicParam.includes(item?.k) && !registerParam.includes(item?.k),
        );
      default:
        return params;
    }
  }, [tabType, gateway]);

  const variateParams = useMemo(() => {
    const variables = gateway?.variables || [];

    switch (variateTabType) {
      case "0":
        return variables.filter((item) => variableParam.includes(item?.k));
      case "1":
        return variables.filter((item) => !variableParam.includes(item?.k));
      default:
        return variables;
    }
  }, [variateTabType, gateway]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("gateways")} />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground">{tc("loading") || "加载中..."}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const handleSave = async (finalData: any) => {
    try {
      await gatewaysApi.update(gatewayId, finalData);
      await loadGatewayDetail();
      toast.success(tc("saveSuccess"));
      return true;
    } catch (error) {
      console.error("Failed to save route:", error);
      toast.error(tc("saveFailed"));
      return false;
    }
  };

  const handleDelete = async (row: any, type: string) => {
    try {
      if (type === "params") {
        await gatewaysApi.deleteParams(gatewayId, row.id);
      } else {
        await gatewaysApi.deleteVariable(gatewayId, row.id);
      }
      toast.success(tc("deleteSuccess") || "删除成功");
      await loadGatewayDetail();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error(tc("deleteFailed") || "删除失败");
    }
  };

  // 处理参数更新
  const handleParamChange = async (key: string, rowData: any) => {
    try {
      if (key === "disabled") {
        await gatewaysApi.upParams(gatewayId, rowData.id, { action: "toggle" });
      } else {
        await gatewaysApi.upParams(gatewayId, rowData.id, { k: rowData.k, v: rowData.v });
      }
      toast.success(tc("saveSuccess") || "保存成功");
      await loadGatewayDetail();
    } catch (error) {
      console.error("Failed to update param:", error);
      toast.error(tc("saveFailed") || "保存失败");
      await loadGatewayDetail();
    }
  };

  // 处理变量更新
  const handleVariableChange = async (key: string, rowData: any) => {
    try {
      if (key === "disabled") {
        await gatewaysApi.upVariable(gatewayId, rowData.id, { action: "toggle" });
      } else {
        await gatewaysApi.upVariable(gatewayId, rowData.id, {
          k: rowData.k,
          v: rowData.v,
          direction: rowData?.direction?.toString(),
        });
      }
      toast.success(tc("saveSuccess") || "保存成功");
      await loadGatewayDetail();
    } catch (error) {
      console.error("Failed to update variable:", error);
      toast.error(tc("saveFailed") || "保存失败");
      await loadGatewayDetail();
    }
  };

  const onSubmit = async (values: VariableFormValues) => {
    try {
      if (dialogType === "param") {
        await gatewaysApi.addParams(gatewayId, {
          k: values.k,
          v: values.v,
        });
      } else {
        await gatewaysApi.addVariable(gatewayId, {
          k: values.k,
          v: values.v,
          direction: Number(values.direction),
        });
      }
      toast.success(tc("createSuccess") || "添加成功");
      setIsVariableDialogOpen(false);
      // 重新加载数据
      await loadGatewayDetail();
    } catch (error) {
      console.error("Failed to add:", error);
      toast.error(tc("createFailed") || "添加失败");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("gateways")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {/* 面包屑导航 */}
                <CommonBreadcrumb
                  items={[
                    { label: t("gateways"), href: "/gateways" },
                    { label: gateway?.name, isCurrentPage: true },
                  ]}
                />

                <EditableSection
                  title="基本信息"
                  defaultValues={{
                    ...gateway,
                    profile_id: gateway?.profile_id ? gateway?.profile_id.toString() : "",
                  }}
                  onSave={handleSave}
                >
                  <EditableField
                    label={tt("name")}
                    name="name"
                    value={gateway?.name}
                    type="text"
                    inputPlaceholder="请输入网关名称"
                    required
                  />

                  <EditableField
                    label={tt("Realm")}
                    name="realm"
                    value={gateway?.realm}
                    type="text"
                    required
                  />

                  <EditableField
                    label={tt("username")}
                    name="username"
                    value={gateway?.username}
                    type="text"
                    required
                  />

                  <EditableField
                    label={tt("SIP Profile")}
                    name="profile_id"
                    value={getLabels(sipProfileslists, gateway?.profile_id, "name", "id")}
                    type="select"
                    options={sipProfileslists?.map((item) => ({
                      value: item.id.toString(),
                      label: item.name,
                    }))}
                  />

                  <EditableField
                    label={tt("Location")}
                    name="location"
                    value={gateway?.location || "-"}
                    type="text"
                  />

                  <EditableField
                    label={tc("register")}
                    name="register"
                    value={gateway?.register}
                    type="switch"
                  />

                  <EditableField
                    label={tt("description")}
                    name="description"
                    value={gateway?.description || "-"}
                    type="textarea"
                    inputPlaceholder="请输入描述"
                    className="md:col-span-2"
                  />
                </EditableSection>
                <div className="flex">
                  <SegmentedTabs
                    defaultValue={tabType}
                    items={[
                      { value: "0", label: "Basic Params" },
                      { value: "1", label: "Register Params" },
                      { value: "2", label: "Advanced Params" },
                    ]}
                    translationNamespace="common"
                    onValueChange={(v) => {
                      setTabType(v as "0" | "1" | "2");
                    }}
                  />
                  {tabType === "2" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setDialogType("param");
                        setIsVariableDialogOpen(true);
                      }}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tc("add")}
                    </Button>
                  )}
                </div>

                <EditableTable
                  columns={[
                    { key: "k", header: "名称" },
                    { key: "v", header: "值", type: "text" },
                    { key: "disabled", header: "启用", type: "switch" },
                    ...(tabType === "1" || tabType === "2"
                      ? [
                          {
                            key: "actions",
                            header: tc("Action"),
                            type: "action" as const,
                            actions: [{ type: "delete" as const, label: tc("delete") }],
                          },
                        ]
                      : []),
                  ]}
                  data={typeParams}
                  switchCheckedValue={0}
                  switchUncheckedValue={1}
                  onDelete={(v) => handleDelete(v, "params")}
                  onChange={({ key, rowData }) => {
                    void handleParamChange(key, rowData);
                  }}
                />

                {/* 号码变换 */}
                <EditableSection
                  title="号码变换"
                  defaultValues={{
                    sdnc: gateway?.sdnc || "", // 主叫号码变换字段
                    dnc: gateway?.dnc || "", // 被叫号码变换字段
                  }}
                  onSave={handleSave}
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

                <div className="flex">
                  <SegmentedTabs
                    defaultValue={variateTabType}
                    items={[
                      { value: "0", label: "Common Params" },
                      { value: "1", label: "Other Params" },
                    ]}
                    translationNamespace="common"
                    onValueChange={(v) => {
                      setVariateTabType(v as "0" | "1");
                    }}
                  />
                  {variateTabType === "1" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setDialogType("variable");
                        setIsVariableDialogOpen(true);
                      }}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tc("add")}
                    </Button>
                  )}
                </div>

                <EditableTable
                  columns={[
                    { key: "k", header: "名称" },
                    { key: "v", header: "值", type: "text" },
                    {
                      key: "direction",
                      header: "方向",
                      type: "select",
                      options: [
                        { value: "0", label: "全部" },
                        { value: "1", label: "呼入" },
                        { value: "2", label: "呼出" },
                      ],
                    },
                    { key: "disabled", header: "启用", type: "switch" },
                    ...(variateTabType === "1"
                      ? [
                          {
                            key: "actions",
                            header: tc("Action"),
                            type: "action" as const,
                            actions: [{ type: "delete" as const, label: tc("delete") }],
                          },
                        ]
                      : []),
                  ]}
                  data={variateParams}
                  switchCheckedValue={0}
                  switchUncheckedValue={1}
                  onDelete={(v) => handleDelete(v, "variate")}
                  onChange={({ key, rowData }) => {
                    void handleVariableChange(key, rowData);
                  }}
                />

                <SegmentedTabs
                  defaultValue={relevancyTabType}
                  items={[
                    { value: "routes", label: "Associated Routes" },
                    { value: "dods", label: "Associated DODs" },
                    { value: "distributors", label: "Associated Distributors" },
                  ]}
                  translationNamespace="gateways"
                  onValueChange={(v) => {
                    setRelevancyTabType(v as "routes" | "dods" | "distributors");
                  }}
                />

                <EditableTable
                  columns={relevanceColumns[relevancyTabType]}
                  data={(relevanceInfo as any)[relevancyTabType] || []}
                />

                {/* 添加变量/参数对话框 */}
                <Dialog open={isVariableDialogOpen} onOpenChange={setIsVariableDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {dialogType === "variable" ? "添加变量" : "添加参数"}
                      </DialogTitle>
                    </DialogHeader>
                    <AddVariableForm
                      gatewayId={gatewayId}
                      dialogType={dialogType}
                      onSubmit={onSubmit}
                      onCancel={() => setIsVariableDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
