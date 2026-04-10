"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient, createUsersApi, type User, type UsersApi } from "@repo/api-client";
import { toast } from "sonner";
import {
  EditableSection,
  EditableField,
  type SelectOption,
} from "@/components/ui/editable-section";
import { use } from "react";
import { getApiBaseUrl } from "@/lib/api-base-url";

const apiClient = createClient({
  baseUrl: getApiBaseUrl(),
});

const usersApi: UsersApi = createUsersApi(apiClient);

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("users");
  const tc = useTranslations("common");

  const userId = resolvedParams.id;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contexts, setContexts] = useState<Array<{ id: string | number; name: string }>>([]);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [isExtensionsOpen, setIsExtensionsOpen] = useState(true);
  const [extensionForm, setExtensionForm] = useState({
    name: "",
    extn: "",
    password: "",
    context: "",
  });
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [isUserGroupsOpen, setIsUserGroupsOpen] = useState(true);

  // 获取登录用户信息
  const getLoginUserInfo = () => {
    try {
      const loginUserInfoStr = localStorage.getItem("loginUserInfo");
      return loginUserInfoStr ? JSON.parse(loginUserInfoStr) : null;
    } catch (error) {
      return null;
    }
  };

  const loginUserInfo = getLoginUserInfo();

  const loadUserDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getById(userId);
      setUser(response.data as User);
    } catch (error) {
      toast.error(tt("loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [userId, tt]);

  const loadContexts = useCallback(async () => {
    try {
      const response = await usersApi.contexts();
      const data = response.data;
      let contextsData: any[] = [];
      if (Array.isArray(data)) {
        contextsData = data;
      } else if (data && typeof data === "object" && "data" in data) {
        contextsData = Array.isArray(data.data) ? data.data : [];
      }
      setContexts(contextsData as Array<{ id: string | number; name: string }>);
    } catch (error) {
      setContexts([]);
    }
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    void loadUserDetail();
    void loadContexts();
  }, [userId, router, loadUserDetail, loadContexts]);

  const handleSave = async (formData: any) => {
    try {
      const formDataWithoutDisabled = formData;
      const updateData = {
        ...user,
        ...formDataWithoutDisabled,
        is_super: formData.is_super === tt("yes") ? "1" : "0",
        disabled: formData.disabled === tt("yes") ? true : false,
      };

      // 处理可能导致数据库错误的空字符串字段
      if (updateData.deleted_at === "") {
        updateData.deleted_at = null;
      }
      if (updateData.last_login_attempt_at === "") {
        updateData.last_login_attempt_at = null;
      }
      if (updateData.last_login_at === "") {
        updateData.last_login_at = null;
      }

      // 调用更新 API
      const response = await usersApi.update(userId, updateData);

      // 重新加载用户数据
      await loadUserDetail();
      toast.success(tc("saveSuccess"));
      return true;
    } catch (error) {
      toast.error(tc("saveFailed"));
      return false;
    }
  };

  const handleCancel = () => {};

  // 加载分机列表
  const loadExtensions = useCallback(async () => {
    try {
      const response = await usersApi.getExtensions(userId);
      const data = response.data;
      // 确保 data 是一个数组
      let extensionsData: any[] = [];
      if (Array.isArray(data)) {
        extensionsData = data;
      } else if (data && typeof data === "object" && "data" in data) {
        extensionsData = Array.isArray(data.data) ? data.data : [];
      }
      setExtensions(extensionsData || []);
      setTotalPages(1);
    } catch (error) {
      toast.error(`${tt("loadFailed")}`);
    }
  }, [userId, tt]);

  // 加载分机列表
  useEffect(() => {
    void loadExtensions();
  }, [loadExtensions]);

  // 创建分机
  const handleCreateExtension = async () => {
    try {
      const response = await usersApi.createExtension(userId, extensionForm);
      const obj = response.data;
      toast.success(tt("createdSuccessfully"));
      setShowExtensionModal(false);
      setExtensionForm({ name: "", extn: "", password: "", context: "" });
      void loadExtensions();
    } catch (error) {
      toast.error(`${tt("createFailed")}`);
    }
  };

  // 设置默认分机
  const handleSetDefault = async (extensionId: string, isDefault: boolean) => {
    try {
      if (isDefault) {
        await usersApi.setDefaultExtension(userId, extensionId, { is_default: 1 });
        if (user) {
          setUser({ ...user, extn_id: extensionId });
        }
      } else {
        if (extensions.length > 1) {
          const otherExtension = extensions.find((ext) => ext.id !== extensionId);
          if (otherExtension) {
            await usersApi.setDefaultExtension(userId, otherExtension.id, { is_default: 1 });
            if (user) {
              setUser({ ...user, extn_id: otherExtension.id });
            }
          }
        } else {
          await usersApi.update(userId, { extn_id: null });
          if (user) {
            setUser({ ...user, extn_id: null });
          }
        }
      }
    } catch (error) {
      toast.error(`${tt("operationFailed")}`);
    }
  };

  // 移除分机
  const handleRemoveExtension = async (extensionId: string) => {
    try {
      const response = await usersApi.removeExtension(userId, extensionId);
      const obj = response.data;
      toast.success(tt("removedSuccessfully"));
      void loadExtensions();
    } catch (error) {
      toast.error(`${tt("deleteError")}`);
    }
  };

  // 加载用户组
  const getUserGroup = useCallback(async () => {
    try {
      const response = await usersApi.getUserGroups(userId);
      const res = response.data;
      let userGroupsData: any[] = [];
      if (Array.isArray(res)) {
        userGroupsData = res;
      } else if (res && typeof res === "object" && "data" in res) {
        userGroupsData = Array.isArray(res.data) ? res.data : [];
      }
      setUserGroups(userGroupsData);
    } catch (err) {
      toast.error(`${tt("loadFailed")}`);
    }
  }, [userId, tt]);

  // 处理用户组删除
  const _handleGroupDelete = async (id: string) => {
    try {
      await usersApi.removeUserGroup(userId, id);
      toast.success(tc("deleteSuccess"));
      const updatedGroups = userGroups.filter((row) => row.id !== id);
      setUserGroups(updatedGroups);
    } catch (msg) {
      toast.error(`${tc("deleteError")}`);
    }
  };

  // 加载用户组
  useEffect(() => {
    void getUserGroup();
  }, [getUserGroup]);

  const userTypes: SelectOption[] = [
    { value: "NORMAL", label: tt("normal") },
    { value: "AGENT", label: tt("agent") },
  ];

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("users")} />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground">{tt("loading")}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("users")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {/* 面包屑导航 */}
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/users">{t("users")}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{user?.name || user?.login}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <EditableSection
                  title={tt("basicInfo")}
                  defaultValues={{
                    ...user,
                    context: (user as any)?.context || "",
                    is_super:
                      (user as any)?.is_super === 1 || (user as any)?.is_super === "1"
                        ? tt("yes")
                        : tt("no"),
                    disabled:
                      (user as any)?.disabled === 1 || (user as any)?.disabled === true
                        ? tt("yes")
                        : tt("no"),
                  }}
                  onSave={handleSave}
                  onCancel={handleCancel}
                >
                  <EditableField
                    label={tt("username")}
                    name="login"
                    value={user?.login}
                    type="text"
                    inputPlaceholder={tt("pleaseEnterUsername")}
                    required
                  />

                  <EditableField
                    label={tt("name")}
                    name="name"
                    value={user?.name || "-"}
                    type="text"
                    inputPlaceholder={tt("pleaseEnterName")}
                  />

                  <EditableField
                    label={tt("domain")}
                    name="domain"
                    value={user?.domain || "-"}
                    type="text"
                    inputPlaceholder={tt("pleaseEnterDomain")}
                  />

                  <EditableField
                    label={tt("login")}
                    name="login"
                    value={user?.login || "-"}
                    type="text"
                    disabled
                  />

                  <EditableField
                    label={tt("type")}
                    name="type"
                    value={user?.type || "-"}
                    type="select"
                    options={userTypes}
                  />

                  <EditableField
                    label={tt("phoneNumber")}
                    name="tel"
                    value={(user as any)?.tel || "-"}
                    type="text"
                    inputPlaceholder={tt("pleaseEnterPhoneNumber")}
                  />

                  <EditableField
                    label={tt("isSuperAdmin")}
                    name="is_super"
                    value={
                      (user as any)?.is_super === 1 || (user as any)?.is_super === "1"
                        ? tt("yes")
                        : tt("no")
                    }
                    type="text"
                    disabled
                  />

                  <EditableField
                    label={tt("lastLogin")}
                    name="last_login_at"
                    value={user?.last_login_at || "-"}
                    type="text"
                    disabled
                  />

                  <EditableField
                    label={tt("isDisabled")}
                    name="disabled"
                    value={(user as any)?.disabled}
                    type="switch"
                    switchCheckedValue={tt("yes")}
                    switchUncheckedValue={tt("no")}
                  />
                </EditableSection>

                {/* 分机表格 */}
                <div className="mt-8">
                  <div className="rounded-lg border bg-background">
                    {/* 头部 */}
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setIsExtensionsOpen(!isExtensionsOpen)}
                        >
                          <svg
                            className={`h-4 w-4 transition-transform ${isExtensionsOpen ? "rotate-90" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Button>
                        <h3 className="font-medium">{tt("extensions")}</h3>
                      </div>
                    </div>

                    {/* 内容 */}
                    {isExtensionsOpen && (
                      <div className="p-4">
                        <div className="flex items-center justify-end mb-4">
                          <Button size="sm" onClick={() => setShowExtensionModal(true)}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            {tt("addExtension")}
                          </Button>
                        </div>
                        <div className="overflow-hidden rounded-lg border">
                          <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted">
                              <TableRow>
                                <TableHead>{tt("id")}</TableHead>
                                <TableHead>{tt("name")}</TableHead>
                                <TableHead>{tt("extension")}</TableHead>
                                <TableHead>{tt("domain")}</TableHead>
                                <TableHead>{tt("createdAt")}</TableHead>
                                <TableHead>{tt("setAsDefault")}</TableHead>
                                <TableHead>{tt("operation")}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {extensions.length ? (
                                extensions.map((ext) => (
                                  <TableRow key={ext.id}>
                                    <TableCell>{ext.id}</TableCell>
                                    <TableCell>{ext.name}</TableCell>
                                    <TableCell>{ext.extn}</TableCell>
                                    <TableCell>{ext.domain}</TableCell>
                                    <TableCell>{ext.created_at}</TableCell>
                                    <TableCell>
                                      <Switch
                                        checked={(user as any)?.extn_id === ext.id}
                                        onCheckedChange={(checked) => {
                                          void handleSetDefault(ext.id, checked);
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => void handleRemoveExtension(ext.id)}
                                      >
                                        {tt("remove")}
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={7} className="h-24 text-center">
                                    {tt("noExtensions")}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="flex items-center justify-end mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                              onClick={() => setPage(Math.max(0, page - 1))}
                              disabled={page === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center justify-center w-8 h-8 rounded-md border bg-white text-gray-900">
                              {page + 1}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                              disabled={page >= totalPages - 1}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 用户组表格 */}
                <div className="mt-8">
                  <div className="rounded-lg border bg-background">
                    {/* 头部 */}
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setIsUserGroupsOpen(!isUserGroupsOpen)}
                        >
                          <svg
                            className={`h-4 w-4 transition-transform ${isUserGroupsOpen ? "rotate-90" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Button>
                        <h3 className="font-medium">{tt("userGroups") || "用户组"}</h3>
                      </div>
                    </div>

                    {/* 内容 */}
                    {isUserGroupsOpen && (
                      <div className="p-4">
                        <div className="overflow-hidden rounded-lg border">
                          <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted">
                              <TableRow>
                                <TableHead>{tt("id")}</TableHead>
                                <TableHead>{tt("name")}</TableHead>
                                <TableHead>{tt("domain")}</TableHead>
                                <TableHead>{tt("description") || "Description"}</TableHead>
                                <TableHead>{tt("operation")}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userGroups.length ? (
                                userGroups.map((group) => (
                                  <TableRow key={group.id}>
                                    <TableCell>{group.id}</TableCell>
                                    <TableCell>{group.name}</TableCell>
                                    <TableCell>{group.domain}</TableCell>
                                    <TableCell>{group.description || "-"}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => void _handleGroupDelete(group.id)}
                                      >
                                        {tt("remove")}
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5} className="h-24 text-center">
                                    {tt("noUserGroups") || "No user groups found."}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 新建分机模态框 */}
        <Dialog open={showExtensionModal} onOpenChange={setShowExtensionModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{tt("createExtension")}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleCreateExtension();
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{tt("name")}</Label>
                  <Input
                    id="name"
                    value={extensionForm.name}
                    onChange={(e) => setExtensionForm({ ...extensionForm, name: e.target.value })}
                    placeholder={tt("pleaseEnterName")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="extn">{tt("extension")}</Label>
                  <Input
                    id="extn"
                    value={extensionForm.extn}
                    onChange={(e) => setExtensionForm({ ...extensionForm, extn: e.target.value })}
                    placeholder="1000"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{tt("password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={extensionForm.password}
                    onChange={(e) =>
                      setExtensionForm({ ...extensionForm, password: e.target.value })
                    }
                    placeholder={tt("pleaseEnterPassword")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="context">{tt("context")}</Label>
                  <Select
                    value={extensionForm.context}
                    onValueChange={(value) =>
                      setExtensionForm({ ...extensionForm, context: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(contexts) ? contexts : []).map((item: any) => (
                        <SelectItem key={item.id} value={item.key}>
                          {`${item.name}(${item.key})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExtensionModal(false)}
                >
                  {tt("close")}
                </Button>
                <Button type="submit">{tt("submit")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
