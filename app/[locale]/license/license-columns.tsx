"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { License } from "@repo/api-client";
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
  t: (key: string, params?: Record<string, any>) => string;
  tl: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, params?: Record<string, any>) => string;
}

export function createLicenseColumns({
  tl,
  tc,
  router,
  onHandleDelete,
}: TranslationFunctions & {
  router: ReturnType<typeof useRouter>;
  onHandleDelete: (license: License) => void;
}): ColumnDef<License>[] {
  return [
    {
      accessorKey: "id",
      header: () => "ID",
    },
    {
      accessorKey: "name",
      header: () => tl("name"),
      cell: ({ row }) => <span className="font-medium text-primary">{row.original.name}</span>,
    },
    {
      accessorKey: "description",
      header: () => tl("description"),
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
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/license/${row.original.id}`);
                }}
              >
                {tc("Details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  onHandleDelete(row.original);
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
