"use client";

import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItemConfig {
  /** 显示文本 */
  label?: string;
  /** 链接地址，如果不提供则显示为当前页面 */
  href?: string;
  /** 是否为当前页面（最后一个元素） */
  isCurrentPage?: boolean;
}

interface CommonBreadcrumbProps {
  /** 面包屑项配置数组 */
  items: BreadcrumbItemConfig[];
  /** 自定义类名 */
  className?: string;
}

/**
 * 公共面包屑导航组件
 *
 * @example
 * // 简单的两级面包屑
 * <CommonBreadcrumb items={[
 *   { label: "首页", href: "/dashboard" },
 *   { label: "路由管理", isCurrentPage: true }
 * ]} />
 *
 * @example
 * // 三级面包屑
 * <CommonBreadcrumb items={[
 *   { label: "首页", href: "/dashboard" },
 *   { label: "路由管理", href: "/routes" },
 *   { label: "路由详情", isCurrentPage: true }
 * ]} />
 */
export function CommonBreadcrumb({ items, className }: CommonBreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrentPage = item.isCurrentPage ?? isLast;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {isCurrentPage ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
