import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { conferencesApi } from "@/lib/api-client";

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
  const [groups, setGroups] = useState<any[]>([]);
  const [groupUsers, setGroupUsers] = useState<any[]>([]);
  const [route, setRoute] = useState("");
  const [groupId, setGroupId] = useState(-1);
  const [targetKeys, setTargetKeys] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("groups");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // 加载组列表
  const loadGroups = useCallback(() => {
    setIsLoading(true);
    conferencesApi
      .getGroups()
      .then((response) => {
        if (Array.isArray(response.data)) {
          setGroups(response.data);
        } else if (response.data && Array.isArray(response.data)) {
          setGroups(response.data);
        } else {
          setGroups([]);
        }
      })
      .catch((error) => {
        console.error("Failed to load groups:", error);
        toast.error("获取组列表失败");
        setGroups([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 当弹窗打开时加载组列表
  useEffect(() => {
    if (open) {
      loadGroups();
      // 重置状态
      setActiveTab("groups");
      setGroupId(-1);
      setSelectedUsers([]);
      setGroupUsers([]);
    }
  }, [open, loadGroups]);

  // 处理组选择变化
  const handleGroupChange = useCallback(
    (value: any) => {
      const selectedGroupId = value;
      setGroupId(selectedGroupId);

      if (selectedGroupId && roomId) {
        conferencesApi
          .getGroupMembers(roomId, selectedGroupId)
          .then((response) => {
            // 确保groupUsers是一个数组
            if (Array.isArray(response.data)) {
              setGroupUsers(response.data);
            } else if (response.data && Array.isArray(response.data)) {
              // 处理嵌套的数据结构
              setGroupUsers(response.data);
            } else {
              setGroupUsers([]);
            }
            setSelectedUsers([]);
            setActiveTab("members");
          })
          .catch((error) => {
            console.error("Failed to load group users:", error);
            toast.error("获取组成员失败");
            setGroupUsers([]);
          });
      }
    },
    [roomId],
  );

  // 处理用户选择变化
  const handleUserSelect = useCallback((userId: number) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  // 处理添加组成员提交
  const handleAddGroupMembersSubmit = useCallback(() => {
    if (!roomId) return;

    const members = groupUsers.filter((user) => {
      return selectedUsers.includes(user.id);
    });

    const postMembers = members.map((member) => {
      return {
        name: member.name,
        num: member.extn,
        route: route || "",
        group_id: groupId,
        user_id: member.user_id,
        room_id: roomId,
      };
    });

    conferencesApi
      .addMembers(roomId, postMembers)
      .then(() => {
        setActiveTab("groups");
        setGroupId(-1);
        setSelectedUsers([]);
        setGroupUsers([]);
        onOpenChange(false);
        toast.success("添加成功");
        // 调用回调函数，通知父组件刷新与会者列表
        if (onMembersAdded) {
          onMembersAdded();
        }
      })
      .catch((error) => {
        console.error("Failed to add group members:", error);
        toast.error("添加失败");
      });
  }, [roomId, groupUsers, selectedUsers, route, groupId, onOpenChange, onMembersAdded]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">选择分组</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={() => onOpenChange(false)}>
            ✕
          </button>
        </div>
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="groups">选择分组</TabsTrigger>
              <TabsTrigger value="members">添加成员</TabsTrigger>
            </TabsList>
            <TabsContent value="groups" className="mt-4">
              <Select
                onValueChange={handleGroupChange}
                value={groupId === -1 ? undefined : groupId.toString()}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择分组" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
            <TabsContent value="members" className="mt-4">
              {groupUsers.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto border rounded-md p-2">
                  {groupUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="rounded text-primary"
                      />
                      <span>
                        {user.name} | {user.extn}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">该分组下没有未添加的用户</p>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6 space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
            <Button onClick={handleAddGroupMembersSubmit} disabled={selectedUsers.length === 0}>
              添加
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
