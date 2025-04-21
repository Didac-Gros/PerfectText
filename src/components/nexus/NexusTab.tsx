import React, { useEffect } from "react";
import {
  Plus,
  Search,
  Users,
  Clock,
  Plus as PlusIcon,
  Trash2,
} from "lucide-react";
import { useBoardStore } from "../../hooks/useBoardStore";
import { DueDatePicker } from "../shared/DueDatePicker";
import { BackgroundPicker } from "./BackgroundPicker";
import { GlareCard } from "./ui/glare-card";
import type { Board } from "../../types/global";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shared/ui/dialog";
import { auth } from "../../services/firestore/firebase";
export function NexusTab() {
  const {
    boards,
    addBoard,
    setCurrentBoard,
    updateBoard,
    updateBoardBackground,
    deleteBoard,
    fetchBoardsForUser,
  } = useBoardStore();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editingBoardId, setEditingBoardId] = React.useState<string | null>(
    null
  );
  const [editingTitle, setEditingTitle] = React.useState("");
  const [showBackgroundPicker, setShowBackgroundPicker] = React.useState<
    string | null
  >(null);
  const [boardToDelete, setBoardToDelete] = React.useState<Board | null>(null);
  const editInputRef = React.useRef<HTMLInputElement>(null);

  const filteredBoards = React.useMemo(() => {
    return boards.filter((board) =>
      board.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [boards, searchTerm]);

  const handleCreateBoard = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newBoard = await addBoard("Nueva página");
    setCurrentBoard(newBoard!.id);
  };

  const handleBoardClick = (boardId: string) => {
    if (editingBoardId !== boardId) {
      setCurrentBoard(boardId);
    }
  };

  const startEditing = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBoardId(board.id);
    setEditingTitle(board.title);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleTitleSubmit = (boardId: string) => {
    if (editingTitle.trim() !== "") {
      updateBoard(boardId, editingTitle.trim());
    }
    setEditingBoardId(null);
    setEditingTitle("");
  };

  const handleDeleteBoard = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Deleting board:", board);
    
    setBoardToDelete(board);
  };

  const confirmDelete = () => {
    if (boardToDelete) {
      deleteBoard(boardToDelete.id);
      setBoardToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#161616] p-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-medium text-gray-900 dark:text-white">
            Buenas noches, Usuario
          </h1>
          <h2 className="flex items-center space-x-2 text-lg text-gray-500 dark:text-white/60">
            <Clock className="w-5 h-5" />
            <span>Visitadas recientemente</span>
          </h2>
        </div>

        {/* Board Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              onClick={() => handleBoardClick(board.id)}
              className="cursor-pointer relative group"
            >
              <div className="w-[320px] h-[320px] ">
                <div className="absolute inset-0 w-full h-full ">
                  {board.background?.type === "image" ? (
                    <img
                      src={board.background.value}
                      alt={board.title}
                      className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                    />
                  ) : board.background?.type === "gradient" ? (
                    <div
                      className={`absolute rounded-3xl inset-0 w-full h-full ${board.background.value}`}
                    />
                  ) : (
                    <div className="absolute rounded-3xl inset-0 w-full h-full bg-gradient-to-br from-gray-900 to-gray-800" />
                  )}

                  <div className="absolute inset-0 rounded-3xl bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteBoard(board, e)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-black/40 backdrop-blur-sm
                             opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50
                             hover:bg-red-500/80 text-white"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-xl font-medium text-white group-hover:translate-y-[-2px] transition-transform duration-300">
                      {board.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-3 text-sm text-white/80">
                      <Clock className="w-4 h-4" />
                      <span>Última visita: hace 2 días</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Board Card */}
          <div onClick={handleCreateBoard} className="cursor-pointer">
            <GlareCard className="w-[320px] h-[320px] group">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors duration-300">
                      <PlusIcon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-lg font-medium text-white">
                      Nueva página
                    </span>
                  </div>
                </div>
              </div>
            </GlareCard>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={boardToDelete !== null}
        onOpenChange={() => setBoardToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar tablero</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar "{boardToDelete?.title}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setBoardToDelete(null)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 
                       dark:bg-gray-800 rounded-lg hover:bg-gray-200 
                       dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg 
                       hover:bg-red-600 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
