"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon, UserIcon } from "lucide-react";
import type { User } from "@repo/api-client";

interface CreateUserColumnsProps {
  t: (key: string, params?: Record<string, any>) => string;
  tt: (key: string, params?: Record<string, any>) => string;
  onDelete?: (user: User) => void;
}

export function createUserColumns({ t, tt, onDelete }: CreateUserColumnsProps): ColumnDef<User>[] {
  return [
    {
      accessorKey: "id",
      header: () => t("id"),
    },
    {
      accessorKey: "login",
      header: () => t("username"),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: () => t("name"),
    },
    {
      accessorKey: "domain",
      header: () => t("domain"),
      cell: ({ row }) => {
        const domain = row.original.domain;
        return domain || "-";
      },
    },
    {
      accessorKey: "type",
      header: () => t("type"),
      cell: ({ row }) => {
        const type = row.original.type;
        return type || "-";
      },
    },
    {
      accessorKey: "last_login_at",
      header: () => t("lastLogin"),
      cell: ({ row }) => {
        const lastLogin = row.original.last_login_at;
        return lastLogin || "-";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
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
                  window.location.href = `/users/${user.id}`;
                }}
              >
                {tt("details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  if (onDelete) {
                    onDelete(user);
                  }
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
