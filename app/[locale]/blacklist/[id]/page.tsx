"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  PlusIcon,
  UploadIcon,
  EditIcon,
  XIcon,
  Edit2Icon,
  CloudUploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { type Blacklist, type BlacklistNumber } from "../blacklist-columns";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { EditableTable } from "@/components/ui/editable-table";
import { blacklistsApi } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 模拟号码列表数据
const mockNumberData: BlacklistNumber[] = [];

export default function BlacklistDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const blacklistId = parseInt(params.id || "0");
  const t = useTranslations("pages");
  const tt = useTranslations("blacklist");
  const ttt = useTranslations("table");

  const [blacklist, setBlacklist] = useState<Blacklist | null>(null);
  const [numbers, setNumbers] = useState<BlacklistNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newNumber, setNewNumber] = useState<{ k: string; v: string }>({ k: "", v: "" });
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [isTableEditing, setIsTableEditing] = useState(false);

  // 名单类型映射
  const list_type_map = {
    "0": tt("blacklist"),
    "1": tt("whitelist"),
  };

  // 限制用户类型映射
  const limit_user_type_map = {
    "0": tt("caller"),
    "1": tt("called"),
    "2": tt("callerAndCalled"),
  };

  // 加载黑白名单详情
  const loadBlacklistDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = (await blacklistsApi.get(blacklistId)) as any;
      const data = response.data;
      setBlacklist({
        id: data.id,
        name: data.name,
        description: data.description,
        listType: data.list_type,
        userType: data.limit_user_type,
      });
      setNumbers(data.params || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load blacklist detail:", error);
      toast.error(tt("loadFailed"));
      setBlacklist(null);
      setIsLoading(false);
    }
  }, [blacklistId, tt]);

  // 保存编辑
  const handleSave = useCallback(
    async (formData: any) => {
      if (!blacklist) return false;

      try {
        // 转换字段名，使用正确的数据库字段名
        const updateData = {
          name: formData.name,
          list_type: formData.listType,
          limit_user_type: formData.userType,
          description: formData.description,
        };

        await blacklistsApi.update(blacklist.id, updateData);
        const updatedBlacklist: Blacklist = {
          ...blacklist,
          ...formData,
        };
        setBlacklist(updatedBlacklist);
        setIsEditMode(false);
        toast.success(tt("saveSuccess"));
        return true;
      } catch (error) {
        console.error("Failed to update blacklist:", error);
        toast.error(tt("saveFailed"));
        return false;
      }
    },
    [blacklist, tt],
  );

  // 处理添加号码
  const handleAddNumber = useCallback(async () => {
    if (!blacklist || !newNumber.k) return;

    try {
      const response = (await blacklistsApi.addNumber(blacklist.id, newNumber)) as any;
      const data = response.data;
      if (data.code === 200) {
        const newNumberWithId = {
          ...newNumber,
          id: data.data,
        };
        setNumbers((prev) => [...prev, newNumberWithId]);
        setNewNumber({ k: "", v: "" });
        setIsAddModalOpen(false);
        toast.success(tt("addSuccess"));
      } else {
        toast.error(`${tt("addFailed")}: ${data.message || data.text || data}`);
      }
    } catch (error) {
      console.error("Failed to add number:", error);
      toast.error(tt("addFailed"));
    }
  }, [blacklist, newNumber, tt]);

  // 处理删除号码
  const handleDeleteNumber = useCallback(
    async (number: any, rowId: string) => {
      if (!blacklist) return;

      try {
        const num = { id: parseInt(rowId), k: number.k, v: number.v };
        await blacklistsApi.deleteNumber(blacklist.id, num.id);
        setNumbers((prev) => prev.filter((item) => item.id !== num.id));
        toast.success(tt("deleteSuccess"));
      } catch (error) {
        console.error("Failed to delete number:", error);
        toast.error(tt("deleteFailed"));
      }
    },
    [blacklist, tt],
  );

  // 处理文件上传
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImportFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
    }
  }, []);

  // 处理导入号码
  const handleImportNumbers = useCallback(async () => {
    if (!blacklist) return;

    try {
      // 处理文件上传
      if (importFiles.length === 0) {
        toast.error(ttt("selectFileError"));
        return;
      }

      // 处理每个文件
      for (const file of importFiles) {
        await new Promise<void>((resolve, _reject) => {
          // 读取并解析Excel文件
          const fileReader = new FileReader();
          fileReader.readAsArrayBuffer(file);

          fileReader.onload = async (event) => {
            try {
              const { result } = event.target as FileReader;

              if (!result) {
                throw new Error(tt("importFailed"));
              }

              // 动态导入xlsx库
              const xlsxModule = await import("xlsx");
              const XLSX = xlsxModule.default || xlsxModule;

              if (!XLSX || typeof XLSX.read !== "function") {
                throw new Error(tt("importFailed"));
              }

              const workbook = XLSX.read(result, { type: "array" });
              let data: any[] = [];

              if (workbook && workbook.Sheets) {
                for (const sheet in workbook.Sheets) {
                  if (Object.prototype.hasOwnProperty.call(workbook.Sheets, sheet)) {
                    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
                      raw: false,
                    });
                    data = [...data, ...sheetData];
                  }
                }
              }

              // 处理数据格式
              const importData = data
                .map((row: any) => {
                  // 尝试不同的列名
                  const k = row.name || row.K || row.Name || row.NAME || row.名称;
                  const v =
                    row.numberPrefix ||
                    row.V ||
                    row.Number ||
                    row.NUMBER ||
                    row.号码 ||
                    row.号码前缀;
                  if (k && v) {
                    return { k, v };
                  }
                  return null;
                })
                .filter(Boolean);

              if (importData.length === 0) {
                toast.error(`${file.name} ${tt("importFailed")}`);
                resolve();
                return;
              }

              // 发送数据到服务器
              const response = (await blacklistsApi.importNumbers(blacklist.id, importData)) as any;
              const responseData = response.data;
              if (responseData.data) {
                setNumbers((prev) => [...prev, ...responseData.data]);
                toast.success(
                  `${file.name} ${tt("importSuccess")}: ${importData.length} ${tt("items")}`,
                );
              }
              resolve();
            } catch (error) {
              console.error(`Failed to parse Excel file ${file.name}:`, error);
              toast.error(`${file.name} ${tt("importFailed")}: ${tt("importFileError")}`);
              resolve(); // 继续处理下一个文件
            }
          };

          fileReader.onerror = () => {
            console.error(`Failed to read file ${file.name}`);
            toast.error(`${file.name} ${tt("importReadError")}`);
            resolve(); // 继续处理下一个文件
          };
        });
      }

      setIsImportModalOpen(false);
      setImportFiles([]);
    } catch (error) {
      console.error("Failed to import numbers:", error);
      toast.error(tt("importFailed"));
    }
  }, [blacklist, importFiles, tt, ttt]);

  // 处理删除黑白名单
  const handleDeleteBlacklist = useCallback(async () => {
    if (!blacklist) return;

    if (confirm(`${tt("Delete List")}: ${blacklist.name}?`)) {
      try {
        await blacklistsApi.delete(blacklist.id);
        toast.success(tt("deleteSuccess"));
        router.push("/blacklist");
      } catch (error) {
        console.error("Failed to delete blacklist:", error);
        toast.error(tt("deleteFailed"));
      }
    }
  }, [blacklist, router, tt]);

  const handleCancel = useCallback(() => {}, []);

  // 返回列表页
  const handleBack = useCallback(() => {
    router.push("/blacklist");
  }, [router]);

  // 初始化
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadBlacklistDetail();
  }, [router, loadBlacklistDetail]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("blacklist")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">{tt("loading")}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!blacklist) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("blacklist")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">{tt("blacklistNotFound")}</div>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {tt("backToList")}
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // 号码列表列配置
  const numberColumns = [
    {
      accessorKey: "k",
      header: tt("name"),
      cell: ({ row }: { row: any }) => row.getValue("k"),
    },
    {
      accessorKey: "v",
      header: tt("numberPrefix"),
      cell: ({ row }: { row: any }) => row.getValue("v"),
    },
    {
      id: "actions",
      header: tt("actions"),
      cell: ({ row }: { row: any }) => {
        const number = row.original as BlacklistNumber;
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800"
            onClick={() => void handleDeleteNumber(number, number.id.toString())}
          >
            {tt("delete")}
          </Button>
        );
      },
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("blacklist")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  {/* 面包屑导航 */}
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/blacklist">{t("blacklist")}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{blacklist.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>

                  <EditableSection
                    title={tt("basicInfo")}
                    defaultValues={{
                      ...blacklist,
                      listType: String(blacklist.listType),
                      userType: String(blacklist.userType),
                    }}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  >
                    <EditableField
                      label={tt("name")}
                      name="name"
                      value={blacklist.name}
                      type="text"
                      required
                    />

                    <EditableField
                      label={tt("listType")}
                      name="listType"
                      value={String(blacklist.listType)}
                      type="select"
                      options={[
                        { value: "0", label: tt("blacklist") },
                        { value: "1", label: tt("whitelist") },
                      ]}
                      required
                    />

                    <EditableField
                      label={tt("userType")}
                      name="userType"
                      value={String(blacklist.userType)}
                      type="select"
                      options={[
                        { value: "0", label: tt("caller") },
                        { value: "1", label: tt("called") },
                        { value: "2", label: tt("callerAndCalled") },
                      ]}
                      required
                    />

                    <EditableField
                      label={tt("description")}
                      name="description"
                      value={blacklist.description || "-"}
                      type="text"
                    />
                  </EditableSection>

                  {/* 号码列表 */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">{tt("numberList")}</h3>
                      <div className="flex items-center gap-2">
                        {isTableEditing ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsTableEditing(false)}
                          >
                            <XIcon className="mr-2 h-4 w-4" />
                            {tt("cancel")}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsTableEditing(true)}
                          >
                            <Edit2Icon className="mr-2 h-4 w-4" />
                            {tt("edit")}
                          </Button>
                        )}
                        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                          <PlusIcon className="mr-2 h-4 w-4" />
                          {tt("add")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsImportModalOpen(true)}
                        >
                          <UploadIcon className="mr-2 h-4 w-4" />
                          {tt("import")}
                        </Button>
                      </div>
                    </div>
                    <EditableTable
                      columns={[
                        {
                          key: "k",
                          header: tt("name"),
                          type: isTableEditing ? "text" : undefined,
                        },
                        {
                          key: "v",
                          header: tt("numberPrefix"),
                          type: isTableEditing ? "text" : undefined,
                        },
                        {
                          key: "action",
                          header: tt("actions"),
                          type: "action",
                          actions: [
                            {
                              type: "delete",
                              label: tt("delete"),
                            },
                          ],
                        },
                      ]}
                      data={numbers as any}
                      getRowId={(row: any) => row.id.toString()}
                      onDelete={async (row: any, rowId: string) => {
                        await handleDeleteNumber(row, rowId);
                      }}
                      onChange={(change) => {
                        if (!blacklist) return;

                        blacklistsApi
                          .updateNumber(blacklist.id, change.rowId, {
                            k: change.rowData.k,
                            v: change.rowData.v,
                          })
                          .then(() => {
                            // 更新本地状态
                            setNumbers((prev) =>
                              prev.map((num) =>
                                num.id === parseInt(change.rowId)
                                  ? {
                                      ...num,
                                      k: change.rowData.k as string,
                                      v: change.rowData.v as string,
                                    }
                                  : num,
                              ),
                            );
                            toast.success(tt("saveSuccess"));
                          })
                          .catch((error) => {
                            console.error("Failed to update number:", error);
                            toast.error(tt("saveFailed"));
                          });
                      }}
                      isEditing={isTableEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* 添加号码模态框 */}
      {isAddModalOpen && (
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{tt("addBlacklistNumber")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* 名称 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right">
                  <span className="text-destructive mr-1">*</span>
                  {tt("name")}
                </Label>
                <div className="col-span-8">
                  <Input
                    value={newNumber.k}
                    onChange={(e) => setNewNumber({ ...newNumber, k: e.target.value })}
                    placeholder={tt("name")}
                  />
                </div>
              </div>
              {/* 号码前缀 */}
              <div className="grid grid-cols-12 items-center gap-x-4">
                <Label className="col-span-4 text-right">
                  <span className="text-destructive mr-1">*</span>
                  {tt("numberPrefix")}
                </Label>
                <div className="col-span-8">
                  <Input
                    value={newNumber.v}
                    onChange={(e) => setNewNumber({ ...newNumber, v: e.target.value })}
                    placeholder={tt("numberPrefix")}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {tt("close")}
              </Button>
              <Button onClick={() => void handleAddNumber()}>{tt("submit")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 导入号码模态框 */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{ttt("importTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="border border-dashed rounded-lg p-10 text-center"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-primary");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-primary");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-primary");
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  setImportFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
                }
              }}
            >
              <CloudUploadIcon className="mx-auto h-16 w-16 text-primary mb-6" />
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {ttt("dragFiles")}
                  <Button
                    variant="default"
                    className="ml-2 bg-primary text-white hover:bg-primary/90"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    {ttt("selectFile")}
                  </Button>
                </p>
                <p className="text-xs text-gray-500">{ttt("fileFormatHint")}</p>
              </div>
              <input
                type="file"
                id="file-upload"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />
            </div>

            {importFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {importFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md">
                    <div className="flex items-center gap-2">
                      <CloudUploadIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImportFiles((prev) => prev.filter((_, i) => i !== index))}
                    >
                      {ttt("deleteFile")}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFiles([]);
                }}
              >
                {ttt("closeImport")}
              </Button>
              <Button
                onClick={() => void handleImportNumbers()}
                className="ml-2 bg-primary text-white hover:bg-primary/90"
                disabled={importFiles.length === 0}
              >
                {ttt("submitImport")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
