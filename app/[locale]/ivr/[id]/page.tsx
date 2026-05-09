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
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { ivrsApi } from "@/lib/api-client";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { AudioField } from "@/components/ui/audio-field";
import { IvrActionDialog } from "@/components/ui/ivr-action-dialog";

export interface IVRDetail {
  id: number;
  name: string;
  description: string;
  key: string;
  digit_len: number;
  greet_long?: string;
  greet_long_name?: string;
  greet_long_url?: string;
  greet_short?: string;
  greet_short_name?: string;
  greet_short_url?: string;
  invalid_sound?: string;
  invalid_sound_name?: string;
  invalid_sound_url?: string;
  exit_sound?: string;
  exit_sound_name?: string;
  exit_sound_url?: string;
  transfer_sound?: string;
  transfer_sound_name?: string;
  transfer_sound_url?: string;
  max_failures?: number;
  max_timeouts?: number;
  exec_on_max_failures?: string;
  exec_on_max_timeouts?: string;
  confirm_macro?: string;
  confirm_key?: string;
  tts_engine?: string;
  tts_voice?: string;
  confirm_attempts?: number;
  inter_digit_timeout?: number;
  timeout?: number;
  pin?: string;
  pin_file?: string;
  pin_file_name?: string;
  pin_file_url?: string;
  bad_pin_file?: string;
  bad_pin_file_name?: string;
  bad_pin_file_url?: string;
}

export interface IvrAction {
  id: number;
  digits: string;
  match_prefix: string;
  action: string;
  body: string;
  args?: string;
}

export interface IvrRoute {
  id: number;
  name: string;
  called_prefix: string;
  description: string;
}

