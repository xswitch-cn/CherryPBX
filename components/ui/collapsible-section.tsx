"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface CollapsibleSectionData {
  realm: string;
  params: any[];
}

export interface CollapsibleSectionProps {
  data?: CollapsibleSectionData[];
  title?: string;
  showDelete?: boolean;
  onDelete?: (realm: string) => void;
  /** 自定义渲染内容 - 支持两种模式：
   * 1. 当传入 data 时：(item: CollapsibleSectionData, index: number) => ReactNode
   * 2. 当未传入 data 时：() => ReactNode
   */
  renderContent?: ((item: CollapsibleSectionData, index: number) => ReactNode) | (() => ReactNode);
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  data,
  title,
  showDelete = false,
  onDelete,
  renderContent,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [openStates, setOpenStates] = useState<Record<number, boolean>>(
    data?.reduce((acc, _, index) => ({ ...acc, [index]: defaultOpen }), {}) || {},
  );

  // 模式1：没有传入 data，渲染单个折叠面板
  if (!data || data.length === 0) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <CollapsibleTrigger className="flex items-center gap-2 flex-1 hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">{title}</span>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="border-t">
            {renderContent ? (
              (renderContent as () => ReactNode)()
            ) : (
              <div className="p-4 text-muted-foreground">暂无内容</div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // 模式2：传入 data 数组，渲染多个折叠面板
  const toggleOpen = (index: number) => {
    setOpenStates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <Collapsible
          key={item.realm || index}
          open={openStates[index]}
          onOpenChange={() => toggleOpen(index)}
          className="border rounded-lg"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <CollapsibleTrigger className="flex items-center gap-2 flex-1 hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors">
              {openStates[index] ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">
                {title || item.realm} ({item.params?.length || 0})
              </span>
            </CollapsibleTrigger>
            {showDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.realm);
                }}
                disabled={!item.params || item.params.length === 0}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                删除
              </Button>
            )}
          </div>
          <CollapsibleContent>
            <div className="border-t">
              {renderContent ? (
                (renderContent as (item: CollapsibleSectionData, index: number) => ReactNode)(
                  item,
                  index,
                )
              ) : (
                <div className="p-4 text-muted-foreground">暂无内容</div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
