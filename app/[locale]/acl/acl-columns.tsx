"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Acl } from "@repo/api-client";
import { Button } from "@/components/ui/button";

interface TranslationFunctions {
  ta: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, params?: Record<string, any>) => string;
}

export function createAclColumns<T extends Acl>({
  ta,
  tc,
  // onDelete,
}: TranslationFunctions & {
  onDelete: (item: T) => void;
}): ColumnDef<T>[] {
  return [
    {
      accessorKey: "name",
      header: () => tc("name"),
    },
    {
      accessorKey: "rule",
      header: () => ta("Default Rule"),
    },
    // {
    //   id: "actions",
    //   header: () => tc("operations"),
    //   cell: ({ row }) => {
    //     return (
    //       <Button
    //         variant="ghost"
    //         size="sm"
    //         className="text-destructive hover:text-destructive hover:bg-destructive/10"
    //         onClick={() => onDelete(row.original)}
    //       >
    //         {tc("delete")}
    //       </Button>
    //     );
    //   },
    // },
  ];
}
