"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "lucide-react";

const min_ts = 60;
const hour_ts = min_ts * 60;
const day_ts = hour_ts * 24;
const week_ts = 7 * day_ts;

const DAILY = "daily";

const fileds = [
  "dtstart",
  "duration",
  "freq",
  "until",
  "interval",
  "byday",
  "bymonthday",
  "byyearday",
  "byweekno",
  "bymonth",
];

/**
 * 解析日期字符串为时间戳
 * @param date 日期字符串，格式为 YYYYMMDDTHHMMSS
 * @returns 时间戳
 */
function date_to_ts(date: string): number {
  const year = parseInt(date.substr(0, 4));
  const month = parseInt(date.substr(4, 2));
  const day = parseInt(date.substr(6, 2));
  const hour = parseInt(date.substr(9, 2));
  const min = parseInt(date.substr(11, 2));
  const sec = parseInt(date.substr(13, 2));

  const ts = Math.floor(new Date(year, month - 1, day, hour, min, sec).getTime() / 1000);
  return ts;
}

/**
 * 解析持续时间字符串为秒数
 * @param d 持续时间字符串，格式为 P[n]Y[n]M[n]DT[n]H[n]M[n]S
 * @returns 秒数
 */
function duration_to_ts(d: string): number {
  if (d.substr(0, 1).toUpperCase() !== "P") {
    return 0;
  }
  let week = 0;
  let hour = 0;
  let day = 0;
  let min = 0;
  let sec = 0;

  let idx = 1;

  let wi = d.indexOf("W");
  if (wi > 0) {
    week = parseInt(d.substr(idx, wi - idx));
    idx = wi + 1;
  }

  const di = d.indexOf("D");
  if (di > 0) {
    day = parseInt(d.substr(idx, di - idx));
  }

  const ti = d.indexOf("T");
  if (ti < 0) {
    console.error("format error ");
    return 0;
  } else {
    idx = ti + 1;
  }

  const hi = d.indexOf("H");
  if (hi > 0) {
    hour = parseInt(d.substr(idx, hi - idx));
    idx = hi + 1;
  }

  const mi = d.indexOf("M");
  if (mi > 0) {
    min = parseInt(d.substr(idx, mi - idx));
    idx = mi + 1;
  }

  let si = d.indexOf("S");
  if (si > 0) {
    sec = parseInt(d.substr(idx, si - idx));
  }

  return week * week_ts + day * day_ts + hour * hour_ts + min * min_ts + sec;
}

export class TimeRecurrenceData {
  data: Record<string, string> = {};
  start_ts?: number;
  duration_ts?: number;
  end_ts?: number;
  start_date?: Date;
  end_date?: Date;
  weekdays?: string[];

  constructor(d?: any) {
    fileds.forEach((field) => {
      this.data[field] = "";
    });

    if (!d) return;
  }

  Parse(str: string) {
    let idx = 0;

    const sub_str = (str: string) => {
      const idx1 = str.indexOf("|", idx);
      if (idx1 < 0) {
        const sub = str.substr(idx);
        idx = -1;
        return sub;
      } else if (idx1 > idx) {
        const sub = str.substr(idx, idx1 - idx);
        idx = idx1 + 1;
        return sub;
      } else {
        idx = idx1 + 1;
        return "";
      }
    };

    for (let i = 0; i < fileds.length; i++) {
      const field = fileds[i];
      this.data[field] = sub_str(str);
      if (idx < 0) {
        break;
      }
    }

    if (this.data.byday !== "") {
      this.weekdays = [];
      const bydays = this.data.byday.split(",");
      if (bydays && bydays.length > 0) {
        this.weekdays = bydays;
      }
    }

    this.start_ts = date_to_ts(str);
    this.duration_ts = duration_to_ts(this.data.duration);
    this.end_ts = this.start_ts + this.duration_ts;

    this.start_date = new Date(this.start_ts * 1000);
    this.end_date = new Date(this.end_ts * 1000);
  }

  get freq() {
    return this.data.freq;
  }
}

/**
 * 创建时间范围字符串
 * @param startTime 开始时间 (HH:MM:SS)
 * @param endTime 结束时间 (HH:MM:SS)
 * @param week_days 星期几
 * @param freq 频率
 * @returns 时间范围字符串
 */
