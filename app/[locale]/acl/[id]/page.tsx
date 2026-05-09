"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { use } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { type Acl, type AclParams } from "@repo/api-client";
import { AclApi } from "@/lib/api-client";
import { toast } from "sonner";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { EditableTable } from "@/components/ui/editable-table";
import { DynamicFormDialog, FormConfig, FieldConfig } from "@/components/dynamic-form-dialog";

interface AclDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function AclDetailsPage({ params }: AclDetailsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const t = useTranslations("pages");
  const ta = useTranslations("acl");
  const tc = useTranslations("common");
  const aclId = resolvedParams.id;

  const [acl, setAcl] = useState<Acl | null>(null);
  const [actions, setActions] = useState<AclParams[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false);
  const [selectedModule, setSelectedAgreement] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedAgreement(null);
    }
  }, []);

  const loadAclDetail = useCallback(async () => {
    try {
      const response = await AclApi.getById(aclId);
      setAcl(response.data);
      setActions(
        response.data?.params?.map((item) => {
          return {
            ...item,
            pv:
              item.port_type === 2
                ? `${item.min_port} - ${item.max_port}`
                : item.port_type === 1
                  ? item.ports
                  : item.port,
          };
        }) || [],
      );
    } catch (error) {
      console.error("Failed to load acl detail:", error);
      toast.error(tc("loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [aclId, tc]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsLoading(true);
    void loadAclDetail();
  }, [aclId, router]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("acl")} />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground">{tc("loading") || "加载中..."}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const handleSave = async (finalData: any) => {
    try {
      await AclApi.update(aclId, finalData);
      console.log(2);
      await loadAclDetail();
      toast.success(tc("saveSuccess"));
      return true;
    } catch (error) {
      console.error("Failed to save acl:", error);
      toast.error(tc("saveFailed"));
      return false;
    }
  };

  const handleDelete = async (row: any) => {
    try {
      await AclApi.deleteParams(aclId, row.id);
      toast.success(tc("deleteSuccess") || "删除成功");
      console.log(3);
      await loadAclDetail();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error(tc("deleteFailed") || "删除失败");
    }
  };

  // 处理参数更新
  const handleParamChange = async (key: string, rowData: any) => {
    try {
      await AclApi.upParams(aclId, rowData.id, {
        k: rowData.k,
        v: rowData.v,
        node_type: rowData.node_type,
        pv: rowData.pv,
      });
      toast.success(tc("saveSuccess") || "保存成功");
      console.log(4);
      await loadAclDetail();
    } catch (error) {
      console.error("Failed to update param:", error);
      toast.error(tc("saveFailed") || "保存失败");
      console.log(5);
      await loadAclDetail();
    }
  };

  const formConfig: FormConfig = {
    fields: [
      {
        name: "node_type",
        label: ta("Node Type"),
        type: "select",
        required: true,
        options: [
          { value: "domain", label: "domain" },
          { value: "cidr", label: "cidr" },
        ],
      },
      {
        name: "v",
        label: tc("value"),
        type: "text",
        required: true,
      },
      {
        name: "port_type",
        label: ta("Port Rule"),
        type: "select",
        onChange: (value: number) => {
          setSelectedAgreement(value);
        },
        options: [
          { value: 2, label: ta("Port Range") },
          { value: 1, label: ta("Mutiple Ports") },
          { value: 0, label: ta("Single Port") },
        ],
      },
      ...(selectedModule === 2
        ? [
            {
              name: "min_port",
              label: ta("Min"),
              type: "text",
              inputTransform: (value: string) => {
                if (value && !/^\d*$/.test(value)) {
                  return { value, error: ta("validationDigitsOnly") };
                }
                return { value, error: undefined };
              },
            } satisfies FieldConfig,
            {
              name: "max_port",
              label: ta("Max"),
              type: "text",
              inputTransform: (value: string) => {
                if (value && !/^\d*$/.test(value)) {
                  return { value, error: ta("validationDigitsOnly") };
                }
                return { value, error: undefined };
              },
            } satisfies FieldConfig,
          ]
        : [
            {
              name: selectedModule === 1 ? "ports" : "port",
              label: ta("Port Value"),
              type: "text",
              placeholder:
                selectedModule === 1 ? ta("Numbers separated by ',', for example '101,102'") : "",
              inputTransform: (value: string) => {
                if (selectedModule === 1) {
                  if (value && !/^[\d,]*$/.test(value)) {
                    return { value, error: ta("validationDigitsAndCommas") };
                  }
                  if (value && /,,/.test(value)) {
                    return { value, error: ta("validationNoConsecutiveCommas") };
                  }
                  if (value && (value.startsWith(",") || value.endsWith(","))) {
                    return { value, error: ta("validationCommaPosition") };
                  }
                } else {
                  if (value && !/^\d*$/.test(value)) {
                    return { value, error: ta("validationDigitsOnly") };
                  }
                }
                return { value, error: undefined };
              },
            } satisfies FieldConfig,
          ]),
      {
        name: "k",
        label: ta("Default Rule"),
        type: "radio",
        required: true,
        radioOptions: [
          { value: "allow", label: ta("allow") },
          { value: "deny", label: ta("deny") },
        ],
      },
    ],
  };

  const onSubmit = async (v: AclParams) => {
    try {
      await AclApi.addParams(aclId, v);
      toast.success(tc("createSuccess") || "添加成功");
      setIsVariableDialogOpen(false);
      console.log(6);
      await loadAclDetail();
    } catch (error) {
      console.error("Failed to add:", error);
      toast.error(tc("createFailed") || "添加失败");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("acl")} />
        <div className="px-4 lg:px-6 py-4 md:py-6 flex flex-col md:gap-6">
          <CommonBreadcrumb
            items={[
              { label: t("acl"), href: "/acl" },
              { label: acl?.name, isCurrentPage: true },
            ]}
          />

          <EditableSection title={tc("basicInfo")} defaultValues={acl || {}} onSave={handleSave}>
            <EditableField label={tc("name")} name="name" value={acl?.name} type="text" required />

            <EditableField
              label={ta("Default Rule")}
              name="rule"
              value={ta(`${acl?.rule}`)}
              type="radio"
              options={[
                { value: "allow", label: ta("allow") },
                { value: "deny", label: ta("deny") },
              ]}
              required
            />
          </EditableSection>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div />
            <Button
              size="sm"
              onClick={() => {
                setIsVariableDialogOpen(true);
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              {tc("add")}
            </Button>
          </div>

          <EditableTable
            columns={[
              {
                key: "k",
                header: ta("Default Rule"),
                type: "radio",
                options: [
                  { value: "allow", label: ta("allow") },
                  { value: "deny", label: ta("deny") },
                ],
              },
              { key: "node_type", header: ta("Node Type") },
              { key: "v", header: tc("value"), type: "text" },
              {
                key: "port_type",
                header: ta("Port Rule"),
                render: (row: any) => {
                  switch (row?.port_type) {
                    case 2:
                      return <span>{ta("Port Range")}</span>;
                    case 1:
                      return <span>{ta("Mutiple Ports")}</span>;
                    case 0:
                      return <span>{ta("Single Port")}</span>;
                    default:
                      break;
                  }
                },
              },
              { key: "pv", header: ta("Port Value"), type: "text" },
              {
                key: "actions",
                header: tc("Action"),
                type: "action" as const,
                actions: [{ type: "delete" as const, label: tc("delete") }],
              },
            ]}
            data={actions}
            switchCheckedValue={0}
            switchUncheckedValue={1}
            onDelete={(v) => handleDelete(v)}
            onChange={({ key, rowData }) => {
              void handleParamChange(key, rowData);
            }}
          />

          {/* 添加参数对话框 */}
          <DynamicFormDialog
            open={isVariableDialogOpen}
            onOpenChange={setIsVariableDialogOpen}
            title={tc("Add Param")}
            config={formConfig}
            onSubmit={onSubmit}
            submitText={tc("submit")}
            cancelText={tc("close")}
            contentClassName="sm:max-w-[450px]"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
