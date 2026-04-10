"use client";

import * as React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { routesApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { BookOpenIcon, Trash2Icon, SearchIcon } from "lucide-react";
import type { Route } from "@/lib/api-client";

interface BatchSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRoutes: Route[];
  allRoutes: Route[];
  onSelectionChange: (selectedRoutes: Route[]) => void;
  onSubmit: (data: BatchSettingsFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface BatchSettingsFormData {
  blacklist?: string;
  media_codec?: string[];
  auto_record?: string;
  route_type?: string;
  proxy_media?: string;
  did_enabled?: string;
}

export function BatchSettingsDialog({
  open,
  onOpenChange,
  selectedRoutes,
  onSelectionChange,
  onSubmit,
  isLoading = false,
}: BatchSettingsDialogProps) {
  const tt = useTranslations("routes");
  const tc = useTranslations("common");
  const [isRouteSelectOpen, setIsRouteSelectOpen] = useState(false);
  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<string>>(
    new Set(selectedRoutes.map((route) => String(route.id))),
  );
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPageLeft, setCurrentPageLeft] = useState(1);
  const [allRoutesData, setAllRoutesData] = useState<Route[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [blacklistOptions, setBlacklistOptions] = useState<Array<{ value: string; label: string }>>(
    [],
  );
  const [mediaCodecOptions, setMediaCodecOptions] = useState<any[]>([]);
  const pageSize = 10;

  const routeType = [
    { value: "0", label: tt("emergencyCall") },
    { value: "1", label: tt("internal") },
    { value: "2", label: tt("local") },
    { value: "3", label: tt("domestic") },
    { value: "4", label: tt("international") },
  ];

  // 获取初始化数据
  React.useEffect(() => {
    if (open) {
      const fetchInitialData = async () => {
        setIsLoadingRoutes(true);
        try {
          const [routesRes, blacklistsRes, codecRes] = await Promise.all([
            routesApi.list({ type: "ALL" }),
            routesApi.getBlacklists(),
            routesApi.getDicts("CODEC"),
          ]);

          // 设置路由数据
          setAllRoutesData(routesRes.data?.data || []);

          // 设置黑名单选项
          const blacklists = blacklistsRes.data?.data || [];
          const blacklistOpts = blacklists.map((item: any) => ({
            value: String(item.id),
            label: item.name || String(item.id),
          }));
          setBlacklistOptions(blacklistOpts);

          // 设置媒体编码选项
          const codecs = codecRes.data || [];
          const codecsOpts = codecs.map((item: any) => ({
            value: item.v,
            label: item.k,
          }));
          setMediaCodecOptions(codecsOpts);
        } catch (error) {
          console.error("Failed to fetch initial data:", error);
        } finally {
          setIsLoadingRoutes(false);
        }
      };
      void fetchInitialData();
    }
  }, [open]);

  const form = useForm<BatchSettingsFormData>({
    defaultValues: {
      blacklist: "",
      media_codec: [],
      auto_record: "",
    },
  });

  React.useEffect(() => {
    setSelectedRouteIds(new Set(selectedRoutes.map((route) => String(route.id))));
  }, [selectedRoutes]);

  const filteredRoutes = React.useMemo(() => {
    if (!searchKeyword) return allRoutesData;
    const keyword = searchKeyword.toLowerCase();
    return allRoutesData.filter(
      (route) => route.name?.toLowerCase().includes(keyword) || String(route.id).includes(keyword),
    );
  }, [allRoutesData, searchKeyword]);

  const totalPagesLeft = Math.ceil(filteredRoutes.length / pageSize) || 1;
  const paginatedRoutes = React.useMemo(() => {
    const start = (currentPageLeft - 1) * pageSize;
    return filteredRoutes.slice(start, start + pageSize);
  }, [filteredRoutes, currentPageLeft, pageSize]);

  const selectedRoutesList = React.useMemo(() => {
    return allRoutesData.filter((route) => selectedRouteIds.has(String(route.id)));
  }, [allRoutesData, selectedRouteIds]);

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked);
    if (checked) {
      const allIds = filteredRoutes.map((route) => String(route.id));
      setSelectedRouteIds(new Set(allIds));
    } else {
      setSelectedRouteIds(new Set());
    }
  };

  const handleRouteSelect = (routeId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedRouteIds);
    if (checked) {
      newSelectedIds.add(routeId);
    } else {
      newSelectedIds.delete(routeId);
    }
    setSelectedRouteIds(newSelectedIds);
    setIsSelectAll(
      filteredRoutes.length > 0 &&
        filteredRoutes.every((route) => newSelectedIds.has(String(route.id))),
    );
  };

  const handleRemoveRoute = (routeId: string) => {
    const newSelectedIds = new Set(selectedRouteIds);
    newSelectedIds.delete(routeId);
    setSelectedRouteIds(newSelectedIds);
  };

  const handleRouteSelectConfirm = () => {
    const selected = allRoutesData.filter((route) => selectedRouteIds.has(String(route.id)));
    onSelectionChange(selected);
    setIsRouteSelectOpen(false);
  };

  const handleSubmit = async (data: BatchSettingsFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("handleSubmit error:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{tt("batchSettings") || "批量设置路由"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit(handleSubmit)(e);
              }}
            >
              <div className="space-y-6 py-4">
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start px-4 py-6 text-left"
                    onClick={() => setIsRouteSelectOpen(true)}
                  >
                    <BookOpenIcon
                      className={`mr-2 h-5 w-5 ${selectedRoutes.length > 0 ? "text-teal-500" : "text-muted-foreground"}`}
                    />
                    <span
                      className={
                        selectedRoutes.length > 0 ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {selectedRoutes.length > 0
                        ? `${tc("selectedCount", { count: selectedRoutes.length }) || `已选择: ${selectedRoutes.length}`}`
                        : tt("selectRoutes") || "请选择路由"}
                    </span>
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">{tt("extensionInfo") || "扩展信息"}</h4>

                  <div className="space-y-2">
                    <FormLabel className="text-muted-foreground">
                      {tt("blackWhiteList") || "黑白名单"}
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name="blacklist"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isLoadingRoutes}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={tt("selectBlackWhiteList") || "请选择"} />
                              </SelectTrigger>
                              <SelectContent>
                                {blacklistOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel className="text-muted-foreground">
                      {tt("mediaCodec") || "媒体编码"}
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name="media_codec"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Combobox
                              multiple
                              value={field.value || []}
                              onValueChange={(value) => {
                                console.log("Combobox onValueChange:", value);
                                field.onChange(value);
                              }}
                            >
                              <ComboboxChips>
                                {field.value && field.value.length > 0
                                  ? field.value.map((val: string) => {
                                      const option = mediaCodecOptions?.find(
                                        (opt) => opt.value === val,
                                      );
                                      return (
                                        <ComboboxChip key={val}>
                                          {option ? option.label : val}
                                        </ComboboxChip>
                                      );
                                    })
                                  : null}
                                <ComboboxChipsInput
                                  placeholder={tt("selectMediaCodec") || "请选择媒体编码"}
                                />
                              </ComboboxChips>
                              <ComboboxContent>
                                <ComboboxList>
                                  {mediaCodecOptions?.map((option) => (
                                    <ComboboxItem
                                      key={option.value}
                                      value={option.value}
                                      onSelect={(e) => {
                                        console.log("ComboboxItem selected:", option.value);
                                      }}
                                    >
                                      {option.label}
                                    </ComboboxItem>
                                  ))}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel className="text-muted-foreground">
                      {tt("autoRecord") || "自动录音"}
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name="auto_record"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="flex items-center gap-6"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="1" id="autoRecord-yes" />
                                <Label htmlFor="autoRecord-yes">{tc("yes") || "是"}</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="0" id="autoRecord-no" />
                                <Label htmlFor="autoRecord-no">{tc("no") || "否"}</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel className="text-muted-foreground">{tt("routeType")}</FormLabel>
                    <FormField
                      control={form.control}
                      name="route_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="flex items-center gap-6"
                            >
                              {routeType.map((item) => (
                                <div className="flex items-center gap-2" key={item.value}>
                                  <RadioGroupItem value={item.value} />
                                  <Label>{item.label}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel className="text-muted-foreground">{tt("proxyMedia")}</FormLabel>
                    <FormField
                      control={form.control}
                      name="proxy_media"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="flex items-center gap-6"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="1" />
                                <Label>{tc("yes") || "是"}</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="0" />
                                <Label>{tc("no") || "否"}</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel className="text-muted-foreground">{tt("enabledDID")}</FormLabel>
                    <FormField
                      control={form.control}
                      name="did_enabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="flex items-center gap-6"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="1" />
                                <Label>{tc("yes") || "是"}</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="0" />
                                <Label>{tc("no") || "否"}</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  {tc("cancel") || "取消"}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || selectedRoutes.length === 0}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  {tc("confirm") || "确定"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRouteSelectOpen} onOpenChange={setIsRouteSelectOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{tt("selectRoutes") || "请选择路由"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="col-span-1">
              <div className="mb-3 flex gap-2">
                <div className="relative flex-1">
                  <Input
                    className="pr-10"
                    placeholder={tc("search") || "请按名称搜索"}
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      setCurrentPageLeft(1);
                    }}
                  />
                  <SearchIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <Checkbox
                  id="select-all-routes"
                  checked={isSelectAll}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <label htmlFor="select-all-routes" className="cursor-pointer text-sm font-medium">
                  {tc("selectAll") || "全选"}
                </label>
              </div>

              <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
                {isLoadingRoutes ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-sm text-muted-foreground">加载中...</span>
                  </div>
                ) : paginatedRoutes.length > 0 ? (
                  paginatedRoutes.map((route) => (
                    <div key={route.id} className="flex items-center gap-2 py-1">
                      <Checkbox
                        id={`route-${route.id}`}
                        checked={selectedRouteIds.has(String(route.id))}
                        onCheckedChange={(checked) =>
                          handleRouteSelect(String(route.id), !!checked)
                        }
                      />
                      <label htmlFor={`route-${route.id}`} className="cursor-pointer text-sm">
                        [{route.id}]{route.name}
                        {route.prefix ? `|${route.prefix}` : ""}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-sm text-muted-foreground">
                      {tc("noData") || "暂无数据"}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={currentPageLeft <= 1}
                  onClick={() => setCurrentPageLeft((p) => p - 1)}
                >
                  &lt;
                </Button>
                <span className="mx-1 text-sm">
                  {currentPageLeft} / {totalPagesLeft}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={currentPageLeft >= totalPagesLeft}
                  onClick={() => setCurrentPageLeft((p) => p + 1)}
                >
                  &gt;
                </Button>
              </div>
            </div>

            <div className="col-span-1 border-l pl-4">
              <h4 className="text-sm font-medium mb-3">
                {tc("selectedCount", { count: selectedRoutesList.length }) ||
                  `已选择: ${selectedRoutesList.length}`}
              </h4>
              {selectedRoutesList.length > 0 ? (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {selectedRoutesList.map((route) => (
                    <div key={route.id} className="flex items-center justify-between text-sm">
                      <span>
                        [{route.id}]{route.name}
                        {route.prefix ? `|${route.prefix}` : ""}
                      </span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveRoute(String(route.id))}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookOpenIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{tc("noData") || "暂无数据"}</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRouteSelectOpen(false)}>
              {tc("cancel") || "取消"}
            </Button>
            <Button type="button" onClick={handleRouteSelectConfirm}>
              {tc("confirm") || "确定"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
