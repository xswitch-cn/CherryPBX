"use client";

import * as React from "react";
import { PlayCircle, Pause, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioState {
  setChecked: (checked: boolean) => void;
}

let lastXAudio: AudioState | null = null;

export interface AudioPlayerProps {
  text: string;
  url: string;
  className?: string;
}

export function AudioPlayer({ text, url, className }: AudioPlayerProps) {
  const [checked, setChecked] = React.useState(false);
  const [mediaIsLoad, setMediaIsLoad] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const audioElementRef = React.useRef<HTMLAudioElement | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const sourceNodeRef = React.useRef<MediaElementAudioSourceNode | null>(null);

  const onEnded = React.useCallback(() => {
    console.log("音频播放结束");
    if (audioElementRef.current) {
      audioElementRef.current.removeEventListener("ended", onEnded);
      setChecked(false);
    }
  }, []);

  const cleanupAudio = React.useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.removeAttribute("src");

      if (audioElementRef.current.parentNode) {
        audioElementRef.current.parentNode.removeChild(audioElementRef.current);
      }

      audioElementRef.current.removeEventListener("ended", onEnded);
      audioElementRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch (e) {
        console.error("断开音频节点失败:", e);
      }
      sourceNodeRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          void audioContextRef.current.close();
        }
      } catch (e) {
        console.error("关闭音频上下文失败:", e);
      }
      audioContextRef.current = null;
    }

    setMediaIsLoad(false);
    setIsLoading(false);

    lastXAudio = null;

    abortControllerRef.current = null;
  }, [onEnded]);

  const handleChange = React.useCallback(
    async (newChecked: boolean) => {
      if (isLoading) {
        return;
      }

      if (!mediaIsLoad && !newChecked) {
        return;
      }

      if (checked === newChecked) {
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      setChecked(newChecked);
      setIsLoading(newChecked);

      if (!newChecked) {
        cleanupAudio();
        return;
      }

      try {
        if (lastXAudio && lastXAudio.setChecked) {
          lastXAudio.setChecked(false);
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        audioElementRef.current = document.createElement("audio");
        audioElementRef.current.style.display = "none";
        audioElementRef.current.src = url;
        document.body.appendChild(audioElementRef.current);

        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        await new Promise((resolve, reject) => {
          if (signal.aborted) {
            reject(new DOMException("操作已取消", "AbortError"));
            return;
          }

          const onLoadedMetadata = (value: any) => {
            audioElementRef.current?.removeEventListener("loadedmetadata", onLoadedMetadata);
            audioElementRef.current?.removeEventListener("error", onError);

            if (signal.aborted) {
              reject(new DOMException("操作已取消", "AbortError"));
              return;
            }

            setMediaIsLoad(true);
            setIsLoading(false);
            resolve(value);
          };

          const onError = (error: any) => {
            audioElementRef.current?.removeEventListener("loadedmetadata", onLoadedMetadata);
            audioElementRef.current?.removeEventListener("error", onError);
            reject(error);
          };

          audioElementRef.current?.addEventListener("loadedmetadata", onLoadedMetadata);
          audioElementRef.current?.addEventListener("error", onError);
        });

        if (signal.aborted) {
          throw new DOMException("操作已取消", "AbortError");
        }

        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(
          audioElementRef.current,
        );
        const gainNode = audioContextRef.current.createGain();
        sourceNodeRef.current.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        audioElementRef.current.addEventListener("ended", onEnded);

        await audioElementRef.current.play();

        lastXAudio = { setChecked };
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("初始化失败:", error);
        }

        setChecked(false);
        setMediaIsLoad(false);
        setIsLoading(false);

        cleanupAudio();
      }
    },
    [checked, isLoading, mediaIsLoad, url, cleanupAudio, onEnded],
  );

  React.useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  if (!text) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => void handleChange(!checked)}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        checked
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        isLoading && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : checked ? (
        <Pause className="h-4 w-4" />
      ) : (
        <PlayCircle className="h-4 w-4" />
      )}
      <span>{text}</span>
      {checked && <Loader2 className="h-4 w-4 animate-spin" />}
    </button>
  );
}
