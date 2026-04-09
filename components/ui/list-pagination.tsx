"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
} from "lucide-react";

/**
 * 分页组件 Props
 */
export interface ListPaginationProps {
  /** 当前页码 */
  currentPage: number;
  /** 总页数 */
  pageCount: number;
  /** 每页数量 */
  pageSize: number;
  /** 总记录数 */
  totalCount: number;
  /** 页码变化回调 */
  onPageChange: (page: number) => void;
  /** 每页数量变化回调 */
  onPageSizeChange: (pageSize: number) => void;
  /** 每页数量选项 */
  pageSizeOptions?: number[];
  /** 是否显示总记录数 */
  showTotalCount?: boolean;
  /** 国际化翻译前缀 */
  translationPrefix?: string;
}

/**
 * 通用列表分页组件
 * 
 * @example
 * ```tsx
 * <ListPagination
 *   currentPage={1}
 *   pageCount={10}
 *   pageSize={10}
 *   totalCount={100}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 * ```
 */
export function ListPagination({
  currentPage,
  pageCount,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showTotalCount = true,
  translationPrefix = "table",
}: ListPaginationProps) {
  const t = useTranslations(translationPrefix);

  return (
    <div className="flex items-center justify-between px-4">
      {/* 左侧：总记录数信息 */}
      {showTotalCount && (
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {t("totalCount", { total: totalCount }) || `共 ${totalCount} 条记录`}
        </div>
      )}

      {/* 右侧：分页控制 */}
      <div className="flex w-full items-center gap-8 lg:w-fit">
        {/* 每页数量选择 */}
        <div className="flex items-center gap-2 lg:ml-0">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            {t("rowsPerPage")}
          </Label>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* 页码显示 */}
        <div className="flex w-fit items-center text-sm font-medium">
          {t("pageOf", {
            current: currentPage,
            total: pageCount || 1,
          })}
        </div>

        {/* 翻页按钮 */}
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {/* 首页 */}
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
          >
            <span className="sr-only">{t("goToFirst")}</span>
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>

          {/* 上一页 */}
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <span className="sr-only">{t("goToPrevious")}</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          {/* 下一页 */}
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= pageCount}
          >
            <span className="sr-only">{t("goToNext")}</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          {/* 末页 */}
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => onPageChange(pageCount)}
            disabled={currentPage >= pageCount}
          >
            <span className="sr-only">{t("goToLast")}</span>
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
