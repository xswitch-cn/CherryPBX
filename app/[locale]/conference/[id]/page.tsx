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
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import { type Conference } from "@/lib/api-client";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { conferencesApi } from "@/lib/api-client";

export default function ConferenceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const conferenceId = parseInt(params.id || "0");
  const t = useTranslations("pages");
  const tt = useTranslations("conference");
  const tc = useTranslations("common");

  const [conference, setConference] = useState<Conference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceDomain, setForceDomain] = useState<string>("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [videoModes, setVideoModes] = useState<any[]>([]);
  const [callPermissions, setCallPermissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);

  // 加载conference详情
  const loadConferenceDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      // 并行获取所有数据
      const [
        conferenceResponse,
        forceDomainResponse,
        profilesResponse,
        videoModesResponse,
        callPermissionsResponse,
        usersResponse,
        mediaFilesResponse,
      ] = await Promise.all([
        conferencesApi.get(conferenceId),
        conferencesApi.getForceDomain(),
        conferencesApi.getProfiles(),
        conferencesApi.getVideoModes(),
        conferencesApi.getCallPermissions(),
        conferencesApi.getUsers(),
        conferencesApi.getMediaFiles(conferenceId),
      ]);

      // 处理会议详情
      const foundConference = conferenceResponse.data as Conference;
      if (foundConference) {
        setConference(foundConference);
      } else {
        setConference(null);
      }

      // 处理其他数据
      setForceDomain((forceDomainResponse.data as string) || "");
      setProfiles((profilesResponse.data as any[]) || []);
      setVideoModes((videoModesResponse.data as any[]) || []);
      setCallPermissions((callPermissionsResponse.data as any[]) || []);

      // 处理用户数据，添加空选项
      const usersData = (usersResponse.data as any[]) || [];
      usersData.unshift({ id: 0, extn: "----", name: "" });
      setUsers(usersData);

      setMediaFiles((mediaFilesResponse.data as any[]) || []);
    } catch (error) {
      console.error("Failed to load conference detail:", error);
      toast.error(tt("loadFailed"));
      setConference(null);
    } finally {
      setIsLoading(false);
    }
  }, [conferenceId, tt]);

  // 保存编辑
  const handleSave = useCallback(
    async (formData: any) => {
      if (!conference) return false;

      try {
        // 处理banner数据
        const videoBanner = {
          fontFace: conference.banner?.fontFace || "",
          fontScale: formData.fontScale || 1,
          bgColor: formData.backgroundColor || "#000000",
          fgColor: formData.subtitleColor || "#ffffff",
          text: formData.subtitle || "",
        };

        const updateData = {
          id: conference.id,
          name: formData.name,
          description: formData.description,
          number: formData.number,
          domain: formData.domain,
          capacity: formData.capacity || "10",
          canvas_count: formData.canvasCount || "1",
          video_mode: formData.videoMode,
          template: formData.template,
          fps: formData.videoFrameRate || "15",
          bandwidth: formData.bandwidth || "1mb",
          call_permission: formData.callPermission,
          subtitle_size: formData.subtitleSize,
          subtitle: formData.subtitle,
          background_color: formData.backgroundColor,
          subtitle_color: formData.subtitleColor,
          password: formData.password,
          admin_password: formData.adminPassword,
          enable_agora: formData.enableAgora,
          auto_mute: formData.autoMute,
          stream_address: formData.streamAddress,
          banner: JSON.stringify(videoBanner),
        };

        // 处理集群数据
        if (formData.cluster) {
          const cluster: { host: string; weight: string }[] = [];
          let line = 1;
          let errors = "";
          const rows = formData.cluster.split(/\r?\n/).map((row: string) => {
            const item = row.split(" ");

            if (!item[0]) return null;

            if (
              !item[0].match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:?(\d{2,5})?$/) &&
              !item[0].match(/\./)
            ) {
              errors += "error line: " + line + "\n";
            }

            if (!item[1]) item[1] = "1";

            cluster.push({ host: item[0], weight: item[1] });
            line++;
          });

          if (errors) {
            alert(errors);
            return false;
          }

          if (cluster.length) {
            (updateData as any).cluster = cluster;
          }
        }

        await conferencesApi.update(conference.id, updateData);

        // 更新本地状态
        const updatedConference: Conference = {
          ...conference,
          name: formData.name,
          description: formData.description,
          number: formData.number,
          domain: formData.domain,
          capacity: formData.capacity,
          banner: videoBanner,
          enable_agora: formData.enableAgora,
        };
        setConference(updatedConference);

        toast.success("保存成功");
        return true;
      } catch (error) {
        console.error("Failed to update conference:", error);
        toast.error("保存失败");
        return false;
      }
    },
    [conference],
  );

  const handleCancel = useCallback(() => {}, []);

  // 返回列表页
  const handleBack = useCallback(() => {
    router.push("/conference");
  }, [router]);

  // 初始化
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadConferenceDetail();
  }, [router, loadConferenceDetail]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("conference")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            {/* <div className="text-center">{t("loading")}</div> */}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!conference) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("conference")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">未找到会议室</div>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              返回列表
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("conference")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  {/* 面包屑导航 */}
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/conference">{t("conference")}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{conference.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>

                  {/* 会议室详情 */}
                  <EditableSection
                    title="基本信息"
                    defaultValues={{
                      ...conference,
                      manager: "",
                      canvasCount: 1,
                      videoMode: "融屏",
                      template: "[example]conference profile",
                      videoFrameRate: 15,
                      bandwidth: "1mb",
                      callPermission: "",
                      subtitleSize: 2,
                      subtitle: "",
                      backgroundColor: "black",
                      subtitleColor: "",
                      password: "",
                      adminPassword: "",
                      enableAgora: false,
                      autoMute: false,
                      streamAddress: "",
                    }}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  >
                    <EditableField
                      label={tt("name")}
                      name="name"
                      value={conference.name}
                      type="text"
                      required
                    />
                    <EditableField
                      label={tt("description")}
                      name="description"
                      value={conference.description || "-"}
                      type="text"
                    />
                    <EditableField
                      label={tt("number")}
                      name="number"
                      value={conference.number}
                      type="text"
                      required
                    />
                    <EditableField
                      label={tt("capacity")}
                      name="capacity"
                      value={conference.capacity}
                      type="number"
                    />
                    <EditableField label="管理员" name="manager" value="-" type="text" />
                    <EditableField label="画布个数" name="canvasCount" value={1} type="number" />
                    <EditableField label="视频模式" name="videoMode" value="融屏" type="text" />
                    <EditableField
                      label={tt("domain")}
                      name="domain"
                      value={conference.domain}
                      type="text"
                    />
                    <EditableField
                      label="会议模板"
                      name="template"
                      value="[example]conference profile"
                      type="text"
                      required
                    />
                    <EditableField
                      label="视频帧率"
                      name="videoFrameRate"
                      value={15}
                      type="number"
                    />
                    <EditableField label="带宽" name="bandwidth" value="1mb" type="text" />
                    <EditableField label="呼叫权限" name="callPermission" value="-" type="text" />
                    <EditableField label="字幕大小" name="subtitleSize" value={2} type="number" />
                    <EditableField label="字幕" name="subtitle" value="-" type="text" />
                    <EditableField
                      label="背景颜色"
                      name="backgroundColor"
                      value="black"
                      type="text"
                    />
                    <EditableField label="字幕颜色" name="subtitleColor" value="-" type="text" />
                    <EditableField label="密码" name="password" value="-" type="password" />
                    <EditableField
                      label="管理员密码"
                      name="adminPassword"
                      value="-"
                      type="password"
                    />
                    <EditableField
                      label="启用声网"
                      name="enableAgora"
                      value={false}
                      type="switch"
                      // switchCheckedValue={tt("yes")}
                      switchUncheckedValue={tt("no")}
                    />
                    <EditableField
                      label="自动禁言"
                      name="autoMute"
                      value={false}
                      type="switch"
                      switchCheckedValue={tt("yes")}
                      switchUncheckedValue={tt("no")}
                    />
                    <EditableField label="推流地址" name="streamAddress" value="-" type="text" />
                  </EditableSection>

                  {/* 与会者 */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">与会者</h3>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          编辑
                        </Button>
                        <Button size="sm">添加与会者</Button>
                        <Button size="sm">添加组成员</Button>
                      </div>
                    </div>
                  </div>

                  {/* 媒体文件 */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">媒体文件</h3>
                      <Button size="sm">+ 添加媒体文件</Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">名称</th>
                            <th className="px-4 py-3 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={3} className="px-4 py-10 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-12 h-12 mb-2 text-muted-foreground">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-12 h-12"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.25-1.5H9.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h7.5c.621 0 1.125-.504 1.125-1.125V10.5a1.125 1.125 0 0 0-1.125-1.125Z"
                                    />
                                  </svg>
                                </div>
                                <p className="text-muted-foreground">暂无数据</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
