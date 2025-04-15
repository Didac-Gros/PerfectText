import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../shared/ui/dialog';
import { Settings2, Shield, UserMinus, UserCog, Trash2 } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { AnimatedTooltip, type TooltipUser } from './ui/animated-tooltip';
import { useBoardStore } from '../../hooks/useBoardStore';

interface ProjectMember extends TooltipUser {
  isAdmin: boolean;
}

interface ProjectManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const demoMembers: ProjectMember[] = [
  {
    id: 1,
    name: "Sara Johnson",
    role: "Project Manager",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop",
    isAdmin: true
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Developer",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&q=80&crop=faces&fit=crop",
    isAdmin: false
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "Designer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop",
    isAdmin: false
  },
  {
    id: 4,
    name: "Alex Thompson",
    role: "Content Writer",
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=64&h=64&q=80&crop=faces&fit=crop",
    isAdmin: false
  }
];

export function ProjectManagementDialog({ isOpen, onOpenChange }: ProjectManagementDialogProps) {
  const [members, setMembers] = React.useState<ProjectMember[]>(demoMembers);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const { currentBoard, deleteBoard } = useBoardStore();

  const toggleAdmin = (memberId: number) => {
    setMembers(members.map(member => 
      member.id === memberId 
        ? { ...member, isAdmin: !member.isAdmin }
        : member
    ));
  };

  const removeMember = (memberId: number) => {
    setMembers(members.filter(member => member.id !== memberId));
  };

  const handleDeleteBoard = () => {
    if (currentBoard) {
      deleteBoard(currentBoard.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 flex items-center justify-center rounded-full 
                         bg-primary-50 dark:bg-primary-900/20">
              <Settings2 className="w-6 h-6 text-primary-500 dark:text-primary-400" />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl">Administrar proyecto</DialogTitle>
                <DialogDescription>
                  Gestiona los miembros y permisos del proyecto
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Miembros del proyecto
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Administra los miembros y sus roles en el proyecto
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 -mr-2 scrollbar-thin 
                           scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {members.map((member) => (
                  <div 
                    key={member.id}
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
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                          <span>{member.name}</span>
                          {member.isAdmin && (
                            <Shield className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                          )}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`admin-${member.id}`}
                          checked={member.isAdmin}
                          onCheckedChange={() => toggleAdmin(member.id)}
                        />
                        <Label 
                          htmlFor={`admin-${member.id}`}
                          className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer"
                        >
                          Admin
                        </Label>
                      </div>

                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 
                                 dark:hover:text-red-400 rounded-lg hover:bg-red-50 
                                 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delete Board Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {showDeleteConfirm ? (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-full 
                                bg-red-100 dark:bg-red-900/40">
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
                  <span className="font-medium text-sm">Eliminar tablero</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}