function getFileExt(filename: string): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export default function IvrDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const ivrId = parseInt(params.id || "0");
  const t = useTranslations("pages");
  const tt = useTranslations("ivr");

  const [ivr, setIvr] = useState<IVRDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ivrActions, setIvrActions] = useState<IvrAction[]>([]);
  const [ivrRoutes, setIvrRoutes] = useState<IvrRoute[]>([]);
  const [showActionDialog, setShowActionDialog] = useState(false);

  const loadIvrDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ivrResponse, actionsResponse, routesResponse] = await Promise.all([
        ivrsApi.get(ivrId),
        ivrsApi.getActions(ivrId),
        ivrsApi.getRoutes(ivrId),
      ]);

      const data = ivrResponse.data as any;
      if (data && data.id) {
        const parseMediaValue = (value: any): any => {
          if (!value || value === "") return null;

          if (typeof value === "object") {
            return value;
          }

          const val = String(value).trim();
          if (!val) return null;

          if (val.startsWith("{")) {
            try {
              const parsed = JSON.parse(val);
              return parsed;
            } catch (e) {
              console.warn("Failed to parse media value:", val, e);
              return null;
            }
          }
          return null;
        };

        const getMediaPath = (value: any): string => {
          if (!value || value === "") return "";

          const parsed = parseMediaValue(value);
          if (parsed) {
            if (parsed.media_path) return String(parsed.media_path).trim();
            if (parsed.path) return String(parsed.path).trim();
          }

          const val = String(value).trim();
          return val;
        };

        const getAudioUrl = (value: any): string => {
          if (!value || value === "") return "";

          const parsed = parseMediaValue(value);
          if (parsed) {
            if (parsed.media_path?.startsWith("tone_stream://")) {
              const toneValue = parsed.media_path.replace("tone_stream://", "");
              return `/api/tones/${toneValue}`;
            }
            if (parsed.media_path?.startsWith("phrase:")) {
              return "";
            }
            if (parsed.media_id) {
              return `/api/media_files/${parsed.media_id}.wav`;
            }
          }

          const mediaPath = getMediaPath(value);
          if (!mediaPath) return "";

          if (mediaPath.startsWith("tone_stream://")) {
            const toneValue = mediaPath.replace("tone_stream://", "");
            return `/api/tones/${toneValue}`;
          }

          if (mediaPath.startsWith("phrase:")) {
            return "";
          }

          const numericMatch = mediaPath.match(/(\d+)/);
          if (numericMatch) {
            return `/api/media_files/${numericMatch[1]}.wav`;
          }

          return "";
        };

        const getAudioName = (value: any, nameField: string): string => {
          if (data[nameField]) {
            const nameVal = String(data[nameField]).trim();
            if (nameVal) return nameVal;
          }

          const parsed = parseMediaValue(value);
          if (parsed) {
            if (parsed.media_name) return String(parsed.media_name).trim();
            if (parsed.media_path) {
              const mediaPath = String(parsed.media_path).trim();
              if (mediaPath.startsWith("tone_stream://")) {
                return mediaPath.replace("tone_stream://", "");
              }
              if (mediaPath.startsWith("phrase:")) {
                return mediaPath.replace("phrase:", "");
              }
              const parts = mediaPath.split("/");
              return parts[parts.length - 1] || "";
            }
          }

          const mediaPath = getMediaPath(value);
          if (!mediaPath) return "";

          if (mediaPath.startsWith("tone_stream://")) {
            return mediaPath.replace("tone_stream://", "");
          }

          if (mediaPath.startsWith("phrase:")) {
            return mediaPath.replace("phrase:", "");
          }

          const parts = mediaPath.split("/");
          return parts[parts.length - 1] || "";
        };

        setIvr({
          id: data.id,
          name: data.name,
          description: data.description || "",
          key: data.identifier || data.key || "",
          digit_len: data.digit_len || 1,
          greet_long: data.greet_long,
          greet_long_name: getAudioName(data.greet_long, "greet_long_name"),
          greet_long_url: data.greet_long_url || getAudioUrl(data.greet_long),
          greet_short: data.greet_short,
          greet_short_name: getAudioName(data.greet_short, "greet_short_name"),
          greet_short_url: data.greet_short_url || getAudioUrl(data.greet_short),
          invalid_sound: data.invalid_sound,
          invalid_sound_name: getAudioName(data.invalid_sound, "invalid_sound_name"),
          invalid_sound_url: data.invalid_sound_url || getAudioUrl(data.invalid_sound),
          exit_sound: data.exit_sound,
          exit_sound_name: getAudioName(data.exit_sound, "exit_sound_name"),
          exit_sound_url: data.exit_sound_url || getAudioUrl(data.exit_sound),
          transfer_sound: data.transfer_sound,
          transfer_sound_name: getAudioName(data.transfer_sound, "transfer_sound_name"),
          transfer_sound_url: data.transfer_sound_url || getAudioUrl(data.transfer_sound),
          max_failures: data.max_failures,
          max_timeouts: data.max_timeouts,
          exec_on_max_failures: data.exec_on_max_failures,
          exec_on_max_timeouts: data.exec_on_max_timeouts,
          confirm_macro: data.confirm_macro,
          confirm_key: data.confirm_key,
          tts_engine: data.tts_engine,
          tts_voice: data.tts_voice,
          confirm_attempts: data.confirm_attempts,
          inter_digit_timeout: data.inter_digit_timeout,
          timeout: data.timeout,
          pin: data.pin,
          pin_file: data.pin_file,
          pin_file_name: getAudioName(data.pin_file, "pin_file_name"),
          pin_file_url: data.pin_file_url || getAudioUrl(data.pin_file),
          bad_pin_file: data.bad_pin_file,
          bad_pin_file_name: getAudioName(data.bad_pin_file, "bad_pin_file_name"),
          bad_pin_file_url: data.bad_pin_file_url || getAudioUrl(data.bad_pin_file),
        });
      } else {
        setIvr(null);
      }

      const actionsData = actionsResponse.data as any;
      setIvrActions(Array.isArray(actionsData) ? actionsData : actionsData.data || []);

      const routesData = routesResponse.data as any;
      setIvrRoutes(routesData.data || []);
    } catch (error) {
      console.error("Failed to load ivr detail:", error);
      toast.error(tt("loadFailed"));
      setIvr(null);
      setIvrActions([]);
      setIvrRoutes([]);
    } finally {
      setIsLoading(false);
    }
  }, [ivrId, tt]);

  const handleDeleteAction = useCallback(
    async (action: IvrAction) => {
      try {
        await ivrsApi.deleteAction(ivrId, action.id);
        setIvrActions((prev) => prev.filter((a) => a.id !== action.id));
        toast.success(tt("deleteSuccess"));
      } catch (error) {
        console.error("Failed to delete action:", error);
        toast.error(tt("deleteFailed"));
      }
    },
    [ivrId, tt],
  );

  const handleSave = useCallback(
    async (formData: any) => {
      if (!ivr) return false;

      try {
        const updateData = {
          name: formData.name,
          description: formData.description,
          digit_len: parseInt(formData.digit_len) || 1,
        };
        await ivrsApi.update(ivr.id, updateData);
        const updatedIvr: IVRDetail = {
          ...ivr,
          ...updateData,
        };
        setIvr(updatedIvr);

        toast.success(tt("updateSuccess"));
        return true;
      } catch (error) {
        console.error("Failed to update ivr:", error);
        toast.error(tt("updateFailed"));
        return false;
      }
    },
    [ivr, tt],
  );

  const handleExtendedSave = useCallback(
    async (formData: any) => {
      if (!ivr) return false;

      try {
        const updateData: any = {
          max_failures: formData.max_failures ? parseInt(formData.max_failures) : undefined,
          max_timeouts: formData.max_timeouts ? parseInt(formData.max_timeouts) : undefined,
          exec_on_max_failures: formData.exec_on_max_failures || "",
          exec_on_max_timeouts: formData.exec_on_max_timeouts || "",
          confirm_macro: formData.confirm_macro || "",
          confirm_key: formData.confirm_key || "",
          tts_engine: formData.tts_engine || "",
          tts_voice: formData.tts_voice || "",
          confirm_attempts: formData.confirm_attempts
            ? parseInt(formData.confirm_attempts)
            : undefined,
          inter_digit_timeout: formData.inter_digit_timeout
            ? parseInt(formData.inter_digit_timeout)
            : undefined,
          timeout: formData.timeout ? parseInt(formData.timeout) : undefined,
          pin: formData.pin || "",
        };
        await ivrsApi.update(ivr.id, updateData);
        const updatedIvr: IVRDetail = {
          ...ivr,
          max_failures: updateData.max_failures,
          max_timeouts: updateData.max_timeouts,
          exec_on_max_failures: updateData.exec_on_max_failures,
          exec_on_max_timeouts: updateData.exec_on_max_timeouts,
          confirm_macro: updateData.confirm_macro,
          confirm_key: updateData.confirm_key,
          tts_engine: updateData.tts_engine,
          tts_voice: updateData.tts_voice,
          confirm_attempts: updateData.confirm_attempts,
          inter_digit_timeout: updateData.inter_digit_timeout,
          timeout: updateData.timeout,
          pin: updateData.pin,
        };
        setIvr(updatedIvr);

        toast.success(tt("updateSuccess"));
        return true;
      } catch (error) {
        console.error("Failed to update ivr extended info:", error);
        toast.error(tt("updateFailed"));
        return false;
      }
    },
    [ivr, tt],
  );

  const handleAudioChange = useCallback(
    async (name: string, mediaFile: any) => {
      if (!ivr) return;

      try {
        const nameField = `${name}_name`;
        const urlField = `${name}_url`;

        let updateValue = "";
        let nameValue = "";
        let urlValue = "";

        if (mediaFile && mediaFile.id && mediaFile.abs_path) {
          const mediaInfo = {
            media_id: mediaFile.id,
            media_path: mediaFile.abs_path,
            media_type: mediaFile.type || "",
          };
          updateValue = JSON.stringify(mediaInfo);
          nameValue = mediaFile.name || "";

          if (mediaFile.type === "RINGTONE") {
            const tone = mediaFile.rel_path?.replace(/^tone_stream:\/\//, "") || mediaFile.v || "";
            urlValue = `/api/tones/${tone}`;
          } else {
            const ext = mediaFile.ext || getFileExt(mediaFile.abs_path);
            urlValue = `/api/media_files/${mediaFile.id}.${ext}`;
          }
        }

        const updateData: any = {
          [name]: updateValue,
        };
        await ivrsApi.update(ivr.id, updateData);

        const updatedIvr: IVRDetail = {
          ...ivr,
          [name]: updateValue,
          [nameField]: nameValue,
          [urlField]: urlValue,
        };
        setIvr(updatedIvr);
      } catch (error) {
        console.error("Failed to update audio:", error);
        toast.error(tt("updateFailed"));
      }
    },
    [ivr, tt],
  );

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadIvrDetail();
  }, [router, loadIvrDetail]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("ivr")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">{tt("loading")}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!ivr) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("ivr")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">{tt("ivrNotFound")}</div>
            <Button onClick={() => router.push("/ivr")} className="mt-4">
              {tt("backToList")}
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
        <SiteHeader title={t("ivr")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/ivr">{t("ivr")}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{ivr.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>

                  <EditableSection
                    title={tt("basicInfo")}
                    defaultValues={{
                      ...ivr,
                    }}
                    onSave={handleSave}
                  >
                    <EditableField label={tt("id")} name="id" value={ivr.id} type="text" disabled />

                    <EditableField
                      label={tt("name")}
                      name="name"
                      value={ivr.name}
                      type="text"
                      required
                    />

                    <EditableField
                      label={tt("description")}
                      name="description"
                      value={ivr.description || "-"}
                      type="text"
                    />

                    <EditableField
                      label={tt("key")}
                      name="key"
                      value={ivr.key}
                      type="text"
                      disabled
                    />

                    <EditableField
                      label={tt("digitLen")}
                      name="digit_len"
                      value={ivr.digit_len}
                      type="text"
                      required
                    />

                    <AudioField
                      label={tt("greeting")}
                      name="greet_long"
                      value={ivr.greet_long}
                      valueName={ivr.greet_long_name}
                      valueUrl={ivr.greet_long_url}
                      onChange={(...args) => void handleAudioChange(...args)}
                    />

                    <AudioField
                      label={tt("shortGreeting")}
                      name="greet_short"
                      value={ivr.greet_short}
                      valueName={ivr.greet_short_name}
                      valueUrl={ivr.greet_short_url}
                      onChange={(...args) => void handleAudioChange(...args)}
                    />

                    <AudioField
                      label={tt("invalidSound")}
                      name="invalid_sound"
                      value={ivr.invalid_sound}
                      valueName={ivr.invalid_sound_name}
                      valueUrl={ivr.invalid_sound_url}
                      onChange={(...args) => void handleAudioChange(...args)}
                    />

                    <AudioField
                      label={tt("exitSound")}
                      name="exit_sound"
                      value={ivr.exit_sound}
                      valueName={ivr.exit_sound_name}
                      valueUrl={ivr.exit_sound_url}
                      onChange={(...args) => void handleAudioChange(...args)}
                    />

                    <AudioField
                      label={tt("transferSound")}
                      name="transfer_sound"
                      value={ivr.transfer_sound}
                      valueName={ivr.transfer_sound_name}
                      valueUrl={ivr.transfer_sound_url}
                      onChange={(...args) => void handleAudioChange(...args)}
                    />
                  </EditableSection>

                  <EditableSection
                    title={tt("extendedInfo")}
                    defaultValues={{
                      ...ivr,
                    }}
                    onSave={handleExtendedSave}
                  >
                    <EditableField
                      label={tt("maxFailures")}
                      name="max_failures"
                      value={ivr.max_failures || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("maxTimeouts")}
                      name="max_timeouts"
                      value={ivr.max_timeouts || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("execOnMaxFailures")}
                      name="exec_on_max_failures"
                      value={ivr.exec_on_max_failures || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("execOnMaxTimeouts")}
                      name="exec_on_max_timeouts"
                      value={ivr.exec_on_max_timeouts || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("confirmMacro")}
                      name="confirm_macro"
                      value={ivr.confirm_macro || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("confirmKey")}
                      name="confirm_key"
                      value={ivr.confirm_key || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("ttsEngine")}
                      name="tts_engine"
                      value={ivr.tts_engine || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("ttsVoice")}
                      name="tts_voice"
                      value={ivr.tts_voice || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("confirmAttempts")}
                      name="confirm_attempts"
                      value={ivr.confirm_attempts || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("interDigitTimeout")}
                      name="inter_digit_timeout"
                      value={ivr.inter_digit_timeout || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("inputTimeout")}
                      name="timeout"
                      value={ivr.timeout || ""}
                      type="text"
                    />

                    <EditableField
                      label={tt("pin")}
                      name="pin"
                      value={ivr.pin || ""}
                      type="text"
                      showRandomButton
                    />

                    <AudioField
                      label={tt("pinFile")}
                      name="pin_file"
                      value={ivr.pin_file}
                      valueName={ivr.pin_file_name}
                      valueUrl={ivr.pin_file_url}
                      onChange={(...args) => void handleAudioChange(...args)}
                    />

                    <AudioField
                      label={tt("badPinFile")}
                      name="bad_pin_file"
                      value={ivr.bad_pin_file}
                      valueName={ivr.bad_pin_file_name}
                      valueUrl={ivr.bad_pin_file_url}
                      onChange={(...args) => void handleAudioChange(...args)}
                    />
                  </EditableSection>

                  <div className="rounded-lg border bg-background mt-8">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <h3 className="font-medium">{tt("ivrKeyActions")}</h3>
                      <Button variant="default" size="sm" onClick={() => setShowActionDialog(true)}>
                        <PlusIcon className="mr-1 h-3.5 w-3.5" />
                        {tt("add")}
                      </Button>
                    </div>
                    <div className="divide-y divide-gray-100">
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-1">{tt("id")}</div>
                        <div className="col-span-1">{tt("digits")}</div>
                        <div className="col-span-2">{tt("matchPrefix")}</div>
                        <div className="col-span-2">{tt("action")}</div>
                        <div className="col-span-4">内容</div>
                        <div className="col-span-2">{tt("operations")}</div>
                      </div>
                      {ivrActions.length > 0 ? (
                        ivrActions.map((action) => (
                          <div
                            key={action.id}
                            className="px-4 py-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="grid grid-cols-12 gap-4 text-sm">
                              <div className="col-span-1">
                                <span className="text-muted-foreground">{action.id}</span>
                              </div>
                              <div className="col-span-1">
                                <a
                                  href={`/ivr/${ivrId}/actions/${action.id}`}
                                  className="text-teal-600 hover:text-teal-700 transition-colors"
                                >
                                  {action.digits}
                                </a>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">
                                  {String(action.match_prefix) === "1" ? tt("yes") : tt("no")}
                                </span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">{action.action}</span>
                              </div>
                              <div className="col-span-4">
                                <span className="text-foreground truncate">
                                  {action.body || action.args || "-"}
                                </span>
                              </div>
                              <div className="col-span-2">
                                <button
                                  onClick={() => void handleDeleteAction(action)}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {tt("delete")}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-muted-foreground"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                              </svg>
                            </div>
                            <span className="text-muted-foreground">{tt("noData")}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background mt-8">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <h3 className="font-medium">{tt("associatedRoutes")}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {tt("id")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {tt("name")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {tt("calledPrefix")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {tt("description")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {ivrRoutes.length > 0 ? (
                            ivrRoutes.map((route) => (
                              <tr key={route.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{route.id}</td>
                                <td className="px-4 py-3">
                                  <a href="#" className="text-sm text-teal-600 hover:text-teal-900">
                                    {route.name}
                                  </a>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {route.called_prefix}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {route.description || "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-8 text-center text-sm text-gray-500"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <svg
                                      className="w-6 h-6 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                  </div>
                                  <span>{tt("noData")}</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <IvrActionDialog
          open={showActionDialog}
          onOpenChange={setShowActionDialog}
          ivrId={ivrId}
          onActionAdded={() => void loadIvrDetail()}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
