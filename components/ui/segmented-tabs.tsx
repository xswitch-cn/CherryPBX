"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface SegmentedTabItem {
  value: string;
  label: string;
  labelKey?: string;
}

export interface SegmentedTabsProps {
  items: SegmentedTabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  translationNamespace?: string;
}

/**
 * 分隔符式Tab切换组件
 *
 * 样式风格：Tab 之间用 | 分隔，当前项高亮加粗
 *
 * @example
 * ```tsx
 * <SegmentedTabs
 *   defaultValue="basic"
 *   items={[
 *     { value: "basic", labelKey: "basicParams" },
 *     { value: "register", labelKey: "registerParams" },
 *     { value: "advanced", labelKey: "advancedParams" },
 *   ]}
 *   translationNamespace="gateway"
 * >
 *   <SegmentedTabs.Content value="basic">...</SegmentedTabs.Content>
 *   <SegmentedTabs.Content value="register">...</SegmentedTabs.Content>
 *   <SegmentedTabs.Content value="advanced">...</SegmentedTabs.Content>
 * </SegmentedTabs>
 * ```
 */
export function SegmentedTabs({
  items,
  defaultValue,
  value,
  onValueChange,
  className,
  translationNamespace,
  children,
}: SegmentedTabsProps & { children?: React.ReactNode }) {
  const t = translationNamespace ? useTranslations(translationNamespace) : null;

  return (
    <Tabs
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList variant="line" className="h-auto gap-0 bg-transparent p-0">
        {items.map((item, index) => (
          <React.Fragment key={item.value}>
            {index > 0 && <span className="mx-2 text-muted-foreground/30 select-none">|</span>}
            <TabsTrigger
              value={item.value}
              className={cn(
                "h-8 rounded-none border-none px-2 py-1 text-sm font-normal",
                "bg-transparent text-muted-foreground/50 hover:text-foreground/80",
                "data-active:bg-transparent data-active:text-foreground data-active:font-medium",
                "after:hidden",
              )}
            >
              {t ? t(item.labelKey || item.label) : item.label}
            </TabsTrigger>
          </React.Fragment>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

SegmentedTabs.Content = function SegmentedTabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TabsContent value={value} className={cn("mt-4", className)}>
      {children}
    </TabsContent>
  );
};
