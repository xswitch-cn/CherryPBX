"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchIcon, FileIcon, BookOpenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@repo/api-client";

const createUserSchema = z.object({
  login: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(1),
  type: z.string().min(1),
  extenEnable: z.boolean().default(true),
  extn: z.string().optional(),
  extn_password: z.string().optional(),
  context: z.string().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  contexts: Array<{ id: string | number; name: string }>;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  contexts,
}: CreateUserDialogProps) {
  const t = useTranslations("users");
  const tt = useTranslations("table");

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: {
      login: "",
      name: "",
      password: "",
      type: "",
      extenEnable: true,
      extn: "",
      extn_password: "",
      context: "",
    },
  });

  const handleSubmit = async (data: CreateUserFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch {
      // 错误在父组件处理
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("addUser")}</DialogTitle>
          <DialogDescription>{t("addUserDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(handleSubmit)(e);
            }}
          >
            <div className="grid gap-4 py-4">
              {/* 用户名 */}
              <FormField
                control={form.control}
                name="login"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right">
                      <span className="text-destructive mr-1">*</span>
                      {t("username")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* 姓名 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right">
                      <span className="text-destructive mr-1">*</span>
                      {t("name")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* 登录密码 */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right">
                      <span className="text-destructive mr-1">*</span>
                      {t("loginPassword")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* 用户类型 */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right w-full">
                      <span className="text-destructive mr-1">*</span>
                      {t("type")}
                    </FormLabel>
                    <FormControl className="col-span-8">
                      <div className="w-full">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NORMAL">{t("normal")}</SelectItem>
                            <SelectItem value="AGENT">{t("agent")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage className="col-span-8 col-start-5" />
                  </FormItem>
                )}
              />

              {/* 启用分机 */}
              <FormField
                control={form.control}
                name="extenEnable"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-12 items-center gap-x-4">
                    <FormLabel className="col-span-4 text-right">{t("extenEnable")}</FormLabel>
                    <FormControl className="col-span-8">
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* 分机号 */}
              {form.watch("extenEnable") && (
                <FormField
                  control={form.control}
                  name="extn"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-12 items-center gap-x-4">
                      <FormLabel className="col-span-4 text-right">
                        {t("extensionNumber")}
                      </FormLabel>
                      <FormControl className="col-span-8">
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* 分机密码 */}
              {form.watch("extenEnable") && (
                <FormField
                  control={form.control}
                  name="extn_password"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-12 items-center gap-x-4">
                      <FormLabel className="col-span-4 text-right">
                        {t("extensionPassword")}
                      </FormLabel>
                      <FormControl className="col-span-8">
                        <Input type="password" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* 上下文 */}
              {form.watch("extenEnable") && (
                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-12 items-center gap-x-4">
                      <FormLabel className="col-span-4 w-full text-right">{t("context")}</FormLabel>
                      <div className="col-span-8 w-full">
                        <Select value={field.value || "context-1"} onValueChange={field.onChange}>
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
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tt("close") || "关闭"}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? tt("submitting") || "提交中..."
                  : tt("submit") || "提交"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (id: string) => Promise<void>;
}

export function DeleteUserDialog({ open, onOpenChange, user, onSubmit }: DeleteUserDialogProps) {
  const t = useTranslations("users");

  // 移除handleSubmit函数，直接在按钮的onClick中调用onSubmit

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t("deleteUser")}</DialogTitle>
          <DialogDescription>{t("deleteUserDescription")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (user) {
                console.log("Delete user:", user.id);
                void onSubmit(user.id);
              }
            }}
          >
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BatchSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsers: User[];
  allUsers: User[];
  onSelectionChange: (selectedUsers: User[]) => void;
  onSubmit: (data: { type: string }) => Promise<void>;
}

export function BatchSettingsDialog({
  open,
  onOpenChange,
  selectedUsers,
  allUsers,
  onSelectionChange,
  onSubmit,
}: BatchSettingsDialogProps) {
  const [isUserSelectOpen, setIsUserSelectOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(selectedUsers.map((user) => user.id)),
  );
  const [isSelectAll, setIsSelectAll] = useState(false);

  const form = useForm<{ type: string }>({
    defaultValues: {
      type: "",
    },
  });

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked);
    const allUserIds = allUsers.map((user) => user.id);
    if (checked) {
      setSelectedUserIds(new Set(allUserIds));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  // 处理单个用户选择
  const handleUserSelect = (userId: string, checked: boolean) => {
    const newSelectedUserIds = new Set(selectedUserIds);
    if (checked) {
      newSelectedUserIds.add(userId);
    } else {
      newSelectedUserIds.delete(userId);
    }
    setSelectedUserIds(newSelectedUserIds);
    // 检查是否所有用户都被选中
    const allUserIds = allUsers.map((user) => user.id);
    setIsSelectAll(allUserIds.every((id) => newSelectedUserIds.has(id)));
  };

  // 处理用户选择确认
  const handleUserSelectConfirm = () => {
    // 根据 selectedUserIds 从 allUsers 中获取选中的用户
    const selected = allUsers.filter((user) => selectedUserIds.has(user.id));
    // 调用父组件传递的回调函数来更新 selectedUsers
    onSelectionChange(selected);
    setIsUserSelectOpen(false);
  };

  const handleSubmit = async (data: { type: string }) => {
    console.log("handleSubmit called with data:", data);
    console.log("onSubmit:", onSubmit);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("handleSubmit error:", error);
      // 错误在父组件处理
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>批量设置</DialogTitle>
            <DialogDescription>选择用户并设置类型</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit(handleSubmit)(e);
              }}
            >
              <div className="grid gap-6 py-6">
                {/* 选择用户 */}
                <div className="flex flex-col gap-2">
                  <FormLabel>请选择用户</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start px-4 py-3 text-left"
                    onClick={() => setIsUserSelectOpen(true)}
                  >
                    <BookOpenIcon
                      className={`mr-2 h-4 w-4 ${selectedUsers.length > 0 ? "text-green-500" : "text-muted-foreground"}`}
                    />
                    {selectedUsers.length > 0 ? `已选择: ${selectedUsers.length}` : "请选择用户"}
                  </Button>
                </div>

                {/* 类型 */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <FormLabel>
                        <span className="text-destructive mr-1">*</span>
                        类型
                      </FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="请选择类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AGENT">坐席</SelectItem>
                            <SelectItem value="NORMAL">普通</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                  )}
                />
              </div>

              <DialogFooter className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-green-500 hover:bg-green-600"
                >
                  确定
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 用户选择弹窗 */}
      <Dialog open={isUserSelectOpen} onOpenChange={setIsUserSelectOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>请选择用户</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* 左侧用户列表 */}
            <div className="col-span-1">
              <div className="mb-4">
                <div className="relative">
                  <Input className="pr-10" />
                  <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="select-all"
                    checked={isSelectAll}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                    全选
                  </label>
                </div>
                {/* 用户列表 */}
                {allUsers.map((user, index) => (
                  <div key={index} className="flex items-center">
                    <Checkbox
                      id={`user-${index}`}
                      checked={selectedUserIds.has(user.id)}
                      onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`user-${index}`}
                      className="ml-2 text-sm"
                    >{`${user.login}|${user.name}|xswitch.cn|${user.id}`}</label>
                  </div>
                ))}
              </div>
              {/* 分页 */}
              <div className="mt-4 flex items-center justify-center">
                <Button variant="ghost" size="sm" disabled>
                  &lt;
                </Button>
                <span className="mx-2">1 / 1</span>
                <Button variant="ghost" size="sm" disabled>
                  &gt;
                </Button>
              </div>
            </div>
            {/* 右侧已选择用户 */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              {selectedUserIds.size > 0 ? (
                <div className="w-full">
                  <h4 className="text-sm font-medium mb-2">已选择用户</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allUsers
                      .filter((user) => selectedUserIds.has(user.id))
                      .map((user, index) => (
                        <div
                          key={index}
                          className="text-sm"
                        >{`${user.login}|${user.name}|xswitch.cn|${user.id}`}</div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <FileIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">暂无数据</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsUserSelectOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleUserSelectConfirm}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
