import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shared/ui/dialog";
import { Settings2, Shield, UserMinus, Trash2, RefreshCw, Undo2 } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useBoardStore } from "../../hooks/useBoardStore";
import { Member } from "../../types/global";
import { useAuth } from "../../hooks/useAuth";
import {
  removeMemberFromBoard,
  toggleAdminStatus,
} from "../../services/firestore/boardsRepository";

interface ProjectManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectMembers: Member[];
  setProjectMembers: (members: Member[]) => void;
  isCurrentAdmin: boolean;
}

export function ProjectManagementDialog({
  isOpen,
  onOpenChange,
  projectMembers,
  isCurrentAdmin,
  setProjectMembers,
}: ProjectManagementDialogProps) {
  const [members, setMembers] = useState<Member[]>(projectMembers);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const { currentBoard, deleteBoard } = useBoardStore();
  const { user } = useAuth(); // Assuming you have a way to get the current user
  const [isUserDeletedSelected, setIsUserDeletedSelected] =
    useState<boolean>(false);

  const toggleAdmin = async (memberId: string) => {
    setMembers(
      members.map((member) =>
        member.userId === memberId
          ? { ...member, isAdmin: !member.isAdmin }
          : member
      )
    );
    try {
      await toggleAdminStatus(currentBoard!.id, memberId); // has de tenir `boardId` disponible
    } catch (err) {
      console.error("Error canviant el rol d'administrador.");
    }
  };

  const removeMember = async (memberId: string) => {
    setMembers(members.filter((member) => member.userId !== memberId));
    setProjectMembers(members.filter((member) => member.userId !== memberId));
    await removeMemberFromBoard(currentBoard!.id, memberId);
  };

  const handleDeleteBoard = () => {
    if (currentBoard) {
      deleteBoard(currentBoard.id);
      onOpenChange(false);
    }
  };

  const clickDeleteUser = (member: Member) => {
    if (isUserDeletedSelected) {
      removeMember(member.userId);
    } else {
      setIsUserDeletedSelected(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex flex-col gap-6">
          {isCurrentAdmin && (
            <div className="flex items-center space-x-3">
              <div
                className="w-11 h-11 flex items-center justify-center rounded-full 
                             bg-primary-50 dark:bg-primary-900/20"
              >
                <Settings2 className="w-6 h-6 text-primary-500 dark:text-primary-400" />
              </div>
              <div>
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Administrar proyecto
                  </DialogTitle>
                  <DialogDescription>
                    Gestiona los miembros y permisos del proyecto
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Miembros del proyecto
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isCurrentAdmin
                      ? "Administra los miembros y sus roles en el proyecto"
                      : ""}
                  </p>
                </div>
              </div>

              <div
                className="space-y-2 max-h-[280px] overflow-y-auto pr-2 -mr-2 scrollbar-thin 
                           scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
              >
                {members.map((member) => {
                  return (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 
                             dark:bg-gray-800/50 group hover:bg-white dark:hover:bg-gray-800 
                             transition-all duration-200 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                          <span>{member.name}</span>
                          {member.isAdmin && (
                            <Shield className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                          )}
                        </h4>
                      </div>
                      {member.userId !== user!.uid && isCurrentAdmin && (
                        <div className={`flex items-center ${isUserDeletedSelected ? "space-x-[0.1rem]":"space-x-3" } `}>
                          {!isUserDeletedSelected && (
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`admin-${member.userId}`}
                                checked={member.isAdmin}
                                onCheckedChange={() =>
                                  toggleAdmin(member.userId)
                                }
                              />
                              <Label
                                htmlFor={`admin-${member.userId}`}
                                className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer"
                              >
                                Admin
                              </Label>
                            </div>
                          )}

                          {isUserDeletedSelected && (
                            <button
                              // onClick={() => removeMember(member.userId)}
                              onClick={() => setIsUserDeletedSelected(false)}
                              className="p-1.5 text-gray-400 hover:text-green-500 dark:text-gray-500 
            dark:hover:text-green-400 rounded-lg hover:bg-green-50 
            dark:hover:bg-green-900/20 transition-colors"
                            >
                              <Undo2 className="size-4"/>
                            </button>
                          )}

                          <button
                            // onClick={() => removeMember(member.userId)}
                            onClick={() => clickDeleteUser(member)}
                            className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 
            dark:hover:text-red-400 rounded-lg hover:bg-red-50 
            dark:hover:bg-red-900/20 transition-colors"
                          >
                            {isUserDeletedSelected ? (
                              <Trash2 className="w-4 h-4" />
                            ) : (
                              <UserMinus className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delete Board Section */}
            {isCurrentAdmin && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {showDeleteConfirm ? (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-9 h-9 flex items-center justify-center rounded-full 
                                bg-red-100 dark:bg-red-900/40"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 dark:text-red-400">
                          ¿Estás seguro?
                        </h4>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80">
                          Esta acción no se puede deshacer
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 
                               bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 
                               dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDeleteBoard}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 
                               rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Eliminar tablero
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 w-full text-red-600 
                           dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg 
                           hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      Eliminar tablero
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
