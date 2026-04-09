"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Cdr } from "@repo/api-client";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

function AudioPlayerFetch({ src }: { src: string }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  useEffect(() => {
    let isMounted = true;

    fetch(src)
      .then((res) => res.blob())
      .then((blob) => {
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Failed to load audio:", error);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [src]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
        }
      });
    }
  }, [audioUrl]);

  return loading ? (
    <span>音频加载中...</span>
  ) : audioUrl ? (
    <audio ref={audioRef} src={audioUrl} controls className="h-8" />
  ) : (
    <span>音频加载失败</span>
  );
}

interface CdrDetailDialogProps {
  cdr: Cdr | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CdrDetailDialog({ cdr, open, onOpenChange }: CdrDetailDialogProps) {
  const t = useTranslations("cdr");
  const tc = useTranslations("common");
  const [mfiles, setMfiles] = useState<any[]>([]);

  const loadMfiles = useCallback(async (uuid: string) => {
    try {
      console.log("Loading mfiles for UUID:", uuid);
      const response = await fetch(`/api/media_files?uuid=${uuid}`);
      const data = await response.json();
      console.log("Mfiles response:", data);
      setMfiles(data.data || []);
      console.log("Mfiles set:", data.data || []);
    } catch (error) {
      console.error("Failed to load mfiles:", error);
    }
  }, []);

  useEffect(() => {
    if (cdr && open) {
      void cdr.uuid;
      void loadMfiles(cdr.uuid);
    }
  }, [cdr, open, loadMfiles]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(tc("copied"));
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  if (!cdr) return null;

  const getHangupCauseColor = (cause: string | undefined) => {
    return cause === "NORMAL_CLEARING" ? "text-green-600" : "text-red-600";
  };

  const getRouteLinks = (routeIds: string) => {
    if (!routeIds) return "-";
    const ids = routeIds.split(",");
    return ids.map((id, index) => {
      const parts = id.split("-");
      const routeId = parts[1] || parts[0];
      const isHotline = parts[1] !== undefined;
      return (
        <span key={id}>
          <Link
            href={isHotline ? `/hotlines/${routeId}` : `/routes/${routeId}`}
            className="text-primary hover:underline"
          >
            {routeId}
          </Link>
          {index < ids.length - 1 && ", "}
        </span>
      );
    });
  };

  const DetailRow = ({
    label,
    value,
    colSpan = 1,
    copyable = false,
    linkTo,
  }: {
    label: string;
    value: React.ReactNode;
    colSpan?: 1 | 2 | 3;
    copyable?: boolean;
    linkTo?: string;
  }) => (
    <TableRow className="hover:bg-transparent">
      <TableCell className="w-[140px] bg-muted/50 font-medium text-muted-foreground border-r border-border">
        {label}
      </TableCell>
      <TableCell colSpan={colSpan} className="border-r border-border last:border-r-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">{value}</div>
          {copyable && typeof value === "string" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => void handleCopy(value)}
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          )}
          {linkTo && (
            <Link href={linkTo} target="_blank">
              <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">
                {t("bill")}
              </Button>
            </Link>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  const DoubleDetailRow = ({
    label1,
    value1,
    label2,
    value2,
  }: {
    label1: string;
    value1: React.ReactNode;
    label2: string;
    value2: React.ReactNode;
  }) => (
    <TableRow className="hover:bg-transparent">
      <TableCell className="w-[140px] bg-muted/50 font-medium text-muted-foreground border-r border-border">
        {label1}
      </TableCell>
      <TableCell className="border-r border-border">{value1}</TableCell>
      <TableCell className="w-[140px] bg-muted/50 font-medium text-muted-foreground border-r border-border">
        {label2}
      </TableCell>
      <TableCell>{value2}</TableCell>
    </TableRow>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[66.666vw] !max-w-[66.666vw] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>{t("cdrDetail")}</DialogTitle>
        </DialogHeader>

        <div className="p-6 overflow-auto">
          <Table className="border rounded-lg overflow-hidden">
            <TableBody>
              <DetailRow
                label={t("uuid")}
                value={cdr.uuid}
                colSpan={3}
                copyable
                linkTo={`/bills/${cdr.uuid}`}
              />

              <DetailRow
                label={t("otherUuid")}
                value={cdr.other_uuid || "-"}
                colSpan={3}
                copyable={!!cdr.other_uuid}
              />

              <DetailRow
                label={t("callId")}
                value={cdr.sip_call_id || "-"}
                colSpan={3}
                copyable={!!cdr.sip_call_id}
              />

              <DetailRow
                label={t("Caller Source")}
                value={t(cdr.caller_source) || cdr.caller_source || "-"}
                colSpan={3}
              />

              <DoubleDetailRow
                label1={t("cidName")}
                value1={cdr.caller_id_name || "-"}
                label2={t("cidNumber")}
                value2={cdr.caller_id_number || "-"}
              />

              <DoubleDetailRow
                label1={t("destNumber")}
                value1={cdr.destination_number || "-"}
                label2={t("accountCode")}
                value2={cdr.account_code || "-"}
              />

              <DoubleDetailRow
                label1={t("context")}
                value1={cdr.context || "-"}
                label2={t("networkAddr")}
                value2={`${cdr.network_addr || "-"}${cdr.network_port ? `:${cdr.network_port}` : ""}`}
              />

              <DoubleDetailRow
                label1={t("duration")}
                value1={cdr.duration || "-"}
                label2={t("billSec")}
                value2={cdr.billsec || "-"}
              />

              <DoubleDetailRow
                label1={t("startedAt")}
                value1={cdr.start_stamp || "-"}
                label2={t("ringTime")}
                value2={cdr.ring_stamp || "-"}
              />

              <DoubleDetailRow
                label1={t("answerTime")}
                value1={cdr.answer_stamp || "-"}
                label2={t("endedAt")}
                value2={cdr.end_stamp || "-"}
              />

              <TableRow className="hover:bg-transparent">
                <TableCell className="w-[140px] bg-muted/50 font-medium text-muted-foreground border-r border-border">
                  {t("Cause")}
                </TableCell>
                <TableCell className="border-r border-border">
                  <span className={getHangupCauseColor(cdr.hangup_cause)}>
                    {t(`${cdr.hangup_cause}`) || t(`${cdr.xui_hangup_cause}`)}({cdr.hangup_cause})
                  </span>
                </TableCell>
                <TableCell className="w-[140px] bg-muted/50 font-medium text-muted-foreground border-r border-border">
                  {t("errorCode")}
                </TableCell>
                <TableCell>{cdr.sip_invite_failure_status || "-"}</TableCell>
              </TableRow>

              <DoubleDetailRow
                label1={t("hangupDisposition")}
                value1={
                  cdr.hangup_cause !== "MANAGER_REQUEST"
                    ? `${t(`${cdr.sip_hangup_disposition}`)}(${cdr.sip_hangup_disposition})` || "-"
                    : "{}"
                }
                label2={t("codecName")}
                value2={cdr.rtp_use_codec_name || "-"}
              />

              <DoubleDetailRow
                label1={t("videoRecvCodec")}
                value1={cdr.video_read_codec || "-"}
                label2={t("videoSendCodec")}
                value2={cdr.video_write_codec || "-"}
              />

              <DetailRow
                label={t("videoMediaFlow")}
                value={cdr.video_media_flow || "-"}
                colSpan={3}
              />

              <TableRow className="hover:bg-transparent">
                <TableCell className="w-[140px] bg-muted/50 font-medium text-muted-foreground border-r border-border">
                  {t("recording")}
                </TableCell>
                <TableCell colSpan={3}>
                  {mfiles.length > 0 ? (
                    <div className="space-y-3">
                      {mfiles
                        .map((mfile) => {
                          const media_type = (mfile.mime || "").split("/")[0];
                          const fileId = mfile.id;
                          const fileExtension = mfile.ext || "wav"; // 默认使用 wav 扩展名
                          const src = `/api/media_files/${fileId}.${fileExtension}`;

                          if (media_type === "audio") {
                            return (
                              <div key={fileId} className="flex flex-col gap-2">
                                <Link
                                  href={`/media_files/${fileId}`}
                                  target="_blank"
                                  className="text-primary hover:underline text-sm"
                                >
                                  {mfile.name}
                                </Link>
                                <AudioPlayerFetch src={src} />
                              </div>
                            );
                          } else if (media_type === "video") {
                            return (
                              <div key={fileId} className="flex flex-col gap-2">
                                <Link
                                  href={`/media_files/${fileId}`}
                                  target="_blank"
                                  className="text-primary hover:underline text-sm"
                                >
                                  {mfile.name}
                                </Link>
                                <video
                                  src={src}
                                  controls
                                  className="max-w-[200px] max-h-[150px] rounded"
                                />
                              </div>
                            );
                          }
                          return null;
                        })
                        .filter(Boolean)}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>

              <DetailRow label={t("route")} value={getRouteLinks(cdr.xui_route_ids)} colSpan={3} />
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button onClick={() => onOpenChange(false)}>{tc("close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
