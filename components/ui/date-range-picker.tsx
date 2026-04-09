"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon, CalendarIcon } from "lucide-react";

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onDateChange: (start: string | null, end: string | null) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const t = useTranslations("common");
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startDate && startDate !== "" ? new Date(startDate) : undefined,
    to: endDate && endDate !== "" ? new Date(endDate) : undefined,
  });

  // 当外部传入的 startDate 或 endDate 变化时，更新内部状态
  React.useEffect(() => {
    setSelectedRange({
      from: startDate && startDate !== "" ? new Date(startDate) : undefined,
      to: endDate && endDate !== "" ? new Date(endDate) : undefined,
    });
  }, [startDate, endDate]);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const handleDateSelect = (range: any) => {
    // 如果已经有完整的范围，且用户点击了新的日期，更新开始日期
    if (selectedRange.from && selectedRange.to && range?.from && !range?.to) {
      setSelectedRange({ from: range.from, to: selectedRange.to });
      onDateChange(formatDate(range.from), formatDate(selectedRange.to));
    }
    // 否则使用默认的范围选择行为
    else {
      setSelectedRange({ from: range?.from, to: range?.to });
      const start = range?.from ? formatDate(range.from) : null;
      const end = range?.to ? formatDate(range.to) : null;
      onDateChange(start, end);
      // 只有当用户选择了完整的日期范围（同时有开始和结束日期）时才关闭弹窗
      if (range?.from && range?.to) {
        setIsOpen(false);
      }
    }
  };

  const displayValue =
    selectedRange.from && selectedRange.to
      ? `${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}`
      : t("selectDateRange") || "选择日期范围";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={className}
          size="sm"
          role="combobox"
          aria-expanded={isOpen}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{displayValue}</span>
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            className="w-full"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
