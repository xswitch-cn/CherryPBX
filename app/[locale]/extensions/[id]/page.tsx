"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { type Extension, type ContextItem, type User } from "@repo/api-client";
import {
  routesApi,
  extensionsApi,
  dodsApi,
  hotlinesApi,
  mediaFilesApi,
  configsApi,
  usersApi,
} from "@/lib/api-client";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RingtoneField } from "@/components/ui/ringtone-field";
import React from "react";

export default function ExtensionDetailsPage() {
  const params = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("extensions");

  const extensionId = params.id;
  const [extension, setExtension] = useState<Extension | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const [dodId, setDodId] = useState<string>("");

  const callTransferOptions = [
    { k: "0", v: "No following number" },
    { k: "1", v: "Ring with the following numbers" },
    { k: "2", v: "When call no answer then go to the following number" },
    { k: "3", v: "When call failed then go to the following number" },
    { k: "4", v: "Unconditionally go to the following number" },
  ];
  const callAuthorityOptions = [
    { k: "0", v: "Emergency Call" },
    { k: "1", v: "Internal" },
    { k: "2", v: "Local" },
    { k: "3", v: "Domestic" },
    { k: "4", v: "International" },
  ];
  const dtmfTypes = [
    { k: "0", v: "Not Specified" },
    { k: "1", v: "SIP INFO" },
    { k: "2", v: "Inband" },
    { k: "3", v: "RFC2833" },
  ];
  const interceptOptions = [
    { k: "0", v: "No Intercept Permission" },
    { k: "1", v: "Group Intercept Permission" },
    { k: "2", v: "Global Intercept Permission" },
  ];
  const interceptedOptions = [
    { k: "0", v: "No Intercepted Permission" },
    { k: "1", v: "Group Intercepted Permission" },
    { k: "2", v: "Global Intercepted Permission" },
  ];
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [nameList, setNameList] = useState<any[]>([]);
  const [toneDicts, setToneDicts] = useState<any[]>([]);
  const [xuiType, setXuiType] = useState<string>("");
  const [withKa, setWithKa] = useState<boolean>(false);
  const [didsGroup, setDidsGroup] = useState<any[]>([]);
  const [newdids, setNewdids] = useState<any[]>([]);
  const [delDids, setDelDids] = useState<number[]>([]);
  const [addDidModalVisible, setAddDidModalVisible] = useState(false);
  const [newDidNumber, setNewDidNumber] = useState("");
  const [newDidDescription, setNewDidDescription] = useState("");
  const [ringbackName, setRingbackName] = useState("");
  const [ringbackUrl, setRingbackUrl] = useState("");

  const loadExtensionDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await extensionsApi.getById(parseInt(extensionId, 10));
      const extensionData = response.data || null;
      setExtension(extensionData);
      if (extensionData && (extensionData as any)?.dids) {
        setDidsGroup((extensionData as any).dids);
      }
    } catch (error) {
      console.error("Failed to load extension detail:", error);
      toast.error("加载分机详情失败");
    } finally {
      setIsLoading(false);
    }
  }, [extensionId]);

  useEffect(() => {
    if (!extension?.ringback) {
      setRingbackName("");
      setRingbackUrl("");
      return;
    }

    let ringback: any = extension.ringback;
    if (typeof ringback === "string") {
      try {
        ringback = JSON.parse(ringback);
      } catch (error) {
        console.error("Failed to parse ringback:", error);
        ringback = null;
      }
    }

    if (!ringback || typeof ringback !== "object") {
      setRingbackName("");
      setRingbackUrl("");
      return;
    }

    if (mediaFiles.length > 0 && ringback.media_id) {
      const mediaFile = mediaFiles.find((f) => {
        const fileId = typeof f.id === "string" ? parseInt(f.id, 10) : f.id;
        const ringbackId =
          typeof ringback.media_id === "string"
            ? parseInt(ringback.media_id, 10)
            : ringback.media_id;
        return fileId === ringbackId;
      });
      if (mediaFile) {
        let url = `/api/media_files/${mediaFile.id}`;
        if (!mediaFile.ext && mediaFile.abs_path) {
          mediaFile.ext = mediaFile.abs_path.split(".").pop() || "";
        }
        if (mediaFile.ext) {
          url += `.${mediaFile.ext}`;
        }
        setRingbackName(mediaFile.name);
        setRingbackUrl(url);
        return;
      }
    }
    if (toneDicts.length > 0 && ringback.media_path) {
      const tonesPath = ringback.media_path;
      const tone = toneDicts.find((t) => "tone_stream://" + t.v === tonesPath);
      if (tone) {
        setRingbackName(tone.k);
        setRingbackUrl(`/api/tones/${tone.v}`);
        console.log("ringback info", ringbackName, ringbackUrl);
        return;
      }
    }
    setRingbackName("");
    setRingbackUrl("");
  }, [extension?.ringback, mediaFiles, toneDicts, ringbackName, ringbackUrl]);

  // DID管理相关函数
  const showAddDidModal = () => {
    setAddDidModalVisible(true);
  };

  const hideAddDidModal = () => {
    setAddDidModalVisible(false);
    setNewDidNumber("");
    setNewDidDescription("");
  };

  const addDid = () => {
    if (newDidNumber) {
      const newDid = {
        line_number: newDidNumber,
        description: newDidDescription,
      };
      setNewdids((prev) => [...prev, newDid]);
      setDidsGroup((prev) => [...prev, newDid]);
      hideAddDidModal();
    }
  };

  const deleteDid = (id: number) => {
    setDelDids((prev) => [...prev, id]);
    setDidsGroup((prev) => prev.filter((item) => item.id !== id));
  };

  const getContexts = useCallback(async () => {
    try {
      const response = await routesApi.getContexts();
      setContexts(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load contexts:", error);
    }
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const response = (await usersApi.list({ perPage: 100, hpack: false })) as any;
      setUsers(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, []);

  const getDicts = useCallback(async () => {
    try {
      const typesResponse = await routesApi.getDicts("EXTENSION_TYPE");
      setTypes(typesResponse.data || []);
    } catch (error) {
      console.error("Failed to load dicts:", error);
    }
  }, []);

  const getMediaFiles = useCallback(async () => {
    try {
      const response = await mediaFilesApi.list({ types: "SYSTEM,UPLOAD,TTS", hpack: false });
      const mediaFiles = (response as any).data?.data || [];
      setMediaFiles(mediaFiles);
    } catch (error) {
      console.error("Failed to load media files:", error);
    }
  }, []);

  const getNameList = useCallback(async (type: string) => {
    try {
      let response;
      if (type === "GATEWAY") {
        response = await routesApi.getGateways();
      } else if (type === "DISTRIBUTORS") {
        response = await routesApi.getDistributors();
      } else {
        response = await routesApi.getTrunks();
      }

      setNameList((response as any).data?.data || []);
    } catch (error) {
      console.error("Failed to load name list:", error);
      setNameList([]);
    }
  }, []);

  const getToneDicts = useCallback(async () => {
    try {
      const response = await routesApi.getDicts("TONE");
      setToneDicts(response.data || []);
    } catch (error) {
      console.error("Failed to load tone dicts:", error);
      setToneDicts([]);
    }
  }, []);

  const getXuiType = useCallback(async () => {
    try {
      const response = await configsApi.getConfigs("xui_type");
      setXuiType(response.data || "");
    } catch (error) {
      console.error("Failed to load xui_type:", error);
    }
  }, []);

  const getResourceTypes = useCallback(() => {
    let types = [
      { k: "GATEWAY", v: "GATEWAY" },
      { k: "DISTRIBUTORS", v: "DISTRIBUTORS" },
    ];
    if (withKa) {
      types = [
        { k: "GATEWAY", v: "GATEWAY" },
        { k: "TRUNK", v: "TRUNK" },
        { k: "DISTRIBUTORS", v: "DISTRIBUTORS" },
      ];
    }
    setResourceTypes(types);
  }, [withKa]);

  // 检查是否有 KA 功能
  const checkWithKa = useCallback(async () => {
    try {
      const response = await routesApi.getDicts("XUI");
      if (response.data) {
        const isProductGw = response.data.find((item: any) => item.k === "IS_PRODUCT_GW");
        if (isProductGw && isProductGw.v === "false") {
          setWithKa(false);
        } else {
          setWithKa(true);
        }
      } else {
        setWithKa(true);
      }
    } catch (error) {
      console.error("Failed to check with_ka:", error);
      setWithKa(true); // 默认值
    }
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void checkWithKa();

    void getDicts();
    void getToneDicts();
    void getContexts();
    void getUsers();
    void getMediaFiles();
    void loadExtensionDetail();
    void getXuiType();
  }, [
    extensionId,
    router,
    loadExtensionDetail,
    checkWithKa,
    getDicts,
    getToneDicts,
    getContexts,
    getUsers,
    getMediaFiles,
    getXuiType,
  ]);

  useEffect(() => {
    getResourceTypes();
  }, [withKa, getResourceTypes]);

  useEffect(() => {
    if ((extension as any)?.dod_type) {
      void getNameList((extension as any).dod_type);
    }
  }, [(extension as any)?.dod_type, getNameList]);

  const handleSave = async (formData: any) => {
    try {
      const processedData = { ...formData };

      const booleanFields = [
        "call_limit",
        "force_insert",
        "force_breakdown",
        "eavesdrop",
        "enable_srtp",
        "called_limit",
        "auto_record",
        "caller_display",
        "voicemail",
        "enable_t38",
        "enable_ringback",
      ];

      booleanFields.forEach((field) => {
        if (processedData[field] !== undefined) {
          processedData[field] =
            processedData[field] === "1" || processedData[field] === true ? "1" : "0";
        }
      });

      const numberFields = ["call_authority", "dtmf_type", "intercept"];
      numberFields.forEach((field) => {
        if (processedData[field] !== undefined) {
          processedData[field] = processedData[field].toString();
        }
      });

      if (processedData.ringback) {
        try {
          if (typeof processedData.ringback === "object") {
            processedData.ringback = JSON.stringify(processedData.ringback);
          }
        } catch (error) {
          console.error("Failed to process ringback field:", error);
        }
      }

      if (processedData.dids) {
        if (typeof processedData.dids === "string") {
          processedData.dids = processedData.dids
            .split(",")
            .map((did: string) => did.trim())
            .filter((did: string) => did !== "");
        }
      }

      if (processedData.codec) {
        if (typeof processedData.codec === "string") {
          processedData.codec = processedData.codec
            .split(",")
            .map((codec: string) => codec.trim())
            .filter((codec: string) => codec !== "");
        }
      }
      if (
        ((processedData.dod_type && processedData.dod_type.length > 0) ||
          (processedData.dod_name && processedData.dod_name.length > 0)) &&
        !processedData.line_number
      ) {
        toast.error("请输入DOD号码");
        return false;
      }

      if (processedData.dod_name) {
        const selectedResource = nameList.find((item: any) => item.id === processedData.dod_name);
        if (selectedResource) {
          processedData.ref_id = processedData.dod_name;
          processedData.dod_name = selectedResource.name;
        }
      }

      if (xuiType === "ippbx") {
        if (processedData.boss_extn !== undefined) {
          processedData.boss_extn =
            processedData.boss_extn === "1" || processedData.boss_extn === true ? "1" : "0";
        }
        if (processedData.secretary_extn !== undefined) {
          processedData.secretary_extn = processedData.secretary_extn.toString();
        }
      }

      delete processedData.login;
      delete processedData.dids;

      console.log("Saving extension data:", processedData);

      await handleDodCreation(processedData);

      await extensionsApi.update(parseInt(extensionId, 10), processedData);

      await handleDidManagement(processedData.extn || extension?.extn || "");

      toast.success(tt("saveSuccess") || "保存成功");
      void loadExtensionDetail();
      return true;
    } catch (error) {
      console.error("Failed to save extension:", error);
      toast.error(tt("saveFailed") || "保存失败");
      return false;
    }
  };

  // 处理DOD创建逻辑
  const handleDodCreation = async (processedData: any) => {
    const hasDodId = dodId !== "" || (extension as any)?.dod_id;

    if (!hasDodId) {
      if (processedData.line_number && processedData.line_number.length > 0) {
        // 创建新的 DOD
        const dodData = {
          ref_id: processedData.ref_id,
          name: processedData.dod_name ? processedData.dod_name : null,
          type: processedData.dod_type,
          line_number: processedData.line_number,
          extn: processedData.extn || extension?.extn || "",
        };

        console.log("Creating DOD:", dodData);
        const dodResponse = await dodsApi.create(dodData);
        if ((dodResponse as any)?.data?.code == 200) {
          processedData.dod_id = (dodResponse as any)?.data?.data;
          delete processedData.line_number;
          setDodId(processedData.dod_id);
        }
      } else {
        delete processedData.dod_type;
        delete processedData.dod_name;
        delete processedData.line_number;
      }
    } else {
      processedData.dod_id = (extension as any)?.dod_id;
      delete processedData.line_number;
    }
  };

  // 处理DID管理逻辑
  const handleDidManagement = async (extn: string) => {
    // 处理新增DID
    if (newdids.length > 0) {
      await Promise.all(
        newdids.map(async (item) => {
          try {
            const response = await hotlinesApi.create({
              ...item,
              numbers: extn,
            });
            if (response.data) {
              // 添加新创建的DID到列表
              setDidsGroup((prev) => [{ id: response.data, type: "", ...item }, ...prev]);
            }
          } catch (error) {
            console.error("Failed to create hotline:", error);
            toast.error("创建DID失败");
          }
        }),
      );
      setNewdids([]);
    }

    // 处理删除DID
    if (delDids.length > 0) {
      await Promise.all(
        delDids.map(async (id: any) => {
          try {
            await hotlinesApi.delete(String(id));
            // 从列表中删除
            setDidsGroup((prev) => prev.filter((item) => item.id !== id));
          } catch (error) {
            console.error("Failed to delete hotline:", error);
            toast.error("删除DID失败");
          }
        }),
      );
      setDelDids([]);
    }
  };

  const handleCancel = () => {
    console.log("取消编辑");
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("extensions")} />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground">{tt("loading") || "加载中..."}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const getYesNoDisplay = (value?: number) => {
    return value;
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("extensions")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <CommonBreadcrumb
                  items={[
                    { label: t("extensions"), href: `/${params.locale}/extensions` },
                    { label: extension?.name || extension?.extn, isCurrentPage: true },
                  ]}
                />

                <EditableSection
                  title="基本信息"
                  defaultValues={{
                    ...extension,
                    login: (extension as any)?.login || "",
                    // // 确保ringback是对象格式
                    // ringback: extension?.ringback ? (typeof extension.ringback === "string" ? JSON.parse(extension.ringback) : extension.ringback) : null,
                  }}
                  onSave={handleSave}
                  onCancel={handleCancel}
                >
                  <EditableField
                    label={tt("name")}
                    name="name"
                    value={extension?.name}
                    type="text"
                    inputPlaceholder="请输入名称"
                    required
                  />

                  <EditableField
                    label={tt("number")}
                    name="extn"
                    value={extension?.extn}
                    type="text"
                    inputPlaceholder="请输入分机号码"
                    required
                    disabled
                  />

                  <EditableField
                    label={tt("password")}
                    name="password"
                    value=""
                    type="password"
                    inputPlaceholder="请输入密码"
                  />

                  <EditableField
                    label={tt("context")}
                    name="context"
                    value={extension?.context}
                    type="select"
                    options={contexts.map((item) => ({
                      value: item.key,
                      label: item.name,
                    }))}
                    required
                  />

                  <EditableField
                    label={tt("extensionUser")}
                    name="login"
                    value={(extension as any)?.login}
                    type="select"
                    options={users.map((item) => ({
                      value: item.login,
                      label: `${item.name} (${item.login})`,
                    }))}
                    required
                  />

                  <EditableField
                    label={tt("cidName")}
                    name="cid_name"
                    value={extension?.cid_name || "-"}
                    type="text"
                    inputPlaceholder="请输入主叫名称"
                  />

                  <EditableField
                    label={tt("cidNumber")}
                    name="cid_number"
                    value={extension?.cid_number || "-"}
                    type="text"
                    inputPlaceholder="请输入主叫号码"
                  />

                  <EditableField
                    label={tt("type")}
                    name="type"
                    value={extension?.type || "SIP"}
                    type="select"
                    options={types.map((item: any) => ({
                      value: item.k,
                      label: tt(item.v),
                    }))}
                  />

                  <EditableField
                    label={tt("MAC Address")}
                    name="mac_address"
                    value={extension?.mac_address || "-"}
                    type="text"
                    inputPlaceholder={tt("MAC Address")}
                  />
                </EditableSection>

                <EditableSection
                  title="主叫业务"
                  defaultValues={{
                    ...extension,
                    call_limit: extension?.call_limit?.toString(),
                    force_insert: extension?.force_insert?.toString(),
                    force_breakdown: extension?.force_breakdown?.toString(),
                    call_authority: extension?.call_authority?.toString(),
                    intercept: extension?.intercept?.toString(),
                    line_number: (extension as any)?.line_number || "",
                    dod_type: (extension as any)?.dod_type || "",
                    dod_name: (extension as any)?.dod_name || "",
                    dtmf_type: extension?.dtmf_type?.toString(),
                    enable_srtp: extension?.enable_srtp?.toString(),
                    vm_password: extension?.vm_password || "",
                    eavesdrop: extension?.eavesdrop?.toString() || "",
                  }}
                  onSave={handleSave}
                  onCancel={handleCancel}
                >
                  <EditableField
                    label={tt("callOut")}
                    name="call_limit"
                    value={getYesNoDisplay(extension?.call_limit)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  <EditableField
                    label={tt("forcedJoinPermission")}
                    name="force_insert"
                    value={getYesNoDisplay(extension?.force_insert)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  <EditableField
                    label={tt("forcedHangupPermission")}
                    name="force_breakdown"
                    value={getYesNoDisplay(extension?.force_breakdown)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  {xuiType !== "ippbx" && (
                    <EditableField
                      label={tt("eavesdropPermission")}
                      name="eavesdrop"
                      value={getYesNoDisplay(extension?.eavesdrop)}
                      type="switch"
                      switchCheckedValue="1"
                      switchUncheckedValue="0"
                    />
                  )}

                  <EditableField
                    label={tt("callPermission")}
                    name="call_authority"
                    value={extension?.call_authority?.toString() || "4"}
                    type="select"
                    options={callAuthorityOptions.map((item: any) => ({
                      value: item.k,
                      label: tt(item.v),
                    }))}
                  />

                  <EditableField
                    label={tt("interceptPermission")}
                    name="intercept"
                    value={extension?.intercept?.toString() || "0"}
                    type="select"
                    options={interceptOptions.map((item: any) => ({
                      value: item.k,
                      label: tt(item.v),
                    }))}
                  />

                  {xuiType === "ippbx" && (
                    <>
                      <EditableField
                        label="Boss Extension"
                        name="boss_extn"
                        value={getYesNoDisplay((extension as any)?.boss_extn)}
                        type="switch"
                        switchCheckedValue="1"
                        switchUncheckedValue="0"
                      />

                      <EditableField
                        label="Secretary Extension"
                        name="secretary_extn"
                        value={(extension as any)?.secretary_extn || ""}
                        type="select"
                        options={users.map((user: any) => ({
                          value: user.login,
                          label: user.login,
                        }))}
                      />
                    </>
                  )}

                  <EditableField
                    label={tt("dod")}
                    name="line_number"
                    value={(extension as any)?.line_number || "-"}
                    type="text"
                    inputPlaceholder="请输入主叫号码"
                  />

                  <EditableField
                    label={tt("resourceType") + " (DOD)"}
                    name="dod_type"
                    value={(extension as any)?.dod_type || "-"}
                    type="select"
                    options={resourceTypes.map((item: any) => ({
                      value: item.k,
                      label: tt(item.v),
                    }))}
                    onChange={(value) => {
                      if (value) {
                        void getNameList(value);
                      }
                    }}
                  />

                  <EditableField
                    label={tt("resourceName") + " (DOD)"}
                    name="dod_name"
                    value={(extension as any)?.dod_name || "-"}
                    type="select"
                    options={nameList.map((item: any) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />

                  <EditableField
                    label={tt("dtmfType")}
                    name="dtmf_type"
                    value={extension?.dtmf_type?.toString() || "0"}
                    type="select"
                    options={dtmfTypes.map((item: any) => ({
                      value: item.k,
                      label: tt(item.v),
                    }))}
                  />

                  <EditableField
                    label={tt("srtp")}
                    name="enable_srtp"
                    value={getYesNoDisplay(extension?.enable_srtp)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  <EditableField
                    label={tt("vmPassword")}
                    name="vm_password"
                    value={extension?.vm_password || ""}
                    type="password"
                    inputPlaceholder="请输入语音信箱密码"
                  />
                </EditableSection>

                <EditableSection
                  title="被叫业务"
                  defaultValues={{
                    ...extension,
                    called_limit: extension?.called_limit?.toString(),
                    auto_record: extension?.auto_record?.toString(),
                    caller_display: extension?.caller_display?.toString(),
                    voicemail: extension?.voicemail?.toString(),
                    forced_breakdown: extension?.forced_breakdown?.toString(),
                    force_insert: extension?.force_insert?.toString(),
                    enable_t38: extension?.enable_t38?.toString(),
                    call_transfer_type: extension?.call_transfer_type?.toString(),
                    connect_phone: extension?.connect_phone || "",
                    timeout: extension?.timeout || "",
                    dids: (extension as any)?.dids || [],
                    codec:
                      typeof extension?.codec === "string"
                        ? extension.codec
                        : extension?.codec || "",
                    enable_ringback: extension?.enable_ringback?.toString(),
                    media_file: extension?.ringback || "",
                    intercepted: extension?.intercepted?.toString(),
                    boss_extn: extension?.boss_extn?.toString(),
                    secretary_extn: extension?.secretary_extn || "",
                  }}
                  onSave={handleSave}
                  onCancel={handleCancel}
                >
                  <EditableField
                    label={tt("callIn")}
                    name="called_limit"
                    value={getYesNoDisplay(extension?.called_limit)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  <EditableField
                    label={tt("autoRecord")}
                    name="auto_record"
                    value={getYesNoDisplay(extension?.auto_record)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  <EditableField
                    label={tt("callerId")}
                    name="caller_display"
                    value={getYesNoDisplay(extension?.caller_display)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  <EditableField
                    label={tt("voicemail")}
                    name="voicemail"
                    value={getYesNoDisplay(extension?.voicemail)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  <EditableField
                    label={tt("forceHangup")}
                    name="forced_breakdown"
                    value={getYesNoDisplay(extension?.forced_breakdown)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  <EditableField
                    label={tt("forceJoin")}
                    name="forced_insert"
                    value={getYesNoDisplay(extension?.force_insert)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  {xuiType !== "ippbx" && (
                    <EditableField
                      label={tt("eavesdrop")}
                      name="eavesdrop"
                      value={getYesNoDisplay((extension as any)?.eavesdrop)}
                      type="switch"
                      switchCheckedValue="1"
                      switchUncheckedValue="0"
                    />
                  )}

                  <EditableField
                    label={tt("t38")}
                    name="enable_t38"
                    value={getYesNoDisplay(extension?.enable_t38)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  <EditableField
                    label={tt("callTransferType")}
                    name="call_transfer_type"
                    value={extension?.call_transfer_type?.toString() || "0"}
                    type="select"
                    options={callTransferOptions.map((item: any) => ({
                      value: item.k,
                      label: tt(item.v),
                    }))}
                  />

                  <EditableField
                    label={tt("connectPhone")}
                    name="connect_phone"
                    value={extension?.connect_phone || "-"}
                    type="text"
                    inputPlaceholder="请输入呼叫转移号码"
                  />

                  <EditableField
                    label={tt("timeout")}
                    name="timeout"
                    value={extension?.timeout || "-"}
                    type="text"
                    inputPlaceholder="请输入超时时长"
                  />

                  <EditableField
                    label={tt("did")}
                    name="dids"
                    value={
                      didsGroup.length > 0
                        ? didsGroup.map((item) => item.line_number).join(", ")
                        : "-"
                    }
                    type="custom"
                    renderEdit={() => (
                      <div className="w-full">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {didsGroup.map((item) => (
                            <div key={item.id || item.line_number} className="flex items-center">
                              <span className="px-2 py-1 bg-muted rounded-md text-sm">
                                {item.line_number}
                              </span>
                              {item.id && (
                                <button
                                  type="button"
                                  className="ml-1 text-destructive hover:text-destructive/80"
                                  onClick={() => deleteDid(item.id)}
                                >
                                  <XIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={showAddDidModal}>
                          添加 DID
                        </Button>
                      </div>
                    )}
                  />

                  <EditableField
                    label="分机编码"
                    name="codec"
                    value={
                      Array.isArray(extension?.codec)
                        ? extension.codec.join(", ")
                        : extension?.codec || ""
                    }
                    type="custom"
                    renderEdit={(field) => (
                      <div className="flex flex-wrap gap-2">
                        {["PCMA", "PCMU", "G722", "OPUS", "G729", "VP8", "H264", "H265"].map(
                          (codec) => (
                            <div key={codec} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`codec-${codec}`}
                                name={`codec-${codec}`}
                                checked={
                                  Array.isArray(field.value)
                                    ? field.value.includes(codec)
                                    : (field.value || "").includes(codec)
                                }
                                onChange={() => {
                                  let currentValue = field.value || "";
                                  if (Array.isArray(currentValue)) {
                                    if (currentValue.includes(codec)) {
                                      currentValue = currentValue.filter((c) => c !== codec);
                                    } else {
                                      currentValue = [...currentValue, codec];
                                    }
                                  } else {
                                    if (currentValue.includes(codec)) {
                                      currentValue = currentValue
                                        .replace(codec, "")
                                        .replace(/,,/g, ",")
                                        .replace(/^,|,$/g, "");
                                    } else {
                                      currentValue = currentValue
                                        ? `${currentValue},${codec}`
                                        : codec;
                                    }
                                  }
                                  field.onChange(currentValue);
                                }}
                              />
                              <label htmlFor={`codec-${codec}`} className="ml-1 text-sm">
                                {codec}
                              </label>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  />

                  <EditableField
                    label={tt("ringbackOn")}
                    name="enable_ringback"
                    value={getYesNoDisplay(extension?.enable_ringback)}
                    type="switch"
                    switchCheckedValue="1"
                    switchUncheckedValue="0"
                  />

                  <EditableField
                    label={tt("ringback")}
                    name="ringback"
                    value={
                      <RingtoneField
                        value={extension?.ringback}
                        edit={false}
                        text={ringbackName}
                        url={ringbackUrl}
                      />
                    }
                    type="custom"
                    renderEdit={(field) => (
                      <RingtoneField
                        value={field.value}
                        edit={true}
                        text={ringbackName}
                        url={ringbackUrl}
                        onChange={(mediaFile) => {
                          if (mediaFile) {
                            const ringbackData = {
                              media_id: mediaFile.id,
                              media_path: mediaFile.abs_path || mediaFile.rel_path,
                              media_type: mediaFile.type,
                              media_k: mediaFile.name,
                            };
                            console.log("ringbackData", ringbackData);

                            field.onChange(ringbackData);

                            setExtension((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                ringback: ringbackData,
                              } as any;
                            });

                            setRingbackName(mediaFile.name || "");
                            if (mediaFile.type === "RINGTONE" || mediaFile.v) {
                              const tonePath =
                                mediaFile.v || mediaFile.abs_path?.replace(/^tone_stream:\/\//, "");
                              setRingbackUrl(`/api/tones/${tonePath}`);
                            } else {
                              let url = `/api/media_files/${mediaFile.id}`;
                              if (mediaFile.ext) {
                                url += `.${mediaFile.ext}`;
                              }
                              setRingbackUrl(url);
                            }
                          } else {
                            field.onChange(null);

                            setExtension((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                ringback: null,
                              } as any;
                            });
                            setRingbackName("");
                            setRingbackUrl("");
                          }
                        }}
                      />
                    )}
                  />

                  <EditableField
                    label={tt("No Intercepted Permission")}
                    name="intercepted"
                    value={extension?.intercepted?.toString() || "0"}
                    type="select"
                    options={interceptedOptions.map((item: any) => ({
                      value: item.k,
                      label: tt(item.v),
                    }))}
                  />
                </EditableSection>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* 添加DID模态框 */}
      <Dialog open={addDidModalVisible} onOpenChange={setAddDidModalVisible}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加DID</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                <span className="text-red-500">* </span>DID号码
              </label>
              <Input
                type="text"
                value={newDidNumber}
                onChange={(e) => setNewDidNumber(e.target.value)}
                placeholder="请输入DID号码"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">描述</label>
              <Input
                type="text"
                value={newDidDescription}
                onChange={(e) => setNewDidDescription(e.target.value)}
                placeholder="请输入描述"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={hideAddDidModal}>
              关闭
            </Button>
            <Button onClick={addDid}>提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
