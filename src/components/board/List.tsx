import React from "react";
import { Plus, MoreHorizontal, Copy, Trash2, Palette } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { List as ListType } from "../../types/global";
import { Card } from "./Card";
import { useBoardStore } from "../../hooks/useBoardStore";
import { ColorInput } from "./ui/color-input";
import { AnimatedList } from "../shared/AnimatedList";

interface ListProps {
  list: ListType;
  isOver: boolean;
  isCurrentAdmin: boolean;
  zoom: number; // Optional zoom prop for future use
  boardId: string;
}

export function List({ list, isOver, isCurrentAdmin, zoom, boardId }: ListProps) {
  const { addCard, updateList, deleteList, duplicateList } = useBoardStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(list.title);
  const [isDropAnimating, setIsDropAnimating] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const { setNodeRef } = useDroppable({
    id: list.id,
    data: {
      type: "list",
      listId: list.id,
    },
  });

  React.useEffect(() => {
    if (!isOver) {
      setIsDropAnimating(true);
      const timer = setTimeout(() => setIsDropAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOver]);

  const handleAddCard = () => {
    addCard(list.id, "Nueva tarjeta");
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(title);
    updateList(list.id, title, list.color);
    setIsEditing(false);
  };

  const handleDeleteList = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteList(list.id);
    setShowActions(false);
  };

  const handleDuplicateList = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateList(list.id);
    setShowActions(false);
  };

  const handleColorChange = (color: string) => {
    updateList(list.id, list.title, color);
    setShowColorPicker(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActions && !(event.target as Element).closest(".list-actions")) {
        setShowActions(false);
      }
      if (
        showColorPicker &&
        !(event.target as Element).closest(".color-picker")
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showActions, showColorPicker]);

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 rounded-2xl
                 backdrop-blur-sm shadow-lg border border-gray-200/20 dark:border-gray-700/20
                 transition-all duration-300 ease-out transform
                 flex flex-col min-h-[100px] max-h-[calc(100vh-2rem)] self-start
                 ${isOver ? "ring-2 ring-primary-400/60 bg-primary-50/30 dark:bg-primary-900/20 scale-[1.02]" : ""}
                 ${isDropAnimating ? "scale-[1.01]" : ""}`}
      style={{
        backgroundColor: list.color || "rgb(243 244 246 / 0.9)", // bg-gray-100/90
        color: list.color ? "white" : undefined,
      }}
    >
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3 flex-1">
            {isEditing ? (
              <form onSubmit={handleTitleSubmit} className="flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2 text-lg font-semibold rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-primary-400/60
                           bg-white dark:bg-gray-800 
                           ${list.color ? "text-gray-900" : "text-gray-900 dark:text-white"}
                           border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm`}
                  autoFocus
                  onBlur={handleTitleSubmit}
                />
              </form>
            ) : (
              <div className="flex items-center space-x-3 flex-1">
                <h2
                  className={`text-xl font-semibold cursor-pointer tracking-tight hover:opacity-80 transition-opacity ${
                    list.color !== "#f8f9fa"
                      ? "text-white"
                      : "bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                  }`}
                  onClick={() => setIsEditing(true)}
                >
                  {list.title}
                </h2>
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    list.color !== "#f8f9fa"
                      ? "bg-white/20 text-white"
                      : "bg-gray-200/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {list.cards.length}
                </span>
              </div>
            )}
            <div className="relative list-actions">
              <div className="flex items-center space-x-1">
                <button
                  className={`p-1.5 rounded-lg transition-colors duration-200 ${
                    list.color !== "#f8f9fa"
                      ? "hover:bg-white/20 text-white/80 hover:text-white"
                      : "hover:bg-gray-200/80 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <Palette className="w-5 h-5" />
                </button>
                {isCurrentAdmin && (
                  <button
                    className={`p-1.5 rounded-lg transition-colors duration-200 ${
                      list.color !== "#f8f9fa"
                        ? "hover:bg-white/20 text-white/80 hover:text-white"
                        : "hover:bg-gray-200/80 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setShowActions(!showActions)}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                )}
              </div>

              {showActions && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 py-1 bg-white dark:bg-gray-800 
                           rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  <button
                    onClick={handleDuplicateList}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 
                           dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                           transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicar lista</span>
                  </button>
                  <button
                    onClick={handleDeleteList}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 
                           dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                           transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar lista</span>
                  </button>
                </div>
              )}

              {showColorPicker && (
                <div className="absolute right-0 top-full mt-1 z-[999] color-picker">
                  <ColorInput
                    defaultValue={list.color || "#3b82f6"}
                    onChange={handleColorChange}
                    label="Color de la lista"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SortableContext
        items={list.cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 px-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <AnimatedList animate={false} className="space-y-3">
            {list.cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                listId={list.id}
                isCurrentAdmin={isCurrentAdmin}
                zoom={zoom} // Pass zoom prop to Card component
                boardId={boardId}
              />
            ))}
          </AnimatedList>
        </div>
      </SortableContext>

      <div className="flex-shrink-0 p-4">
        <button
          onClick={handleAddCard}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3.5
                   rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                   border border-dashed backdrop-blur-sm shadow-sm hover:shadow-md
                   group ${
                     list.color !== "#f8f9fa"
                       ? "border-white/30 text-white/80 hover:text-white bg-white/10 hover:bg-white/20"
                       : "border-gray-200/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-400 bg-white/80 dark:bg-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/70"
                   }`}
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Añadir tarjeta</span>
        </button>
      </div>
    </div>
  );
}
