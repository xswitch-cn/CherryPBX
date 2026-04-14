import { type ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";

// 定义Context类型
export interface Context {
  id: number;
  name: string;
  description?: string;
  key?: string;
  didEnabled: boolean;
}

// 创建列配置
export function createContextColumns({
  t,
  tt,
  onDelete,
  onToggleDid,
}: {
  t: (key: string) => string;
  tt: (key: string) => string;
  onDelete: (context: Context) => void;
  onToggleDid: (context: Context, enabled: boolean) => void;
}): ColumnDef<Context>[] {
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
      accessorKey: "key",
      header: t("identifier"),
      cell: ({ row }) => row.getValue("key"),
    },
    {
      accessorKey: "didEnabled",
      header: t("didEnabled"),
      cell: ({ row }) => {
        const context = row.original;
        return (
          <Switch
            checked={context.didEnabled}
            onCheckedChange={(checked) => onToggleDid(context, checked as boolean)}
          />
        );
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const context = row.original;
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
                  window.location.href = `/contexts/${context.id}`;
                }}
              >
                {tt("Details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  onDelete(context);
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
