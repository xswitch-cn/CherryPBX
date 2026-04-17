"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { dodsApi, extensionsApi, routesApi, type DOD } from "@/lib/api-client";
import { useParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";

export default function DodDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string; locale: string }>();
  const dodId = params.id;
  const t = useTranslations("dod");
  const ttt = useTranslations("common");

  const [dod, setDod] = useState<DOD | null>(null);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [trunks, setTrunks] = useState<any[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const editDodSchema = z.object({
    line_number: z.string().min(1, { message: "请输入线路号码" }),
    extn: z.string().min(1, { message: "请选择分机" }),
    type: z.string().min(1, { message: "请选择资源类型" }),
    ref_id: z.string().min(1, { message: "请选择资源" }),
  });

  const form = useForm({
    resolver: zodResolver(editDodSchema),
    defaultValues: {
      line_number: "",
      extn: "",
      type: "",
      ref_id: "",
    },
  });

  const loadDod = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dodsApi.getById(parseInt(dodId, 10));
      setDod(response.data);
      setSelectedType(response.data.type);
      form.reset({
        line_number: response.data.line_number,
        extn: response.data.extn,
        type: response.data.type,
        ref_id: response.data.ref_id?.toString() || "",
      });
    } catch (error) {
      console.error("Failed to load dod:", error);
      toast.error(ttt("loadFailed") || "加载失败");
    } finally {
      setLoading(false);
    }
  }, [dodId, form, ttt]);

  const loadExtensions = useCallback(async () => {
    try {
      const response = await extensionsApi.list({ page_size: 5000 });
      setExtensions(response.data.data || []);
    } catch (error) {
      console.error("Failed to load extensions:", error);
    }
  }, []);

  const loadGateways = useCallback(async () => {
    try {
      const response = await routesApi.getGateways();
      setGateways(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load gateways:", error);
    }
  }, []);

  const loadTrunks = useCallback(async () => {
    try {
      const response = await routesApi.getTrunks();
      setTrunks(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load trunks:", error);
    }
  }, []);

  const loadDistributors = useCallback(async () => {
    try {
      const response = await routesApi.getDistributors();
      setDistributors(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load distributors:", error);
    }
  }, []);

  useEffect(() => {
    void loadDod();
    void loadExtensions();
  }, [loadDod, loadExtensions]);

  useEffect(() => {
    const loadResources = async () => {
      if (selectedType === "GATEWAY") {
        await loadGateways();
      } else if (selectedType === "TRUNKS") {
        await loadTrunks();
      } else if (selectedType === "DISTRIBUTORS") {
        await loadDistributors();
      }
    };

    void loadResources();
  }, [selectedType, loadGateways, loadTrunks, loadDistributors]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    form.resetField("ref_id");
  };

  const handleSubmit = async (values: z.infer<typeof editDodSchema>) => {
    try {
      setLoading(true);

      let name = "";
      if (values.type === "GATEWAY") {
        const gateway = gateways.find((g) => g.id === values.ref_id);
        name = gateway?.name || "";
      } else if (values.type === "TRUNKS") {
        const trunk = trunks.find((t) => t.id === values.ref_id);
        name = trunk?.name || "";
      } else if (values.type === "DISTRIBUTORS") {
        const distributor = distributors.find((d) => d.id === values.ref_id);
        name = distributor?.name || "";
      }

      await dodsApi.update(parseInt(dodId, 10), {
        ...values,
        name,
      });

      toast.success(ttt("saveSuccess") || "保存成功");
      router.push(`/${params.locale}/dod`);
    } catch (error: any) {
      console.error("Failed to update dod:", error);
      toast.error(`${ttt("saveFailed") || "保存失败"}: ${error?.message || error?.text || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await dodsApi.delete(parseInt(dodId, 10));
      toast.success(ttt("deleteSuccess") || "删除成功");
      router.push(`/${params.locale}/dod`);
    } catch (error: any) {
      console.error("Failed to delete dod:", error);
      toast.error(
        `${ttt("deleteFailed") || "删除失败"}: ${error?.message || error?.text || error}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const getResourceOptions = () => {
    if (selectedType === "GATEWAY") {
      return gateways.map((gateway) => ({
        value: gateway.id.toString(),
        label: gateway.name,
      }));
    } else if (selectedType === "TRUNKS") {
      return trunks.map((trunk) => ({
        value: trunk.id.toString(),
        label: trunk.name,
      }));
    } else if (selectedType === "DISTRIBUTORS") {
      return distributors.map((distributor) => ({
        value: distributor.id.toString(),
        label: distributor.name,
      }));
    }
    return [];
  };

  if (loading && !dod) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("dod")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">加载中...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!dod) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("dod")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">DOD 不存在</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("dod")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <CommonBreadcrumb
                  items={[
                    { label: t("dod"), href: `/${params.locale}/dod` },
                    { label: dod.line_number, isCurrentPage: true },
                  ]}
                />

                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" onClick={() => router.push(`/${params.locale}/dod`)}>
                    {ttt("back") || "返回"}
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    {ttt("delete") || "删除"}
                  </Button>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void form.handleSubmit(handleSubmit)(e);
                    }}
                  >
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="line_number"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-12 items-center gap-x-4">
                            <FormLabel className="col-span-4 text-right justify-center flex">
                              <span className="text-destructive mr-1">*</span>
                              {t("lineNumber")}
                            </FormLabel>
                            <FormControl className="col-span-8">
                              <Input {...field} placeholder={t("lineNumberPlaceholder")} />
                            </FormControl>
                            <FormMessage className="col-span-8 col-start-5" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="extn"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-12 items-center gap-x-4">
                            <FormLabel className="col-span-4 text-right justify-center flex">
                              <span className="text-destructive mr-1">*</span>
                              {t("extension")}
                            </FormLabel>
                            <FormControl className="col-span-8">
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("selectExtension")} />
                                </SelectTrigger>
                                <SelectContent>
                                  {extensions.map((ext) => (
                                    <SelectItem key={ext.extn} value={ext.extn}>
                                      {ext.name} | {ext.extn}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="col-span-8 col-start-5" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-12 items-center gap-x-4">
                            <FormLabel className="col-span-4 text-right justify-center flex">
                              <span className="text-destructive mr-1">*</span>
                              {t("resourceType")}
                            </FormLabel>
                            <FormControl className="col-span-8">
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleTypeChange(value);
                                }}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t("selectResourceType")} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GATEWAY">{t("gateway")}</SelectItem>
                                  <SelectItem value="TRUNKS">{t("trunk")}</SelectItem>
                                  <SelectItem value="DISTRIBUTORS">{t("distributor")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="col-span-8 col-start-5" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ref_id"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-12 items-center gap-x-4">
                            <FormLabel className="col-span-4 text-right justify-center flex">
                              <span className="text-destructive mr-1">*</span>
                              {t(selectedType.toLowerCase())}
                            </FormLabel>
                            <FormControl className="col-span-8">
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!selectedType}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t("selectResource")} />
                                </SelectTrigger>
                                <SelectContent>
                                  {getResourceOptions().map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="col-span-8 col-start-5" />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push(`/${params.locale}/dod`)}
                        >
                          {ttt("cancel") || "取消"}
                        </Button>
                        <Button
                          type="submit"
                          className="bg-primary text-white hover:bg-primary/90"
                          disabled={loading}
                        >
                          {loading ? ttt("submitting") : ttt("save")}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("deleteDod")}
        description={t("deleteItem", { item: dod.line_number })}
        onSubmit={handleDelete}
        deleteText={ttt("confirm") || "确定"}
        cancelText={ttt("cancel") || "取消"}
        isLoading={loading}
      />
    </SidebarProvider>
  );
}
