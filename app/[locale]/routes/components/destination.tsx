import React, { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { type DictItem } from "@repo/api-client";
import { cn } from "@/lib/utils";
import { useFormContext, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormItem, FormControl, FormMessage, FormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { extensionsApi, routesApi } from "@/lib/api-client";
import { getLabels } from "@/lib/utils";

// 定义需要渲染 Combobox 的类型
const COMBOBOX_TYPES = ["FS_DEST_RING_EXTNS", "FS_DEST_SEQ_EXTNS"];

// 定义需要渲染 Select 的类型
const SELECT_TYPES = [
  "FS_DEST_CONFERENCE_ROOM",
  "FS_DEST_MEETING_ROOM",
  "FS_DEST_USER_CONFERENCE",
  "FS_DEST_IVR",
  "FS_DEST_CTI",
  "FS_DEST_USERGW",
  "FS_DEST_CLUSTER_TRUNK",
  "FS_DEST_CLUSTER_TRUNK_GROUP",
  "FS_DEST_SCRIPT",
  "FS_DEST_IVRBLOCK",
  "FS_DEST_DISTRIBUTORS",
  "FS_DEST_CALLFLOW",
];

// 定义需要渲染 Input 的类型
const INPUT_TYPES = ["FS_DEST_IP", "FS_DEST_AGORA", "FS_DEST_TENCENT"];

// 定义需要渲染 Textarea 的类型
const TEXTAREA_TYPES = ["FS_DEST_SYSTEM"];

// 获取类型的显示标签
const getTypeLabel = (type: string, t: any) => {
  const labelMap: Record<string, string> = {
    FS_DEST_RING_EXTNS: t("extension"),
    FS_DEST_SEQ_EXTNS: t("extension"),
    FS_DEST_USERGW: t("extension"),
    FS_DEST_CONFERENCE_ROOM: t("conference"),
    FS_DEST_MEETING_ROOM: t("conference"),
    FS_DEST_USER_CONFERENCE: t("Conference Profiles"),
    FS_DEST_IVR: "IVR",
    FS_DEST_CTI: t("Call Center Queue"),
    FS_DEST_CLUSTER_TRUNK_GROUP: t("Trunk Group"),
    FS_DEST_IVRBLOCK: t("IVR Blocks"),
    FS_DEST_DISTRIBUTORS: t("Distributors"),
    FS_DEST_CALLFLOW: t("Callflows"),
    FS_DEST_IP: t("ipAddress"),
    FS_DEST_AGORA: t("Callback URL"),
    FS_DEST_TENCENT: t("Connector Address"),
    FS_DEST_SYSTEM: t("Content"),
    FS_DEST_CHATGPT: t("AI Robots"),
  };
  return labelMap[type] || type;
};

export function Destination({
  isEditing = false,
  destinationTypes = [],
}: {
  isEditing?: boolean;
  destinationTypes: DictItem[];
}) {
  const t = useTranslations("routes");
  const tc = useTranslations("common");
  const form = useFormContext();
  const anchor = useComboboxAnchor();
  const [comboboxData, setComboboxData] = useState<any[]>([]);
  const [selectData, setSelectData] = useState<any[]>([]);
  const initializedRef = useRef(false);
  const [tenData, setTenData] = useState<any>({});

  const language = [
    {
      value: "zh-CN",
      label: t("Chinese"),
    },
    {
      value: "en-US",
      label: t("English"),
    },
    {
      value: "ko-KR",
      label: t("Korean"),
    },
    {
      value: "ja-JP",
      label: t("Japanese"),
    },
  ];

  const voiceOptions = [
    {
      value: "male",
      label: t("Male Voice"),
    },
    {
      value: "female",
      label: t("Female Voice"),
    },
  ];

  // 监听表单字段变化
  const destType = useWatch({ name: "dest_type", control: form.control }) || "";
  const destUuid = useWatch({ name: "dest_uuid", control: form.control }) || "";
  const body = useWatch({ name: "body", control: form.control }) || "";

  const getExtensions = async () => {
    const queryParams = {
      page: 1,
      pageSize: 500,
    };
    const res = await extensionsApi.list(queryParams);
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item) => {
      return {
        value: `${item.extn}|${item.domain}`,
        label: `${item.extn} (${item.domain})`,
      };
    });
    setComboboxData(newData || []);
  };

  const getConferenceRooms = async () => {
    const res = await routesApi.getConferenceRooms();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.id,
        label: `${item.name}[${item.nbr}]`,
      };
    });
    setSelectData(newData || []);
  };

  const getReservationMeetings = async () => {
    const res = await routesApi.getReservationMeetings();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.id,
        label: `${item.name}[${item.nbr}]`,
      };
    });
    setSelectData(newData || []);
  };

  const getConferenceProfiles = async () => {
    const res = await routesApi.getConferenceProfiles();
    const responseData = res.data;
    const newData: any = responseData?.map((item: any) => {
      return {
        value: item.id,
        label: `${item.name}[${item.description}]`,
      };
    });
    setSelectData(newData || []);
  };

  const getIvrs = async () => {
    const res = await routesApi.getIvrs();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.id,
        label: `${item.name}${item.description ? `[${item.description}]` : ""}`,
      };
    });
    setSelectData(newData || []);
  };

  const getQueues = async () => {
    const res = await routesApi.getQueues();
    const responseData = res.data;
    const newData: any = responseData?.map((item: any) => {
      return {
        value: item.id.toString(),
        label: `${item.name}[${item.cti_template}]${item.description ? `-${item.description}` : ""}`,
      };
    });
    setSelectData(newData || []);
  };

  const getGateways = async () => {
    const res = await routesApi.getGateways();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.id,
        label: `${item.name}${item.realm ? `[${item.realm}]` : ""}`,
      };
    });
    setSelectData(newData || []);
  };

  const getExtensionsGateways = async () => {
    const res = await routesApi.getExtensionsGateways();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.id.toString(),
        label: `${item.extn}[${item.domain}]`,
      };
    });
    setSelectData(newData || []);
  };

  const getTrunks = async () => {
    const res = await routesApi.getTrunks();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.id.toString(),
        label: `${item.extn}[${item.domain}]`,
      };
    });
    setSelectData(newData || []);
  };

  const getTrunkGroups = async () => {
    const res = await routesApi.getTrunkGroups();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.id.toString(),
        label: item.name,
      };
    });
    setSelectData(newData || []);
  };

  const getScripts = async () => {
    const res = await routesApi.getScripts();
    const responseData = res.data;
    const newData: any = responseData?.map((item: any) => {
      return {
        value: item.id.toString(),
        label: item.name,
      };
    });
    setSelectData(newData || []);
  };

  const getBlocks = async () => {
    const res = await routesApi.getBlocks();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.id.toString(),
        label: `${item.name}${item.description ? `[${item.description}]` : ""}`,
      };
    });
    setSelectData(newData || []);
  };

  const getDistributors = async () => {
    const res = await routesApi.getDistributors();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.id.toString(),
        label: `${item.name}${item.body ? `[${item.body}]` : ""}`,
      };
    });
    setSelectData(newData || []);
  };

  const getAiRobots = async () => {
    const res = await routesApi.getAiRobots();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.uuid,
        label: item.name,
      };
    });
    setSelectData(newData || []);
  };

  const getCallflows = async () => {
    const res = await routesApi.getCallflows();
    const responseData = res.data;
    const newData: any = responseData?.data?.map((item: any) => {
      return {
        value: item.id,
        label: `${item.name}${item.description ? `[${item.description}]` : ""}`,
      };
    });
    setSelectData(newData || []);
  };

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    if (destType === "FS_DEST_RING_EXTNS" || destType === "FS_DEST_SEQ_EXTNS") {
      void getExtensions();
    } else if (destType === "FS_DEST_CONFERENCE_ROOM") {
      void getConferenceRooms();
    } else if (destType === "FS_DEST_MEETING_ROOM") {
      void getReservationMeetings();
    } else if (destType === "FS_DEST_USER_CONFERENCE") {
      void getConferenceProfiles();
    } else if (destType === "FS_DEST_IVR") {
      void getIvrs();
    } else if (destType === "FS_DEST_CTI") {
      void getQueues();
    } else if (destType === "FS_DEST_GATEWAY") {
      void getGateways();
    } else if (destType === "FS_DEST_USERGW") {
      void getExtensionsGateways();
    } else if (destType === "FS_DEST_CLUSTER_TRUNK") {
      void getTrunks();
    } else if (destType === "FS_DEST_CLUSTER_TRUNK_GROUP") {
      void getTrunkGroups();
    } else if (destType === "FS_DEST_SCRIPT") {
      void getScripts();
    } else if (destType === "FS_DEST_IVRBLOCK") {
      void getBlocks();
    } else if (destType === "FS_DEST_DISTRIBUTORS") {
      void getDistributors();
    } else if (destType === "FS_DEST_CHATGPT") {
      void getAiRobots();
    } else if (destType === "FS_DEST_CALLFLOW") {
      void getCallflows();
    }
  }, [destType]);

  useEffect(() => {
    if (destType === "FS_DEST_TEN" && destUuid) {
      try {
        const newData = JSON.parse(destUuid);
        setTenData(newData);
      } catch (e) {
        console.error("解析 TEN 数据失败", e);
      }
    }
  }, [destType, destUuid]);

  // 渲染 Combobox 类型
  const renderCombobox = () => {
    return (
      <FormField
        name="dest_uuid"
        control={form.control}
        rules={{ required: `${getTypeLabel(destType, t)}${tc("required")}` }}
        render={({ field, fieldState }) => (
          <FormItem>
            <Combobox
              multiple
              autoHighlight
              items={comboboxData}
              value={typeof field.value !== "string" ? field.value : parseValue(field.value)}
              onValueChange={handleValueChange(field)}
              disabled={!isEditing}
            >
              <ComboboxChips
                ref={anchor}
                className={cn(
                  "w-full",
                  fieldState.error && "border-destructive ring-3 ring-destructive/20",
                )}
              >
                <ComboboxValue>
                  {(values) => (
                    <React.Fragment>
                      {Array.isArray(values) &&
                        values.length > 0 &&
                        values.map((value: string) => {
                          const item = comboboxData.find((item) => item.value === value);
                          return (
                            <ComboboxChip key={value}>{item ? item.label : value}</ComboboxChip>
                          );
                        })}
                      <ComboboxChipsInput />
                    </React.Fragment>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>没有找到匹配项</ComboboxEmpty>
                <ComboboxList>
                  {comboboxData.map((item) => (
                    <ComboboxItem key={item.value} value={item.value}>
                      {item.label}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // 解析 Combobox 值的辅助函数
  const parseValue = (value: any) => {
    if (!value || value.length === 0) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item: { extn: string }) => item.extn);
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const handleValueChange = (field: any) => (selectedValues: string[]) => {
    field.onChange(selectedValues);
  };

  // 渲染 Select 类型
  const renderSelect = (fieldName: string = "dest_uuid", required = false) => {
    return (
      <FormField
        name={fieldName}
        control={form.control}
        rules={required ? { required: `${getTypeLabel(destType, t)}${tc("required")}` } : {}}
        render={({ field, fieldState }) => (
          <FormItem>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                className={cn(
                  "w-full",
                  fieldState.error && "border-destructive ring-3 ring-destructive/20",
                )}
              >
                <SelectValue placeholder={`请选择${getTypeLabel(destType, t)}`} />
              </SelectTrigger>
              <SelectContent>
                {selectData.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // 渲染 Input 类型
  const renderInput = (fieldName: string = "dest_uuid", placeholder?: string, required = false) => {
    return (
      <FormField
        name={fieldName}
        control={form.control}
        rules={
          required
            ? { required: `${placeholder || getTypeLabel(destType, t)}${tc("required")}` }
            : {}
        }
        render={({ field, fieldState }) => (
          <FormItem>
            <Input {...field} placeholder={placeholder || "请输入"} />
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // 渲染 Textarea 类型
  const renderTextarea = (required = false) => {
    return (
      <FormField
        name="body"
        control={form.control}
        rules={required ? { required: `${t("Content")} ${tc("required")}` } : {}}
        render={({ field, fieldState }) => (
          <FormItem>
            <Textarea {...field} placeholder="请输入内容" className="min-h-[100px]" />
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // 渲染 FS_DEST_TEN 类型
  const renderTen = () => {
    const handleTenDataChange = (key: string, value: string) => {
      const newData = { ...tenData, [key]: value };
      setTenData(newData);
      // 更新表单的 dest_uuid 字段
      form.setValue("dest_uuid", JSON.stringify(newData));
    };

    return (
      <>
        {/* TEN 地址 */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-1">
            <Label className="text-muted-foreground text-sm">
              <span className="text-destructive text-xs">*</span>
              {t("TEN Address")}
            </Label>
          </div>
          {isEditing ? (
            <FormField
              name="url"
              control={form.control}
              rules={{
                validate: (value) => {
                  if (!tenData.url || tenData.url === "") {
                    return `${t("TEN Address")}${tc("required")}`;
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={t("Please Input TEN Address")}
                      value={tenData.url || ""}
                      onChange={(e) => {
                        field.onChange(e);
                        handleTenDataChange("url", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="min-h-[2.25rem] py-1 text-sm">{tenData.url || "-"}</div>
          )}
        </div>

        {/* 语言 */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-1">
            <Label className="text-muted-foreground text-sm">
              <span className="text-destructive text-xs">*</span>
              {t("Language")}
            </Label>
          </div>
          {isEditing ? (
            <FormField
              name="language"
              control={form.control}
              rules={{
                validate: (value) => {
                  if (!tenData.language || tenData.language === "") {
                    return `${t("Language")}${tc("required")}`;
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={tenData.language || ""}
                      onValueChange={(value) => {
                        handleTenDataChange("language", value);
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          fieldState.error && "border-destructive ring-3 ring-destructive/20",
                        )}
                      >
                        <SelectValue placeholder="请选择语言" />
                      </SelectTrigger>
                      <SelectContent>
                        {language.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="min-h-[2.25rem] py-1 text-sm">
              {getLabels(language, tenData.language) || "-"}
            </div>
          )}
        </div>

        {/* 声音 */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-1">
            <Label className="text-muted-foreground text-sm">
              <span className="text-destructive text-xs">*</span>
              {t("Voice")}
            </Label>
          </div>
          {isEditing ? (
            <FormField
              name="voice_type"
              control={form.control}
              rules={{
                validate: (value) => {
                  if (!tenData.voice_type || tenData.voice_type === "") {
                    return `${t("Voice")}${tc("required")}`;
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={tenData.voice_type || ""}
                      onValueChange={(value) => {
                        handleTenDataChange("voice_type", value);
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          fieldState.error && "border-destructive ring-3 ring-destructive/20",
                        )}
                      >
                        <SelectValue placeholder="请选择声音" />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="min-h-[2.25rem] py-1 text-sm">
              {getLabels(voiceOptions, tenData.voice_type) || "-"}
            </div>
          )}
        </div>

        {/* Graph Name */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-1">
            <Label className="text-muted-foreground text-sm">
              <span className="text-destructive text-xs">*</span>
              Graph Name
            </Label>
          </div>
          {isEditing ? (
            <FormField
              name="graph_name"
              control={form.control}
              rules={{
                validate: (value) => {
                  if (!tenData.graph_name || tenData.graph_name === "") {
                    return `Graph Name${tc("required")}`;
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="请输入 Graph Name"
                      value={tenData.graph_name || ""}
                      onChange={(e) => {
                        handleTenDataChange("graph_name", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="min-h-[2.25rem] py-1 text-sm">{tenData.graph_name || "-"}</div>
          )}
        </div>

        {/* 提示词 */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-1">
            <Label className="text-muted-foreground text-sm">{t("Prompt")}</Label>
          </div>
          {isEditing ? (
            <FormField
              name="prompt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={t("Please Input Prompt")}
                      value={tenData.prompt || ""}
                      onChange={(e) => {
                        handleTenDataChange("prompt", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="min-h-[2.25rem] py-1 text-sm">{tenData.prompt || "-"}</div>
          )}
        </div>
      </>
    );
  };

  // 渲染 FS_DEST_CHATGPT 类型
  const renderChatgpt = () => {
    return (
      <>
        <div className="md:col-span-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <Label className="text-muted-foreground text-sm">{t("AI Robots") || "AI 机器人"}</Label>
          </div>
          {isEditing ? renderSelect("dest_uuid", true) : renderDetailPlaceholder(destUuid)}
        </div>
        <div className="md:col-span-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <Label className="text-muted-foreground text-sm">{t("Topic") || "主题"}</Label>
          </div>
          {isEditing ? (
            renderInput("body", undefined, false)
          ) : (
            <div className="min-h-[2.25rem] py-1 text-sm">{body}</div>
          )}
        </div>
      </>
    );
  };

  // 渲染 FS_DEST_GATEWAY 类型
  const renderGateway = () => {
    const gatewayValues = destUuid ? destUuid.split(",") : ["", ""];
    const primaryGateway = gatewayValues[0] || "";
    const backupGateway = gatewayValues[1] || "";

    return (
      <>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <Label className="text-muted-foreground text-sm">{t("gateway") || "网关"}</Label>
          </div>
          {isEditing ? (
            <FormField
              name="dest_uuid"
              control={form.control}
              rules={{ required: `${t("gateway")} ${tc("required")}` }}
              render={({ field, fieldState }) => {
                const values = field.value ? field.value.split(",") : ["", ""];
                return (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={values[0] || ""}
                        onValueChange={(value) => {
                          const newValues = [value, values[1] || ""];
                          field.onChange(newValues.join(","));
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择主网关" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectData.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          ) : (
            <div className="min-h-[2.25rem] py-1 text-sm">
              {selectData.find((item) => item.value === primaryGateway)?.label || "-"}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <Label className="text-muted-foreground text-sm">
              {t("backupGateway") || "备用网关"}
            </Label>
          </div>
          {isEditing ? (
            <FormField
              name="dest_uuid"
              control={form.control}
              render={({ field }) => {
                const values = field.value ? field.value.split(",") : ["", ""];
                return (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={values[1] || ""}
                        onValueChange={(value) => {
                          const newValues = [values[0] || "", value];
                          field.onChange(newValues.join(","));
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择备用网关" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectData.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          ) : (
            <div className="min-h-[2.25rem] py-1 text-sm">
              {selectData.find((item) => item.value === backupGateway)?.label || "-"}
            </div>
          )}
        </div>
      </>
    );
  };

  // 渲染详情模式的占位符
  const renderDetailPlaceholder = (value?: string) => {
    const displayValue = selectData.find((item) => item.value === value)?.label || "-";
    return <div className="min-h-[2.25rem] py-1 text-sm">{displayValue}</div>;
  };

  return (
    <div className={cn("col-span-full bg-gray-50/50 p-4 mb-4")}>
      {/* 目的地类型选择 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-muted-foreground text-sm">{t("destinationType")}</span>
          </div>
          {isEditing ? (
            <FormField
              name="dest_type"
              control={form.control}
              rules={{ required: `${t("destinationType")} ${tc("required")}` }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // 清空相关字段的值
                        form.setValue("dest_uuid", "");
                        form.setValue("body", "");
                        // 清除相关字段的校验错误
                        form.clearErrors([
                          "dest_uuid",
                          "body",
                          "url",
                          "language",
                          "voice_type",
                          "graph_name",
                          "prompt",
                        ]);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="请选择目的地类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinationTypes.map((type) => (
                          <SelectItem key={type.k} value={type.k}>
                            {t(type.k)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="min-h-[2.25rem] py-1 text-sm">{t(destType)}</div>
          )}
        </div>
        {/* 动态渲染对应的字段 */}
        {destType && (
          <>
            {/* Combobox 类型 */}
            {COMBOBOX_TYPES.includes(destType) && (
              <div className="md:col-span-1">
                <div className="flex items-center gap-1 mb-2">
                  <Label className="text-muted-foreground text-sm">
                    {getTypeLabel(destType, t)}
                  </Label>
                </div>
                {renderCombobox()}
              </div>
            )}

            {/* Select 类型 */}
            {SELECT_TYPES.includes(destType) && (
              <div className="md:col-span-1">
                <div className="flex items-center gap-1 mb-2">
                  <Label className="text-muted-foreground text-sm">
                    {getTypeLabel(destType, t)}
                  </Label>
                </div>
                {isEditing ? renderSelect("dest_uuid", true) : renderDetailPlaceholder(destUuid)}
              </div>
            )}

            {/* Input 类型 */}
            {INPUT_TYPES.includes(destType) && (
              <div className="md:col-span-1">
                <div className="flex items-center gap-1 mb-2">
                  <Label className="text-muted-foreground text-sm">
                    {getTypeLabel(destType, t)}
                  </Label>
                </div>
                {isEditing ? (
                  renderInput("body", `请输入${getTypeLabel(destType, t)}`, true)
                ) : (
                  <div className="min-h-[2.25rem] py-1 text-sm">{body}</div>
                )}
              </div>
            )}

            {/* Textarea 类型 */}
            {TEXTAREA_TYPES.includes(destType) && (
              <div className="md:col-span-3">
                <div className="flex items-center gap-1">
                  <Label className="text-muted-foreground text-sm">
                    {getTypeLabel(destType, t)}
                  </Label>
                </div>
                {isEditing ? (
                  renderTextarea(true)
                ) : (
                  <div className="min-h-[2.25rem] py-1 text-sm">{body}</div>
                )}
              </div>
            )}

            {destType === "FS_DEST_TEN" && renderTen()}
            {destType === "FS_DEST_CHATGPT" && renderChatgpt()}
            {destType === "FS_DEST_GATEWAY" && renderGateway()}
          </>
        )}
      </div>
    </div>
  );
}