export function createTimeRangeStr(
  startTime: string,
  endTime: string,
  week_days: string[],
  freq: string = DAILY,
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const [startHour, startMin, startSec] = startTime.split(":").map(Number);
  const [endHour, endMin, endSec] = endTime.split(":").map(Number);

  const startDate = new Date(year, month - 1, day, startHour, startMin, startSec);
  const endDate = new Date(year, month - 1, day, endHour, endMin, endSec);
  const duration = endDate.getTime() - startDate.getTime();

  const pad = (num: number) => num.toString().padStart(2, "0");

  let time_str = `${year}${pad(month)}${pad(day)}`;
  time_str = time_str + `T${pad(startHour)}${pad(startMin)}${pad(startSec)}`;

  // 计算持续时间
  const totalSeconds = Math.floor(duration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let duration_str = "PT";
  if (hours > 0) duration_str += `${hours}H`;
  if (minutes > 0) duration_str += `${minutes}M`;
  if (seconds > 0) duration_str += `${seconds}S`;

  time_str = time_str + "|" + duration_str;
  time_str = time_str + "|" + freq;
  time_str = time_str + "|";
  time_str = time_str + "|1";
  let byday = week_days?.toString() || "";

  if (byday.substr(-1, 1) === ",") {
    byday = byday.substring(0, byday.length - 1);
  }

  time_str = time_str + "|" + byday;
  return time_str;
}

/**
 * 创建年度时间范围字符串
 * @param startDateTime 开始日期时间 (YYYY-MM-DDTHH:MM:SS)
 * @param endDateTime 结束日期时间 (YYYY-MM-DDTHH:MM:SS)
 * @returns 时间范围字符串
 */
export function createTimeRangeStrYearly(startDateTime: string, endDateTime: string): string {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  const duration = end.getTime() - start.getTime();

  const pad = (num: number) => num.toString().padStart(2, "0");

  const startYear = start.getFullYear();
  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  const startHour = start.getHours();
  const startMin = start.getMinutes();
  const startSec = start.getSeconds();

  let time_str = `${startYear}${pad(startMonth)}${pad(startDay)}`;
  time_str = time_str + `T${pad(startHour)}${pad(startMin)}${pad(startSec)}`;

  // 计算持续时间
  const totalSeconds = Math.floor(duration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let duration_str = "PT";
  if (hours > 0) duration_str += `${hours}H`;
  if (minutes > 0) duration_str += `${minutes}M`;
  if (seconds > 0) duration_str += `${seconds}S`;

  time_str = time_str + "|" + duration_str;
  time_str = time_str + "|yearly";
  time_str = time_str + "|";
  time_str = time_str + "|1";
  time_str = time_str + "|";

  return time_str;
}

interface TimeRecurrenceItem {
  id?: number;
  week_days: string[];
  workTimes: [string, string];
  freq: string;
}

interface TimeRecurrenceProps {
  templateId: number;
  time_recurrences: Array<{ id: number; time_recurrence: string }>;
  onRefresh: () => void;
}

export function TimeRecurrence({ templateId, time_recurrences, onRefresh }: TimeRecurrenceProps) {
  const t = useTranslations("timeRules");
  const [current, setCurrent] = useState<TimeRecurrenceItem[]>([]);
  const [workingTime, setWorkingTime] = useState<TimeRecurrenceItem[]>([]);
  const [holidayTime, setHolidayTime] = useState<TimeRecurrenceItem[]>([]);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);

  useEffect(() => {
    if (time_recurrences?.length > 0) {
      initData(time_recurrences);
    }
  }, [time_recurrences]);

  const timeDisposal = (time_recurrence: string) => {
    const tr = new TimeRecurrenceData();
    tr.Parse(time_recurrence);

    // 格式化时间为 HH:MM:SS
    const formatTime = (date: Date) => {
      return date.toTimeString().split(" ")[0];
    };

    // 格式化日期时间为 YYYY-MM-DDTHH:MM:SS
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    return {
      workTimes: [
        tr.freq === "daily" ? formatTime(tr.start_date!) : formatDateTime(tr.start_date!),
        tr.freq === "daily" ? formatTime(tr.end_date!) : formatDateTime(tr.end_date!),
      ],
      week_days: tr.weekdays || [],
      freq: tr.freq,
    };
  };

  const initData = (data: Array<{ id: number; time_recurrence: string }>) => {
    const items = data.map((item) => {
      const timeData = timeDisposal(item?.time_recurrence);
      return {
        week_days: timeData.week_days,
        workTimes: timeData.workTimes as [string, string],
        freq: timeData.freq,
        id: item.id,
      };
    });

    setCurrent(items);
    setWorkingTime(items.filter((item) => item.freq === "daily"));
    setHolidayTime(items.filter((item) => item.freq === "yearly"));
  };

  const addWorkingTime = () => {
    // 添加默认的工作日时间规则
    const now = new Date();
    const startTime = now.toTimeString().split(" ")[0];
    const endTime = new Date(now.getTime() + 60 * 60 * 1000).toTimeString().split(" ")[0];

    setWorkingTime([
      ...workingTime,
      {
        week_days: [],
        workTimes: [startTime, endTime],
        freq: "daily",
      },
    ]);
  };

  const addHolidayTime = () => {
    // 添加默认的节假日时间规则
    const now = new Date();
    const startDateTime = now.toISOString().slice(0, 19);
    const endDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19);

    setHolidayTime([
      ...holidayTime,
      {
        week_days: [],
        workTimes: [startDateTime, endDateTime],
        freq: "yearly",
      },
    ]);
  };

  const removeWorkingTime = (index: number) => {
    const newWorkingTime = [...workingTime];
    newWorkingTime.splice(index, 1);
    setWorkingTime(newWorkingTime);
  };

  const removeHolidayTime = (index: number) => {
    const newHolidayTime = [...holidayTime];
    newHolidayTime.splice(index, 1);
    setHolidayTime(newHolidayTime);
  };

  const handleSubmitTime = async () => {
    try {
      const workingTimeData = workingTime.map((item) => ({
        template_id: templateId,
        time_recurrence: createTimeRangeStr(
          item.workTimes[0],
          item.workTimes[1],
          item.week_days,
          "daily",
        ),
        id: item.id,
      }));

      const holidayTimeData = holidayTime.map((item) => ({
        template_id: templateId,
        time_recurrence: createTimeRangeStrYearly(item.workTimes[0], item.workTimes[1]),
        id: item.id,
      }));

      const timeTemplate = [...workingTimeData, ...holidayTimeData];
      const editTimeTemplate = timeTemplate.filter((item) => item.id);
      const addTimeTemplate = timeTemplate.filter((item) => !item.id);

      // 处理删除操作 - 找出需要删除的id
      const currentIds = current.map((item) => item.id).filter(Boolean) as number[];
      const newIds = timeTemplate.map((item) => item.id).filter(Boolean) as number[];
      const deletedIds = currentIds.filter((id) => !newIds.includes(id));

      if (deletedIds.length > 0) {
        // 逐个删除，使用路径参数格式
        for (const id of deletedIds) {
          const response = await fetch(`/api/time_recurrence/templates/time_recurrences/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error(await response.text());
          }
        }
      }

      if (editTimeTemplate.length > 0) {
        const response = await fetch("/api/time_recurrence/templates/time_recurrences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editTimeTemplate),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }
      }

      if (addTimeTemplate.length > 0) {
        const response = await fetch("/api/time_recurrence/templates/time_recurrences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addTimeTemplate),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }
      }

      toast.success(t("saveSuccess") || "保存成功");
      onRefresh();
    } catch (error: any) {
      console.error("Failed to save time rules:", error);
      toast.error(`${t("saveFailed") || "保存失败"}: ${error?.message || error?.text || error}`);
    }
  };

  const weekDays = [
    { value: "MO", label: t("monday") || "周一" },
    { value: "TU", label: t("tuesday") || "周二" },
    { value: "WE", label: t("wednesday") || "周三" },
    { value: "TH", label: t("thursday") || "周四" },
    { value: "FR", label: t("friday") || "周五" },
    { value: "SA", label: t("saturday") || "周六" },
    { value: "SU", label: t("sunday") || "周日" },
  ];

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t("timeRangeSettings") || "时间范围设置"}</h3>
        <Button onClick={() => void handleSubmitTime()}>{t("confirm") || "确认"}</Button>
      </div>

      <div className="space-y-6">
        {/* 工作日时间规则 */}
        <div>
          <h4 className="mb-4 font-medium">{t("weekdayTimeRange") || "工作日时间范围"}</h4>
          <div className="space-y-4">
            {workingTime.map((item, index) => (
              <div key={index} className="flex items-start gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">{t("weekdayTimeRange") || "工作日时间范围"}:</Label>
                  <div className="flex flex-col gap-2">
                    {/* 星期选择弹窗 */}
                    <div className="relative">
                      {/* 已选择的星期标签 */}
                      <div
                        className="border rounded px-3 py-2 min-w-[300px] cursor-pointer"
                        onClick={() => {
                          setPopupIndex(popupIndex === index ? null : index);
                        }}
                      >
                        {item.week_days.map((dayValue) => {
                          const day = weekDays.find((d) => d.value === dayValue);
                          return day ? (
                            <div
                              key={day.value}
                              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-sm mr-2 mb-2"
                            >
                              {day.label}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newWorkingTime = [...workingTime];
                                  newWorkingTime[index].week_days = newWorkingTime[
                                    index
                                  ].week_days.filter((d) => d !== day.value);
                                  setWorkingTime(newWorkingTime);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                        {item.week_days.length === 0 && (
                          <span className="text-muted-foreground text-sm">
                            {t("selectWeekdays") || "请选择星期"}
                          </span>
                        )}
                      </div>
                      {/* 星期选择弹窗 */}
                      {popupIndex === index && (
                        <div className="absolute z-10 mt-1 rounded-xl bg-background p-4 text-sm ring-1 ring-foreground/10 shadow-lg min-w-[200px]">
                          {weekDays.map((day) => (
                            <div
                              key={day.value}
                              className={`flex items-center justify-between py-1 px-2 ${item.week_days.includes(day.value) ? "bg-muted" : ""} hover:bg-muted/50 cursor-pointer`}
                              onClick={() => {
                                const newWorkingTime = [...workingTime];
                                if (item.week_days.includes(day.value)) {
                                  newWorkingTime[index].week_days = newWorkingTime[
                                    index
                                  ].week_days.filter((d) => d !== day.value);
                                } else {
                                  newWorkingTime[index].week_days = [
                                    ...newWorkingTime[index].week_days,
                                    day.value,
                                  ];
                                }
                                setWorkingTime(newWorkingTime);
                              }}
                            >
                              <span>{day.label}</span>
                              {item.week_days.includes(day.value) && (
                                <span className="text-green-600">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="time"
                    value={item.workTimes[0]}
                    onChange={(e) => {
                      const newWorkingTime = [...workingTime];
                      newWorkingTime[index].workTimes[0] = e.target.value;
                      setWorkingTime(newWorkingTime);
                    }}
                    className="w-32 border rounded px-2 py-1"
                  />
                  <span>→</span>
                  <input
                    type="time"
                    value={item.workTimes[1]}
                    onChange={(e) => {
                      const newWorkingTime = [...workingTime];
                      newWorkingTime[index].workTimes[1] = e.target.value;
                      setWorkingTime(newWorkingTime);
                    }}
                    className="w-32 border rounded px-2 py-1"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 mt-6"
                  onClick={() => removeWorkingTime(index)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addWorkingTime} className="w-full">
              <PlusIcon className="mr-2 h-4 w-4" />
              {t("addWeekdayRule") || "增加工作日时间规则"}
            </Button>
          </div>
        </div>

        {/* 节假日时间规则 */}
        <div>
          <h4 className="mb-4 font-medium">{t("holidayTimeRange") || "节假日时间范围"}</h4>
          <div className="space-y-4">
            {holidayTime.map((item, index) => (
              <div key={index} className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={item.workTimes[0]}
                    onChange={(e) => {
                      const newHolidayTime = [...holidayTime];
                      newHolidayTime[index].workTimes[0] = e.target.value;
                      setHolidayTime(newHolidayTime);
                    }}
                    className="w-64 border rounded px-2 py-1"
                  />
                  <span>→</span>
                  <input
                    type="datetime-local"
                    value={item.workTimes[1]}
                    onChange={(e) => {
                      const newHolidayTime = [...holidayTime];
                      newHolidayTime[index].workTimes[1] = e.target.value;
                      setHolidayTime(newHolidayTime);
                    }}
                    className="w-64 border rounded px-2 py-1"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => removeHolidayTime(index)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addHolidayTime} className="w-full">
              <PlusIcon className="mr-2 h-4 w-4" />
              {t("addHolidayRule") || "增加节假日时间规则"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
