"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Acl } from "@repo/api-client";
import { useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";

interface TranslationFunctions {
  ta: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, params?: Record<string, any>) => string;
}

export function createAclColumns({
  ta,
  tc,
  router,
  onDelete,
}: TranslationFunctions & {
  router: ReturnType<typeof useRouter>;
  onDelete: (item: Acl) => void;
}): ColumnDef<Acl>[] {
  return [
    {
      accessorKey: "name",
      header: () => tc("name"),
    },
    {
      accessorKey: "rule",
      header: () => ta("Default Rule"),
      cell: ({ row }) => {
        return <span>{ta(row.original.rule)}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <EllipsisVerticalIcon />
                <span className="sr-only">{tc("edit")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {/* <DropdownMenuItem
                onClick={() => {
                  router.push(`/acl/${row.original.id}`);
                }}
              >
                {tc("Details")}
              </DropdownMenuItem> */}
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  onDelete(row.original);
                }}
              >
                {tc("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
