"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { License } from "@repo/api-client";
import { useRouter } from "@/navigation";

interface TranslationFunctions {
  t: (key: string, params?: Record<string, any>) => string;
  tl: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, params?: Record<string, any>) => string;
}

export function createLicenseColumns({
  t,
  tl,
  tc,
  router,
}: TranslationFunctions & {
  router: ReturnType<typeof useRouter>;
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
  ];
}
