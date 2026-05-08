"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { IpBlacklist } from "@repo/api-client";
import { Button } from "@/components/ui/button";

interface TranslationFunctions {
  ti: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, params?: Record<string, any>) => string;
}

export function createIpBlackColumns<T extends IpBlacklist>({
  ti,
  tc,
  onDelete,
}: TranslationFunctions & {
  onDelete: (item: T) => void;
}): ColumnDef<T>[] {
  return [
    {
      accessorKey: "target_name",
      header: () => ti("name"),
    },
    {
      accessorKey: "ip_address",
      header: () => ti("sourceIp"),
    },
    {
      accessorKey: "target_protocol",
      header: () => ti("protocol"),
    },
    {
      accessorKey: "target_port",
      header: () => ti("port"),
    },
    {
      id: "actions",
      header: () => ti("actions"),
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(row.original)}
          >
            {tc("delete")}
          </Button>
        );
      },
    },
  ];
}
