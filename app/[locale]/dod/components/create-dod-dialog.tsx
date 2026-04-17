"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { dodsApi, extensionsApi, routesApi } from "@/lib/api-client";

const createDodSchema = z.object({
  line_number: z.string().min(1, { message: "请输入线路号码" }),
  extn: z.string().min(1, { message: "请选择分机" }),
  type: z.string().min(1, { message: "请选择资源类型" }),
  ref_id: z.string().min(1, { message: "请选择资源" }),
});

export function CreateDodDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  const t = useTranslations("dod");
  const ttt = useTranslations("common");
  const [extensions, setExtensions] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [trunks, setTrunks] = useState<any[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(createDodSchema),
    defaultValues: {
      line_number: "",
      extn: "",
      type: "",
      ref_id: "",
    },
  });

  useEffect(() => {
    const loadExtensions = async () => {
      try {
        const response = await extensionsApi.list({ page_size: 5000 });
        setExtensions(response.data.data || []);
      } catch (error) {
        console.error("Failed to load extensions:", error);
      }
    };

    void loadExtensions();
  }, []);

  useEffect(() => {
    const loadResources = async () => {
      if (selectedType === "GATEWAY") {
        try {
          const response = await routesApi.getGateways();
          setGateways(response.data?.data || []);
        } catch (error) {
          console.error("Failed to load gateways:", error);
        }
      } else if (selectedType === "TRUNKS") {
        try {
          const response = await routesApi.getTrunks();
          setTrunks(response.data?.data || []);
        } catch (error) {
          console.error("Failed to load trunks:", error);
        }
      } else if (selectedType === "DISTRIBUTORS") {
        try {
          const response = await routesApi.getDistributors();
          setDistributors(response.data?.data || []);
        } catch (error) {
          console.error("Failed to load distributors:", error);
        }
      }
    };

    void loadResources();
  }, [selectedType]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    form.resetField("ref_id");
  };

  const handleCreate = async (values: z.infer<typeof createDodSchema>) => {
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

      await dodsApi.create({
        ...values,
        name,
      });

      toast.success(ttt("createSuccess") || "创建成功");
      onSubmit();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Failed to create dod:", error);
      if (error?.message?.includes("duplicate key value violates unique constraint")) {
        toast.error("线路号码已存在，无法重复创建");
      } else {
        toast.error(
          `${ttt("createFailed") || "创建失败"}: ${error?.message || error?.text || error}`,
        );
      }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("addDod")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleCreate)(e);
            }}
          >
            <div className="space-y-4">
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {ttt("cancel")}
              </Button>
              <Button
                type="submit"
                className="ml-2 bg-primary text-white hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? ttt("submitting") : ttt("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
