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
import { ArrowLeftIcon, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { type Conference } from "@/lib/api-client";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { conferencesApi } from "@/lib/api-client";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";
import { AddGroupMembersDialog } from "../components/AddGroupMembersDialog";
import { AddMediaDialog } from "../components/AddMediaDialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [participants, setParticipants] = useState<any[]>([]);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddGroupMembersOpen, setIsAddGroupMembersOpen] = useState(false);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);

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
        participantsResponse,
      ] = await Promise.all([
        conferencesApi.get(conferenceId),
        conferencesApi.getForceDomain(),
        conferencesApi.getProfiles(),
        conferencesApi.getVideoModes(),
        conferencesApi.getCallPermissions(),
        conferencesApi.getUsers(),
        conferencesApi.getMediaFiles(conferenceId),
        fetch(`/api/conference_rooms/${conferenceId}/members`),
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

      // 处理与会者数据
      const participantsData = await participantsResponse.json();
      setParticipants((participantsData.data || participantsData) as any[]);
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
          nbr: formData.nbr,
          realm: formData.realm,
          capacity: formData.capacity || "10",
          canvas_count: formData.canvas_count || "1",
          video_mode: formData.video_mode,
          profile_id: formData.profile_id,
          fps: formData.fps || "15",
          bandwidth: formData.bandwidth || "1mb",
          call_perm: formData.call_perm,
          pin: formData.password,
          admin_pin: formData.admin_pin,
          enable_agora: formData.enable_agora,
          agora_appid: formData.agora_appid,
          agora_token: formData.agora_token,
          agora_channel: formData.agora_channel,
          auto_mute: formData.auto_mute,
          stream_address: formData.stream_address,
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
          nbr: formData.number,
          realm: formData.realm,
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

  // 处理添加与会者
  const handleAddParticipant = useCallback(
    async (data: any) => {
      try {
        if (!conference) return;

        const participantData = {
          name: data.name,
          num: data.number,
          room_id: conference.id,
        };

        await conferencesApi.addMembers(conference.id, [participantData]);
        toast.success("添加成功");
        // 这里可以添加刷新与会者列表的逻辑
      } catch (error) {
        console.error("Failed to add participant:", error);
        toast.error("添加失败");
        throw error;
      }
    },
    [conference],
  );

  // 处理添加媒体文件
  const handleAddMedia = useCallback((media: any) => {
    setMediaFiles((prev) => [...prev, media]);
  }, []);

  // 处理添加组成员成功后的回调
  const handleMembersAdded = useCallback(async () => {
    if (!conference) return;
    // 刷新与会者列表
    const response = await fetch(`/api/conference_rooms/${conference.id}/members`);
    const data = await response.json();
    setParticipants((data.data || data) as any[]);
  }, [conference]);

  // 处理设为管理员
  const handleSetAsModerator = useCallback(
    async (id: number) => {
      if (!conference) return;
      try {
        const response = await fetch(`/api/conference_rooms/moderator/${conference.id}/${id}`, {
          method: "PUT",
        });
        const member = await response.json();

        // 更新本地状态
        setParticipants((prev) =>
          prev.map((p) => (p.id === id ? { ...p, disabled: String(member.disabled) } : p)),
        );

        toast.success("设置成功");
      } catch (error) {
        console.error("Failed to set moderator:", error);
        toast.error("设置失败");
      }
    },
    [conference],
  );

  // 处理删除与会者
  const handleDeleteParticipant = useCallback(
    async (id: number) => {
      if (!conference) return;
      try {
        await fetch(`/api/conference_rooms/${conference.id}/members/${id}`, {
          method: "DELETE",
        });

        // 更新本地状态
        setParticipants((prev) => prev.filter((p) => p.id !== id));

        toast.success("删除成功");
      } catch (error) {
        console.error("Failed to delete participant:", error);
        toast.error("删除失败");
      }
    },
    [conference],
  );

  // 处理添加与会者成功后的回调
  const handleMemberAdded = useCallback(async () => {
    if (!conference) return;
    // 刷新与会者列表
    const response = await fetch(`/api/conference_rooms/${conference.id}/members`);
    const data = await response.json();
    setParticipants((data.data || data) as any[]);
  }, [conference]);

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
                      moderator: conference.moderator || "",
                      canvas_count: conference.canvas_count || "1",
                      video_mode: conference.video_mode || "CONF_VIDEO_MODE_PASSTHROUGH",
                      profile_id: conference.profile_id || "",
                      fps: conference.fps || "15",
                      bandwidth: conference.bandwidth || "1mb",
                      call_perm: conference.call_permission || "",
                      subtitleSize: "2",
                      subtitle: "${caller_id_number} ${caller_id_name}",
                      backgroundColor: "black",
                      subtitleColor: "white",
                      password: conference.pin || "",
                      admin_pin: conference.admin_pin || "",
                      enable_agora: conference.enable_agora || false,
                      agora_appid: conference.agora_appid || "",
                      agora_token: conference.agora_token || "",
                      agora_channel: conference.agora_channel || "",
                      auto_mute: false,
                      stream_address: "",
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
                      name="nbr"
                      value={conference.nbr}
                      type="text"
                      required
                    />
                    <EditableField
                      label={tt("capacity")}
                      name="capacity"
                      value={conference.capacity || 10}
                      type="number"
                    />
                    <EditableField
                      label={tt("moderator")}
                      name="moderator"
                      value={conference.moderator || "-"}
                      type="text"
                    />
                    <EditableField
                      label={tt("canvasCount")}
                      name="canvas_count"
                      value={conference.canvas_count || "1"}
                      type="number"
                    />
                    <EditableField
                      label={tt("videoMode")}
                      name="video_mode"
                      value={conference.video_mode || "CONF_VIDEO_MODE_PASSTHROUGH"}
                      type="select"
                      options={videoModes.map((mode) => ({
                        value: mode.k,
                        label: mode.v,
                      }))}
                    />
                    <EditableField
                      label={tt("realm")}
                      name="realm"
                      value={conference.realm || forceDomain || "-"}
                      type="text"
                    />
                    <EditableField
                      label={tt("profileId")}
                      name="profile_id"
                      value={conference.profile_id || ""}
                      type="select"
                      options={profiles.map((profile) => ({
                        value: profile.id.toString(),
                        label: `[${profile.name}] ${profile.description || ""}`,
                      }))}
                      required
                    />
                    <EditableField
                      label={tt("fps")}
                      name="fps"
                      value={conference.fps || "15"}
                      type="number"
                    />
                    <EditableField
                      label={tt("bandwidth")}
                      name="bandwidth"
                      value={conference.bandwidth || "1mb"}
                      type="text"
                    />
                    <EditableField
                      label={tt("callPerm")}
                      name="call_perm"
                      value={conference.call_permission || ""}
                      type="select"
                      options={callPermissions.map((perm) => ({
                        value: perm.k,
                        label: tt(perm.k) || perm.v,
                      }))}
                    />
                    <EditableField label="字幕大小" name="subtitleSize" value="2" type="text" />
                    <EditableField
                      label="字幕"
                      name="subtitle"
                      value="${caller_id_number} ${caller_id_name}"
                      type="text"
                    />
                    <EditableField
                      label="背景颜色"
                      name="backgroundColor"
                      value="black"
                      type="text"
                    />
                    <EditableField
                      label="字幕颜色"
                      name="subtitleColor"
                      value="white"
                      type="text"
                    />
                    <EditableField
                      label={tt("password")}
                      name="password"
                      value={conference.pin || "-"}
                      type="password"
                    />
                    <EditableField
                      label={tt("adminPassword")}
                      name="admin_pin"
                      value={conference.admin_pin || "-"}
                      type="password"
                    />
                    <EditableField
                      label={tt("enableAgora")}
                      name="enable_agora"
                      value={conference.enable_agora || false}
                      type="switch"
                      switchCheckedValue={tt("yes")}
                      switchUncheckedValue={tt("no")}
                    />
                    {conference.enable_agora && (
                      <>
                        <EditableField
                          label={tt("agoraAppid")}
                          name="agora_appid"
                          value={conference.agora_appid || "-"}
                          type="text"
                        />
                        <EditableField
                          label={tt("agoraToken")}
                          name="agora_token"
                          value={conference.agora_token || "-"}
                          type="text"
                        />
                        <EditableField
                          label={tt("agoraChannel")}
                          name="agora_channel"
                          value={conference.agora_channel || "-"}
                          type="text"
                        />
                      </>
                    )}
                    <EditableField
                      label={tt("autoMute")}
                      name="auto_mute"
                      value={false}
                      type="switch"
                      switchCheckedValue={tt("yes")}
                      switchUncheckedValue={tt("no")}
                    />
                    <EditableField
                      label={tt("streamAddress")}
                      name="stream_address"
                      value={"-"}
                      type="text"
                    />
                  </EditableSection>

                  {/* 与会者 */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">与会者</h3>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          编辑
                        </Button>
                        <Button size="sm" onClick={() => setIsAddParticipantOpen(true)}>
                          添加与会者
                        </Button>
                        <Button size="sm" onClick={() => setIsAddGroupMembersOpen(true)}>
                          添加组成员
                        </Button>
                      </div>
                    </div>

                    {/* 所有用户分组 */}
                    <div className="mb-4">
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-left py-2">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="w-4 h-4" />
                            <span className="font-medium">所有用户</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">删除组成员</span>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="px-4 py-3 text-left">排序</th>
                                  <th className="px-4 py-3 text-left">名称</th>
                                  <th className="px-4 py-3 text-left">号码</th>
                                  <th className="px-4 py-3 text-left">描述</th>
                                  <th className="px-4 py-3 text-left">设为管理员</th>
                                  <th className="px-4 py-3 text-right">操作</th>
                                </tr>
                              </thead>
                              <tbody>
                                {participants.length > 0 ? (
                                  participants.map((participant, index) => (
                                    <tr key={participant.id}>
                                      <td className="px-4 py-3 border-t">{index + 1}</td>
                                      <td className="px-4 py-3 border-t">{participant.name}</td>
                                      <td className="px-4 py-3 border-t">{participant.num}</td>
                                      <td className="px-4 py-3 border-t">
                                        {participant.description || "-"}
                                      </td>
                                      <td className="px-4 py-3 border-t">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-green-500"
                                          onClick={() => void handleSetAsModerator(participant.id)}
                                        >
                                          设置
                                        </Button>
                                      </td>
                                      <td className="px-4 py-3 border-t text-right">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-500"
                                          onClick={() =>
                                            void handleDeleteParticipant(participant.id)
                                          }
                                        >
                                          删除
                                        </Button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center">
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
                                )}
                              </tbody>
                            </table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    {/* 未分组 */}
                    <div className="mb-4">
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-left py-2">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="w-4 h-4" />
                            <span className="font-medium">未分组</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">删除组成员</span>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="px-4 py-3 text-left">排序</th>
                                  <th className="px-4 py-3 text-left">名称</th>
                                  <th className="px-4 py-3 text-left">号码</th>
                                  <th className="px-4 py-3 text-left">描述</th>
                                  <th className="px-4 py-3 text-left">设为管理员</th>
                                  <th className="px-4 py-3 text-right">操作</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td colSpan={6} className="px-4 py-10 text-center">
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
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>

                  {/* 媒体文件 */}
                  <div className="mt-8 mb-6">
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full text-left py-2">
                        <h3 className="text-lg font-medium">媒体文件</h3>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => setIsAddMediaOpen(true)}>
                            + 添加媒体文件
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
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
                              {mediaFiles.length > 0 ? (
                                mediaFiles.map((file) => (
                                  <tr key={file.id}>
                                    <td className="px-4 py-3 border-t">{file.id}</td>
                                    <td className="px-4 py-3 border-t">{file.name}</td>
                                    <td className="px-4 py-3 border-t text-right">
                                      <Button size="sm" variant="ghost" className="text-red-500">
                                        删除
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
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
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 添加与会者弹窗 */}
        <DynamicFormDialog
          open={isAddParticipantOpen}
          onOpenChange={setIsAddParticipantOpen}
          title="添加与会者"
          config={{
            fields: [
              {
                name: "name",
                label: "名称",
                type: "text",
                placeholder: "",
                required: true,
              },
              {
                name: "description",
                label: "描述",
                type: "text",
                placeholder: "",
                required: false,
              },
              {
                name: "number",
                label: "号码",
                type: "text",
                placeholder: "",
                required: true,
              },
            ],
          }}
          onSubmit={handleAddParticipant}
          submitText="提交"
          cancelText="关闭"
          contentClassName="sm:max-w-[500px]"
        />

        {/* 添加组成员弹窗 */}
        <AddGroupMembersDialog
          open={isAddGroupMembersOpen}
          onOpenChange={setIsAddGroupMembersOpen}
          roomId={conference?.id || 0}
          onMembersAdded={void handleMembersAdded}
        />

        {/* 添加媒体文件弹窗 */}
        <AddMediaDialog
          open={isAddMediaOpen}
          onOpenChange={setIsAddMediaOpen}
          roomId={conference?.id || 0}
          onNewMediaAdded={handleAddMedia}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
