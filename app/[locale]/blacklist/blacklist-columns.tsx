import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";

// 定义BlacklistNumber类型
export interface BlacklistNumber {
  id: number;
  k: string;
  v: string;
}

// 定义Blacklist类型
export interface Blacklist {
  id: number;
  name: string;
  description?: string;
  listType: string;
  userType: string;
}

// 创建列配置
export function createBlacklistColumns({
  t,
  tt,
  onDelete,
}: {
  t: (key: string) => string;
  tt: (key: string) => string;
  onDelete: (blacklist: Blacklist) => void;
}): ColumnDef<Blacklist>[] {
  // 名单类型映射
  const list_type_map = {
    "0": t("blacklist"),
    "1": t("whitelist"),
  };

  // 限制用户类型映射
  const limit_user_type_map = {
    "0": t("caller"),
    "1": t("called"),
    "2": t("callerAndCalled"),
  };

  return [
    {
      accessorKey: "id",
      header: t("id"),
      cell: ({ row }) => row.getValue("id"),
    },
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => row.getValue("name"),
    },
    {
      accessorKey: "description",
      header: t("description"),
      cell: ({ row }) => row.getValue("description"),
    },
    {
      accessorKey: "listType",
      header: t("listType"),
      cell: ({ row }) => {
        const listType = row.getValue("listType");
        return list_type_map[listType as keyof typeof list_type_map] || listType;
      },
    },
    {
      accessorKey: "userType",
      header: t("userType"),
      cell: ({ row }) => {
        const userType = row.getValue("userType");
        return limit_user_type_map[userType as keyof typeof limit_user_type_map] || userType;
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const blacklist = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <EllipsisVerticalIcon />
                <span className="sr-only">{tt("edit")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = `/blacklist/${blacklist.id}`;
                }}
              >
                {tt("Details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  onDelete(blacklist);
                }}
              >
                {tt("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
