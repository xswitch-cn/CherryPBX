import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon, MusicIcon } from "lucide-react";

export interface IVR {
  id: number;
  name: string;
  description?: string;
  identifier: string;
  welcomeAudio?: string;
  shortWelcomeAudio?: string;
  actionCount: number;
}

export function createIvrColumns({
  t,
  tt,
  onDelete,
}: {
  t: (key: string) => string;
  tt: (key: string) => string;
  onDelete: (ivr: IVR) => Promise<void>;
}): ColumnDef<IVR>[] {
  return [
    {
      accessorKey: "id",
      header: t("id"),
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => (
        <span className="font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
          {row.getValue("name")}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: t("description"),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.getValue("description") || "-"}</span>
      ),
    },
    {
      accessorKey: "identifier",
      header: t("identifier"),
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("identifier")}</span>,
    },
    {
      accessorKey: "welcomeAudio",
      header: t("welcomeAudio"),
      cell: ({ row }) => {
        const audio = String(row.getValue("welcomeAudio"));
        if (!audio || audio === "undefined" || audio === "null")
          return <span className="text-muted-foreground text-sm">-</span>;
        return (
          <div className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium bg-muted text-muted-foreground">
            <MusicIcon className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{audio}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "shortWelcomeAudio",
      header: t("shortWelcomeAudio"),
      cell: ({ row }) => {
        const audio = String(row.getValue("shortWelcomeAudio"));
        if (!audio || audio === "undefined" || audio === "null")
          return <span className="text-muted-foreground text-sm">-</span>;
        return (
          <div className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium bg-muted text-muted-foreground">
            <MusicIcon className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{audio}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "actionCount",
      header: t("action"),
      cell: ({ row }) => {
        const ivr = row.original;
        const count = row.getValue("actionCount") as number;
        return (
          <button
            onClick={() => {
              window.location.href = `/ivr/${ivr.id}`;
            }}
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {count}
          </button>
        );
      },
    },
    {
      id: "operations",
      header: t("operations"),
      cell: ({ row }) => {
        const ivr = row.original;
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
                  window.location.href = `/ivr/${ivr.id}`;
                }}
              >
                {tt("details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  void onDelete(ivr);
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
