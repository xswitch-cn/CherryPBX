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
  onDelete: (ivr: IVR) => void;
}): ColumnDef<IVR>[] {
  return [
    {
      accessorKey: "id",
      header: t("id"),
      cell: ({ row }) => row.getValue("id"),
    },
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => (
        <span className="text-primary hover:underline cursor-pointer">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "description",
      header: t("description"),
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-2">{row.getValue("description")}</span>
      ),
    },
    {
      accessorKey: "identifier",
      header: t("identifier"),
      cell: ({ row }) => row.getValue("identifier"),
    },
    {
      accessorKey: "welcomeAudio",
      header: t("welcomeAudio"),
      cell: ({ row }) => {
        const audio = String(row.getValue("welcomeAudio"));
        if (!audio || audio === "undefined" || audio === "null")
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex items-center gap-2">
            <MusicIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm truncate max-w-[120px]">{audio}</span>
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
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex items-center gap-2">
            <MusicIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm truncate max-w-[120px]">{audio}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "actionCount",
      header: t("action"),
      cell: ({ row }) => row.getValue("actionCount"),
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
                  onDelete(ivr);
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
