"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { type User, type ListUsersQuery } from "@repo/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListPagination } from "@/components/ui/list-components";
import { SearchIcon, XIcon } from "lucide-react";
import React from "react";
import { usersApi } from "@/lib/api-client";

interface ChooseOneUserProps {
  value?: string;
  onChange?: (userId: string, user: User) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChooseOneUser({
  value,
  onChange,
  disabled = false,
  placeholder,
}: ChooseOneUserProps) {
  const t = useTranslations("extensions");
  const tt = useTranslations("table");
  const tu = useTranslations("user");
  const ttu = useTranslations("common");

  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLogin, setSelectedLogin] = useState<string | undefined>(value);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(value);
  const [selectedUserInfo, setSelectedUserInfo] = useState<User | undefined>(undefined);
  const [searchLogin, setSearchLogin] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(100);
  const [totalCount, setTotalCount] = useState(0);

  const loadUsers = useCallback(
    async (page: number = 1, login?: string) => {
      setLoading(true);
      try {
        const queryParams: ListUsersQuery = {
          page: page,
          perPage: pageSize,
          hpack: false,
        };

        if (login && login.trim() !== "") {
          queryParams.login = login;
        }

        const response = (await usersApi.list(queryParams)) as any;

        if (response.data) {
          setUsers(response.data?.data || []);
          setTotalCount(response.data?.rowCount || 0);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setSelectedUserId(value);
    setSelectedLogin(value);
    if (value) {
      const userFromList = users.find((user) => String(user.id) === value || user.login === value);
      if (userFromList) {
        setSelectedUserInfo(userFromList);
      }
    }
  }, [value, users]);

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    void loadUsers(1, searchLogin);
  }, [loadUsers, searchLogin]);

  const handleClearSearch = useCallback(() => {
    setSearchLogin("");
    setCurrentPage(1);
    void loadUsers(1);
  }, [loadUsers]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      void loadUsers(newPage, searchLogin);
    },
    [loadUsers, searchLogin],
  );

  const handleSelectUser = useCallback((userId: string | number) => {
    setSelectedUserId(String(userId));
  }, []);

  const handleOk = useCallback(() => {
    if (selectedUserId) {
      const selectedUser = users.find((user) => String(user.id) === selectedUserId);
      if (selectedUser) {
        setSelectedUserInfo(selectedUser);
        setSelectedLogin(selectedUser.login);
        if (onChange) {
          onChange(selectedUser.login, selectedUser);
        }
      }
    }
    setIsOpen(false);
  }, [selectedUserId, users, onChange]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const selectedUserFromList = users.find(
    (user) => String(user.id) === selectedUserId || user.login === selectedUserId,
  );
  const displayUser = selectedUserFromList || selectedUserInfo;

  return (
    <div className="w-full">
      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={`
          w-full px-3 py-2
          border border-input rounded-md
          text-sm
          ${disabled ? "bg-muted cursor-not-allowed" : "bg-background cursor-pointer hover:border-input/80"}
        `}
      >
        {displayUser ? (
          <span className="text-foreground">{displayUser.login}</span>
        ) : selectedLogin ? (
          <span className="text-foreground">{selectedLogin}</span>
        ) : (
          <span className="text-muted-foreground">
            {placeholder || t("chooseAUser") || tu("chooseAUser")}
          </span>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{t("chooseAUser")}</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder={tu("username")}
              value={searchLogin}
              onChange={(e) => setSearchLogin(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSearch}>
              <SearchIcon className="mr-1 h-4 w-4" />
              {tt("search")}
            </Button>
            <Button size="sm" variant="outline" onClick={handleClearSearch}>
              <XIcon className="mr-1 h-4 w-4" />
              {tt("clear")}
            </Button>
          </div>

          <div className="max-h-[400px] overflow-auto mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: "60px" }}>
                    <div className="flex items-center justify-center">
                      <Checkbox checked={false} disabled />
                    </div>
                  </TableHead>
                  <TableHead style={{ width: "80px" }}>{tu("id")}</TableHead>
                  <TableHead style={{ width: "120px" }}>{tu("username")}</TableHead>
                  <TableHead style={{ width: "120px" }}>{tu("name")}</TableHead>
                  <TableHead style={{ width: "150px" }}>{tu("domain")}</TableHead>
                  <TableHead style={{ width: "120px" }}>{tu("type")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {ttu("loading")}
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {tt("noResults")}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={String(user.id)}
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedUserId === String(user.id) ? "#4a4b4dff" : "transparent",
                        borderLeft:
                          selectedUserId === String(user.id)
                            ? "4px solid #1890ff"
                            : "4px solid transparent",
                      }}
                      onClick={() => handleSelectUser(user.id)}
                    >
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedUserId === String(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.login}</TableCell>
                      <TableCell>{user.name || "-"}</TableCell>
                      <TableCell>{user.domain || "-"}</TableCell>
                      <TableCell>{user.type ? tu(user.type) : tu("NORMAL")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mb-4">
            <ListPagination
              currentPage={currentPage}
              pageCount={Math.ceil(totalCount / pageSize)}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onPageSizeChange={() => {}}
              pageSizeOptions={[100]}
              translationPrefix="table"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {ttu("cancel")}
            </Button>
            <Button onClick={handleOk} disabled={!selectedUserId}>
              {ttu("submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
