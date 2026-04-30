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
import { EditableTable } from "@/components/ui/editable-table";
import { Edit2Icon, XIcon, PlusIcon } from "lucide-react";

export default function ConferenceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const conferenceId = parseInt(params.id || "0");
  const t = useTranslations("pages");
  const tt = useTranslations("conference");

  const [conference, setConference] = useState<Conference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceDomain, setForceDomain] = useState<string>("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [videoModes, setVideoModes] = useState<any[]>([]);
  const [callPermissions, setCallPermissions] = useState<any[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddGroupMembersOpen, setIsAddGroupMembersOpen] = useState(false);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [isAllUsersOpen, setIsAllUsersOpen] = useState(false);
  const [isUngroupedOpen, setIsUngroupedOpen] = useState(false);
  const [isTableEditing, setIsTableEditing] = useState(false);

  // 加载conference详情
  const loadConferenceDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        conferenceResponse,
        forceDomainResponse,
        profilesResponse,
        videoModesResponse,
        callPermissionsResponse,
        mediaFilesResponse,
        participantsResponse,
      ] = await Promise.all([
        conferencesApi.get(conferenceId),
        conferencesApi.getForceDomain(),
        conferencesApi.getProfiles(),
        conferencesApi.getVideoModes(),
        conferencesApi.getCallPermissions(),
        conferencesApi.getMediaFiles(conferenceId),
        conferencesApi.getMembers(conferenceId),
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

      setMediaFiles((mediaFilesResponse.data as any[]) || []);

      // 处理与会者数据
      const loadedParticipants = ((participantsResponse.data as any).data ||
        participantsResponse.data) as any[];
      setParticipants(loadedParticipants);
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
          nbr: formData.nbr,
          realm: formData.realm,
          capacity: formData.capacity,
          banner: videoBanner,
          enable_agora: formData.enable_agora,
        };
        setConference(updatedConference);

        toast.success(tt("saveSuccess"));
        return true;
      } catch (error) {
        console.error("Failed to update conference:", error);
        toast.error(tt("saveFailed"));
        return false;
      }
    },
    [conference],
  );

  const handleCancel = useCallback(() => {}, []);

  const handleCancelTableEdit = useCallback(() => {
    setIsTableEditing(false);
    if (conference) {
      conferencesApi
        .getMembers(conference.id)
        .then((response) => {
          const rawData: unknown = response.data;
          const newParticipants: any[] = Array.isArray((rawData as { data?: unknown[] }).data)
            ? (rawData as { data: unknown[] }).data
            : Array.isArray(rawData)
              ? (rawData as unknown[])
              : [];
          setParticipants(newParticipants);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [
	conference,
	setParticipants,
	setIsTableEditing
]);

  const handleMembersAdded = useCallback(async () => {
    if (!conference) return;
    const response = await conferencesApi.getMembers(conference.id);
    setParticipants(((response.data as any).data || response.data) as any[]);
  }, [conference]);

  const handleBack = useCallback(() => {
    router.push("/conference");
  }, [router]);

  const handleAddParticipant = useCallback(
    async (data: any) => {
      console.log("handleAddParticipant called with data:", data);
      if (!conference) {
        toast.error(tt("cannotGetConference"));
        throw new Error("Conference not found");
      }

      try {
        const participantData = [
          {
            name: data.name,
            num: data.number,
            room_id: conference.id,
            description: data.description || "",
            group_id: 0,
          },
        ];
        console.log("participantData to submit:", participantData);

        await conferencesApi.addMembers(conference.id, participantData);
        toast.success(tt("addSuccess"));
        const response = await conferencesApi.getMembers(conference.id);
        const newParticipants = ((response.data as any).data || response.data) as any[];
        setParticipants(newParticipants);
      } catch (error) {
        console.error("Failed to add participant:", error);
        toast.error(tt("addFailed"));
        throw error;
      }
    },
    [conference],
  );

  // 处理添加媒体文件
  const handleAddMedia = useCallback((media: any) => {
    setMediaFiles((prev) => [...prev, media]);
  }, []);

  // 处理删除媒体文件
  const handleDeleteMedia = useCallback(
    async (id: number) => {
      if (!conference) return;
      try {
        await conferencesApi.deleteMedia(conference.id, id);
        const response = await conferencesApi.getMediaFiles(conference.id);
        setMediaFiles((response.data as any[]) || []);
        toast.success(tt("deleteSuccess"));
      } catch (error) {
        console.error("Failed to delete media:", error);
        toast.error(tt("deleteFailed"));
      }
    },
    [conference],
  );

  // 处理设为管理员
  const handleSetAsModerator = useCallback(
    async (id: number) => {
      if (!conference) return;
      try {
        const response = await conferencesApi.setModerator(conference.id, id);
        const member = response.data as any;
        setParticipants((prev) =>
          prev.map((p) => (p.id === id ? { ...p, disabled: String(member.disabled) } : p)),
        );

        toast.success(tt("setSuccess"));
      } catch (error) {
        console.error("Failed to set moderator:", error);
        toast.error(tt("setFailed"));
      }
    },
    [conference],
  );

  // 处理{t("delete")}与会者
  const handleDeleteParticipant = useCallback(
    async (id: number) => {
      if (!conference) return;
      try {
        await conferencesApi.deleteMember(conference.id, id);
        const response = await conferencesApi.getMembers(conference.id);
        const newParticipants = ((response.data as any).data || response.data) as any[];
        setParticipants(newParticipants);
        toast.success(tt("deleteSuccess"));
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error(tt("deleteFailed"));
      }
    },
    [conference],
  );

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
          <div className="flex flex-1 flex-col items-center justify-center"></div>
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
            <div className="text-center">{tt("noConferences")}</div>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {t("back")}
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
                    title={t("basicInfo")}
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
                    <EditableField
                      label={tt("subtitleSize")}
                      name="subtitleSize"
                      value="2"
                      type="text"
                    />
                    <EditableField
                      label={tt("subtitle")}
                      name="subtitle"
                      value="${caller_id_number} ${caller_id_name}"
                      type="text"
                    />
                    <EditableField
                      label={tt("backgroundColor")}
                      name="backgroundColor"
                      value="black"
                      type="text"
                    />
                    <EditableField
                      label={tt("subtitleColor")}
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
                      <h3 className="text-lg font-medium">{tt("participants")}</h3>
                      <div className="flex items-center gap-2">
                        {isTableEditing ? (
                          <Button variant="outline" size="sm" onClick={handleCancelTableEdit}>
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
                        <Button size="sm" onClick={() => setIsAddParticipantOpen(true)}>
                          <PlusIcon className="mr-2 h-4 w-4" />
                          {tt("addParticipant")}
                        </Button>
                        <Button size="sm" onClick={() => setIsAddGroupMembersOpen(true)}>
                          {tt("addGroupMembers")}
                        </Button>
                      </div>
                    </div>

                    {/* 所有用户分组 - 显示组成员 */}
                    <div className="mb-4">
                      <Collapsible open={isAllUsersOpen} onOpenChange={setIsAllUsersOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-left py-2">
                          <div className="flex items-center gap-2">
                            {isAllUsersOpen ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="font-medium">{tt("allUsers")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {/* {tt("deleteMember")} */}
                            </span>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <EditableTable
                            columns={[
                              {
                                key: "name",
                                header: tt("name"),
                                type: isTableEditing ? "text" : undefined,
                              },
                              {
                                key: "num",
                                header: tt("number"),
                                type: isTableEditing ? "text" : undefined,
                              },
                              {
                                key: "description",
                                header: tt("description"),
                                type: isTableEditing ? "text" : undefined,
                              },
                              {
                                key: "setAsModerator",
                                header: tt("setAsModerator"),
                                render: (row: any) => (
                                  <Button
                                    size="sm"
                                    variant={row.disabled === "0" ? "default" : "ghost"}
                                    onClick={() => void handleSetAsModerator(row.id)}
                                  >
                                    {row.disabled === "0" ? tt("moderator") : tt("set")}
                                  </Button>
                                ),
                              },
                              {
                                key: "action",
                                header: tt("actions"),
                                type: "action",
                                actions: [
                                  {
                                    type: "delete",
                                    label: t("delete"),
                                  },
                                ],
                              },
                            ]}
                            data={participants.filter(
                              (p) =>
                                p.user_id !== undefined && p.user_id !== null && p.user_id !== "",
                            )}
                            getRowId={(row: any) => row.id.toString()}
                            onDelete={async (_row: any, rowId: string) => {
                              await handleDeleteParticipant(parseInt(rowId));
                            }}
                            onChange={(change) => {
                              if (!conference) return;
                              const participantId = parseInt(change.rowId);
                              const rowData: any = {};
                              const allowedFields = [
                                "name",
                                "num",
                                "description",
                                "disabled",
                                "sort",
                                "route",
                                "group_id",
                              ];
                              allowedFields.forEach((field) => {
                                if (
                                  change.rowData[field] !== undefined &&
                                  change.rowData[field] !== null
                                ) {
                                  rowData[field] = change.rowData[field];
                                }
                              });
                              if (
                                change.rowData.user_id !== undefined &&
                                change.rowData.user_id !== null &&
                                change.rowData.user_id !== ""
                              ) {
                                rowData.user_id = parseInt(change.rowData.user_id);
                              }
                              fetch(
                                `/api/conference_rooms/${conference.id}/members/${participantId}`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify(rowData),
                                },
                              )
                                .then(() => {
                                  toast.success(tt("saveSuccess"));
                                })
                                .catch((error) => {
                                  console.error("Failed to update participant:", error);
                                  toast.error(tt("saveFailed"));
                                });
                            }}
                            isEditing={isTableEditing}
                            emptyText={tt("noData")}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    {/* 未分组 - 显示通过添加与会者添加的用户 */}
                    <div className="mb-4">
                      <Collapsible open={isUngroupedOpen} onOpenChange={setIsUngroupedOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-left py-2">
                          <div className="flex items-center gap-2">
                            {isUngroupedOpen ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="font-medium">{tt("ungrouped")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {/* {tt("deleteMember")} */}
                            </span>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <EditableTable
                            columns={[
                              {
                                key: "name",
                                header: tt("name"),
                                type: isTableEditing ? "text" : undefined,
                              },
                              {
                                key: "num",
                                header: tt("number"),
                                type: isTableEditing ? "text" : undefined,
                              },
                              {
                                key: "description",
                                header: tt("description"),
                                type: isTableEditing ? "text" : undefined,
                              },
                              {
                                key: "setAsModerator",
                                header: tt("setAsModerator"),
                                render: (row: any) => (
                                  <Button
                                    size="sm"
                                    variant={row.disabled === "0" ? "default" : "ghost"}
                                    onClick={() => void handleSetAsModerator(row.id)}
                                  >
                                    {row.disabled === "0" ? tt("moderator") : tt("set")}
                                  </Button>
                                ),
                              },
                              {
                                key: "action",
                                header: tt("actions"),
                                type: "action",
                                actions: [
                                  {
                                    type: "delete",
                                    label: t("delete"),
                                  },
                                ],
                              },
                            ]}
                            data={participants.filter(
                              (p) =>
                                p.user_id === undefined || p.user_id === null || p.user_id === "",
                            )}
                            getRowId={(row: any) => row.id.toString()}
                            onDelete={async (_row: any, rowId: string) => {
                              await handleDeleteParticipant(parseInt(rowId));
                            }}
                            onChange={(change) => {
                              if (!conference) return;
                              const participantId = parseInt(change.rowId);
                              const rowData: any = {};
                              const allowedFields = [
                                "name",
                                "num",
                                "description",
                                "disabled",
                                "sort",
                                "route",
                                "group_id",
                              ];
                              allowedFields.forEach((field) => {
                                if (
                                  change.rowData[field] !== undefined &&
                                  change.rowData[field] !== null
                                ) {
                                  rowData[field] = change.rowData[field];
                                }
                              });
                              if (
                                change.rowData.user_id !== undefined &&
                                change.rowData.user_id !== null &&
                                change.rowData.user_id !== ""
                              ) {
                                rowData.user_id = parseInt(change.rowData.user_id);
                              }
                              fetch(
                                `/api/conference_rooms/${conference.id}/members/${participantId}`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify(rowData),
                                },
                              )
                                .then(() => {
                                  toast.success(tt("saveSuccess"));
                                })
                                .catch((error) => {
                                  console.error("Failed to update participant:", error);
                                  toast.error(tt("saveFailed"));
                                });
                            }}
                            isEditing={isTableEditing}
                            emptyText={tt("noData")}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>

                  {/* 媒体文件 */}
                  <div className="mt-8 mb-6">
                    <Collapsible defaultOpen>
                      <div className="flex items-center justify-between w-full text-left py-2">
                        <h3 className="text-lg font-medium">{tt("mediaFiles")}</h3>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => setIsAddMediaOpen(true)}>
                            + {tt("addMediaFile")}
                          </Button>
                        </div>
                      </div>
                      <CollapsibleContent className="mt-2">
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">{tt("name")}</th>
                                <th className="px-4 py-3 text-right">{tt("actions")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mediaFiles.length > 0 ? (
                                mediaFiles.map((file) => (
                                  <tr key={file.id}>
                                    <td className="px-4 py-3 border-t">{file.id}</td>
                                    <td className="px-4 py-3 border-t">{file.name}</td>
                                    <td className="px-4 py-3 border-t text-right">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => void handleDeleteMedia(file.id)}
                                      >
                                        {t("delete")}
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
                                      <p className="text-muted-foreground">{tt("noData")}</p>
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
          title={tt("addParticipant")}
          config={{
            fields: [
              {
                name: "name",
                label: tt("name"),
                type: "text",
                placeholder: "",
                required: true,
              },
              {
                name: "description",
                label: tt("description"),
                type: "text",
                placeholder: "",
                required: false,
              },
              {
                name: "number",
                label: tt("number"),
                type: "text",
                placeholder: "",
                required: true,
              },
            ],
          }}
          onSubmit={handleAddParticipant}
          submitText={t("submit")}
          cancelText={tt("close")}
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
