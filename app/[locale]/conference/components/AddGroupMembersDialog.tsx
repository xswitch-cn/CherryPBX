import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";
import { conferencesApi } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

export function AddGroupMembersDialog({
  open,
  onOpenChange,
  roomId,
  onMembersAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: number;
  onMembersAdded?: () => void;
}) {
  const t = useTranslations("conference");
  const [groups, setGroups] = useState<any[]>([]);
  const [groupUsers, setGroupUsers] = useState<any[]>([]);
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [groupId, setGroupId] = useState(-1);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedRoomMembers, setSelectedRoomMembers] = useState<number[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchRoomMember, setSearchRoomMember] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadGroups = useCallback(() => {
    setIsLoading(true);
    console.log("Loading groups...");
    conferencesApi
      .getGroups()
      .then((response) => {
        console.log("Groups API response:", response);
        let groupData = response.data;
        if (groupData && typeof groupData === "object" && "data" in groupData) {
          groupData = groupData.data;
        }
        if (Array.isArray(groupData)) {
          setGroups(groupData);
          console.log("Groups data structure:", JSON.stringify(groupData, null, 2));
        } else {
          setGroups([]);
        }
        console.log("Groups set to:", groupData);
      })
      .catch((error) => {
        console.error("Failed to load groups:", error);
        toast.error(t("failedToLoadGroups"));
        setGroups([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const loadGroupUsers = useCallback(
    (selectedGroupId: number) => {
      setIsLoading(true);
      conferencesApi
        .getGroupMembers(roomId, selectedGroupId)
        .then((response) => {
          if (Array.isArray(response.data)) {
            setGroupUsers(response.data);
          } else if (response.data && Array.isArray(response.data)) {
            setGroupUsers(response.data);
          } else {
            setGroupUsers([]);
          }
        })
        .catch((error) => {
          console.error("Failed to load group users:", error);
          toast.error(t("failedToLoadGroupMembers"));
          setGroupUsers([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [roomId],
  );

  const loadRoomMembers = useCallback(() => {
    if (!roomId) return;
    setIsLoading(true);
    conferencesApi
      .getMembers(roomId)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setRoomMembers(response.data);
        } else if (response.data && Array.isArray(response.data)) {
          setRoomMembers(response.data);
        } else {
          setRoomMembers([]);
        }
      })
      .catch((error) => {
        console.error("Failed to load room members:", error);
        setRoomMembers([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [roomId]);

  useEffect(() => {
    if (open) {
      loadGroups();
      setStep(1);
      setGroupId(-1);
      setSelectedUsers([]);
      setSelectedRoomMembers([]);
      setGroupUsers([]);
      setRoomMembers([]);
    }
  }, [open, loadGroups]);

  useEffect(() => {
    console.log("useEffect: step =", step, ", groupId =", groupId);
    if (step === 2 && groupId !== -1) {
      loadGroupUsers(groupId);
      setRoomMembers([]);
    }
  }, [step, groupId, loadGroupUsers]);

  useEffect(() => {
    console.log("groupId changed to:", groupId);
  }, [groupId]);

  const handleGroupChange = useCallback(
    (value: string) => {
      const selectedGroupId = parseInt(value, 10);
      console.log("handleGroupChange: selectedGroupId =", selectedGroupId);
      setGroupId(selectedGroupId);

      if (selectedGroupId !== -1 && roomId) {
        setIsLoading(true);
        conferencesApi
          .getGroupMembers(roomId, selectedGroupId)
          .then((response) => {
            if (Array.isArray(response.data)) {
              setGroupUsers(response.data);
            } else if (response.data && Array.isArray(response.data)) {
              setGroupUsers(response.data);
            } else {
              setGroupUsers([]);
            }
            setSelectedUsers([]);
          })
          .catch((error) => {
            console.error("Failed to load group users:", error);
            toast.error(t("failedToLoadGroupMembers"));
            setGroupUsers([]);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    },
    [roomId],
  );

  const handleNext = useCallback(() => {
    if (groupId !== -1) {
      setStep(2);
    }
  }, [groupId]);

  const handlePrev = useCallback(() => {
    setStep(1);
    setGroupUsers([]);
    setRoomMembers([]);
    setSelectedUsers([]);
    setSelectedRoomMembers([]);
  }, []);

  const handleUserSelect = useCallback((userId: number) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  const handleRoomMemberSelect = useCallback((memberId: number) => {
    setSelectedRoomMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  }, []);

  const handleMoveRight = useCallback(() => {
    const usersToMove = groupUsers.filter((user) => selectedUsers.includes(user.id));
    setRoomMembers((prev) => [...prev, ...usersToMove]);
    setGroupUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id)));
    setSelectedUsers([]);
  }, [groupUsers, selectedUsers]);

  const handleMoveLeft = useCallback(() => {
    const membersToMove = roomMembers.filter((member) => selectedRoomMembers.includes(member.id));
    setGroupUsers((prev) => [...prev, ...membersToMove]);
    setRoomMembers((prev) => prev.filter((member) => !selectedRoomMembers.includes(member.id)));
    setSelectedRoomMembers([]);
  }, [roomMembers, selectedRoomMembers]);

  const handleSelectAllUsers = useCallback(() => {
    if (selectedUsers.length === groupUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(groupUsers.map((user) => user.id));
    }
  }, [selectedUsers, groupUsers]);

  const handleSelectAllRoomMembers = useCallback(() => {
    if (selectedRoomMembers.length === roomMembers.length) {
      setSelectedRoomMembers([]);
    } else {
      setSelectedRoomMembers(roomMembers.map((member) => member.id));
    }
  }, [selectedRoomMembers, roomMembers]);

  const handleSubmit = useCallback(() => {
    if (!roomId || roomMembers.length === 0) return;
    if (groupId === -1) {
      toast.error(t("pleaseSelectGroup"));
      return;
    }
    console.log("Submitting members with groupId:", groupId);

    const postMembers = roomMembers.map((member) => ({
      name: member.name,
      num: member.extn,
      route: "",
      group_id: groupId,
      user_id: member.user_id,
      room_id: roomId,
      description: member.description || "",
    }));

    console.log("postMembers:", JSON.stringify(postMembers, null, 2));

    conferencesApi
      .addMembers(roomId, postMembers)
      .then((response) => {
        console.log("Add members response:", response);
        setStep(1);
        setGroupId(-1);
        setSelectedUsers([]);
        setSelectedRoomMembers([]);
        setGroupUsers([]);
        setRoomMembers([]);
        onOpenChange(false);
        toast.success(t("addSuccess"));
        if (onMembersAdded) {
          console.log("Calling onMembersAdded...");
          onMembersAdded();
        }
      })
      .catch((error) => {
        console.error("Failed to add group members:", error);
        toast.error(t("addFailed"));
      });
  }, [roomId, roomMembers, groupId, onOpenChange, onMembersAdded]);

  const filteredUsers = groupUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.extn.toLowerCase().includes(searchUser.toLowerCase()),
  );

  const filteredRoomMembers = roomMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchRoomMember.toLowerCase()) ||
      member.extn.toLowerCase().includes(searchRoomMember.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-visible">
        <DialogHeader>
          <DialogTitle>{t("selectUserGroup")}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center py-4 border-b px-6">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}
            >
              {step === 1 ? <span>1</span> : <span>✓</span>}
            </div>
            <span className="text-sm font-medium">{t("selectUserGroup")}</span>
          </div>
          <div className={`h-0.5 w-16 mx-4 ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`}></div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}
            >
              <span>2</span>
            </div>
            <span className="text-sm font-medium">{t("addMembers")}</span>
          </div>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-80">
                <Select
                  onValueChange={handleGroupChange}
                  value={groupId === -1 ? undefined : groupId.toString()}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder={t("selectUserGroup")} />
                  </SelectTrigger>
                  <SelectContent className="w-full" position="popper" side="bottom">
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="flex-1 border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedUsers.length === groupUsers.length && groupUsers.length > 0}
                      onCheckedChange={handleSelectAllUsers}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">
                      {groupUsers.length} {t("items")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t("users")}</span>
                </div>
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("enterSearchContent")}
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    <div className="space-y-1">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleUserSelect(user.id)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">
                            {user.name} | {user.extn}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <div className="w-12 h-12 mb-2 opacity-50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.25-1.5H9.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h7.5c.621 0 1.125-.504 1.125-1.125V10.5a1.125 1.125 0 0 0-1.125-1.125Z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm">暂无数据</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleMoveRight}
                  disabled={selectedUsers.length === 0}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleMoveLeft}
                  disabled={selectedRoomMembers.length === 0}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        selectedRoomMembers.length === roomMembers.length && roomMembers.length > 0
                      }
                      onCheckedChange={handleSelectAllRoomMembers}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">
                      {roomMembers.length} {t("items")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t("conferenceRoom")}</span>
                </div>
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("enterSearchContent")}
                      value={searchRoomMember}
                      onChange={(e) => setSearchRoomMember(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredRoomMembers.length > 0 ? (
                    <div className="space-y-1">
                      {filteredRoomMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={selectedRoomMembers.includes(member.id)}
                            onCheckedChange={() => handleRoomMemberSelect(member.id)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">
                            {member.name} | {member.extn}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <div className="w-12 h-12 mb-2 opacity-50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.25-1.5H9.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h7.5c.621 0 1.125-.504 1.125-1.125V10.5a1.125 1.125 0 0 0-1.125-1.125Z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm">暂无数据</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-8 space-x-2">
            {step === 1 ? (
              <>
                <Button variant="outline" className="bg-white" onClick={() => onOpenChange(false)}>
                  {t("close")}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={groupId === -1}
                  className={
                    groupId === -1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-500 hover:bg-gray-600"
                  }
                >
                  {t("nextStep")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className={
                    roomMembers.length > 0 ? "bg-gray-500 hover:bg-gray-600 text-white" : "bg-white"
                  }
                  onClick={handleSubmit}
                  disabled={roomMembers.length === 0}
                >
                  {roomMembers.length > 0 ? t("add") : t("close")}
                </Button>
                <Button onClick={handlePrev} variant="outline" className="bg-white">
                  {t("prevStep")}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
