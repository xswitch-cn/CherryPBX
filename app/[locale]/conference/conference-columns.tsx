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
import { useRouter } from "next/navigation";
import { type Conference } from "@/lib/api-client";

// 创建列配置
export function createConferenceColumns({
  t,
  tt,
  onDelete,
}: {
  t: (key: string) => string;
  tt: (key: string) => string;
  onDelete: (conference: Conference) => void;
}): ColumnDef<Conference>[] {
  const router = useRouter();

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
      accessorKey: "nbr",
      header: t("number"),
      cell: ({ row }) => row.getValue("nbr"),
    },
    {
      accessorKey: "realm",
      header: t("realm"),
      cell: ({ row }) => row.getValue("realm"),
    },
    {
      accessorKey: "capacity",
      header: t("capacity"),
      cell: ({ row }) => row.getValue("capacity"),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const conference = row.original;

        const handleViewDetails = () => {
          router.push(`/conference/${conference.id}`);
        };

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
              <DropdownMenuItem onClick={handleViewDetails}>{t("details")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  onDelete(conference);
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
