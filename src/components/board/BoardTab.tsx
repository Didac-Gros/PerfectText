import React, { useEffect } from "react";
import {
  Plus,
  Users,
  Check,
  X,
  Settings2,
  ZoomIn,
  ZoomOut,
  Pencil,
  Calendar,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  defaultDropAnimationSideEffects,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { List } from "./List";
import { Card } from "./Card";
import { useBoardStore } from "../../hooks/useBoardStore";
import { InviteMembersDialog } from "./InviteMembersDialog";
import { ProjectManagementDialog } from "./ProjectManagementDialog";
import type { Card as CardType } from "../../types/global";
import { AnimatedTooltip } from "./ui/animated-tooltip";
import { DueDatePicker } from "../shared/DueDatePicker";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

export function BoardTab() {
  const { lists, addList, moveCard, currentBoard, updateBoard } =
    useBoardStore();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeCard, setActiveCard] = React.useState<CardType | null>(null);
  const [overListId, setOverListId] = React.useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [title, setTitle] = React.useState(currentBoard?.title || "");
  const [showProjectManagement, setShowProjectManagement] =
    React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const boardRef = React.useRef<HTMLDivElement>(null);
  const members = currentBoard?.members || [];
  const [showDueDatePicker, setShowDueDatePicker] = React.useState(false);

  useEffect(() => {
    if (currentBoard) {
      setTitle(currentBoard.title);
    }
  }, [currentBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    const sourceList = lists.find((list) =>
      list.cards.some((card) => card.id === active.id)
    );
    const draggedCard = sourceList?.cards.find((card) => card.id === active.id);

    if (draggedCard) {
      setActiveCard(draggedCard);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the lists involved
    const activeList = lists.find((list) =>
      list.cards.some((card) => card.id === activeId)
    );
    const overList = lists.find(
      (list) =>
        list.id === overId || list.cards.some((card) => card.id === overId)
    );

    if (!activeList || !overList) return;

    // Set the current list being dragged over
    setOverListId(overList.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveCard(null);
      setOverListId(null);
      return;
    }

    const activeCardId = active.id as string;
    const sourceList = lists.find((list) =>
      list.cards.some((card) => card.id === activeCardId)
    );

    const overId = over.id as string;
    const targetList = lists.find(
      (list) =>
        list.id === overId || list.cards.some((card) => card.id === overId)
    );

    if (!sourceList || !targetList) {
      setActiveId(null);
      setActiveCard(null);
      setOverListId(null);
      return;
    }

    // Calculate the new position
    let newPosition = targetList.cards.length;
    const overCardId = over.data.current?.sortable?.items?.find(
      (id: string) => id === overId
    );

    if (overCardId) {
      newPosition = targetList.cards.findIndex((card) => card.id === overId);
      if (newPosition === -1) newPosition = targetList.cards.length;
    }

    // Move the card
    console.log("Active card", activeCardId);
    console.log("Source list", sourceList.id);
    console.log("Target list", targetList.id);
    console.log("New position", newPosition);

    moveCard(activeCardId, sourceList.id, targetList.id, newPosition);

    setActiveId(null);
    setActiveCard(null);
    setOverListId(null);
  };

  const handleTitleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (currentBoard && title.trim() !== currentBoard.title) {
      updateBoard(currentBoard.id, title.trim(), currentBoard.dueDate);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      setTitle(currentBoard?.title || "");
      setIsEditingTitle(false);
    }
  };

  const handleDueDateChange = (dueDate: string | null) => {
    const updatedBoard = { ...currentBoard, dueDate };
    updateBoard(updatedBoard.id!, updatedBoard?.title!, updatedBoard.dueDate);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  // Handle wheel zoom with Ctrl/Cmd key
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setZoom((prev) => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));
    }
  };

  React.useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <div className="flex-1 overflow-x-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              {isEditingTitle ? (
                <form onSubmit={handleTitleSubmit} className="mb-3">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={handleTitleKeyDown}
                    className="text-3xl font-bold bg-white dark:bg-gray-800 border-2 
                             border-primary-400 dark:border-primary-500 rounded-lg px-3 py-1
                             focus:outline-none focus:ring-2 focus:ring-primary-400/60
                             text-gray-900 dark:text-white w-[500px]"
                  />
                </form>
              ) : (
                <div className="group relative inline-block">
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="text-4xl font-bold bg-gradient-to-b from-gray-900 via-gray-800 to-gray-600 
                           dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3 cursor-pointer
                           tracking-tight leading-tight hover:opacity-80 transition-all duration-300
                           hover:scale-[1.02] transform-gpu font-sans"
                    style={{
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {title}
                  </h1>
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Fecha límite:{" "}
                  <span>
                    {currentBoard?.dueDate
                      ? format(
                          new Date(currentBoard.dueDate),
                          "dd 'de' MMMM yyyy",
                          { locale: es }
                        )
                      : "Sin fecha"}
                  </span>
                </span>
                <DueDatePicker
                  dueDate={currentBoard!.dueDate!}
                  onDateChange={handleDueDateChange}
                  isCompleted={undefined}
                  isOpen={showDueDatePicker}
                  onOpenChange={setShowDueDatePicker}
                  triggerComponent={
                    <div
                      className={`p-1.5 rounded-lg transition-all duration-200
                                           hover:bg-gray-100 dark:hover:bg-gray-600`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDueDatePicker(true);
                      }}
                    >
                      <Calendar
                        className={`w-4 h-4 ${currentBoard!.dueDate ? "text-primary-500 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"}`}
                      />
                    </div>
                  }
                />
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <AnimatedTooltip items={members} />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Zoom Controls */}
              <div
                className="flex items-center space-x-2 px-2 py-1 bg-white dark:bg-gray-800 
                           rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                           dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3ch] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                           dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowProjectManagement(true)}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 
                         bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 
                         hover:scale-[1.02] shadow-sm hover:shadow group text-sm"
              >
                <Settings2 className="w-5 h-5 group-hover:text-primary-500 transition-colors" />
                <span className="font-medium">Administrar</span>
              </button>
              <InviteMembersDialog />
              <button
                onClick={() => addList("Nueva Lista")}
                className="flex items-center space-x-2 px-4 py-2.5 bg-blue-500 text-white 
                         rounded-xl hover:bg-blue-600 transition-all duration-200 
                         hover:scale-[1.02] shadow-sm hover:shadow-md text-sm"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium ">Nueva Lista</span>
              </button>
            </div>
          </div>

          <div
            ref={boardRef}
            className="flex space-x-4 min-h-[calc(100vh-16rem)]"
            onWheel={handleWheel}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.2s ease-out",
            }}
          >
            {lists.map((list) => (
              <List key={list.id} list={list} isOver={overListId === list.id} />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.4",
              },
            },
          }),
        }}
      >
        {activeId && activeCard ? (
          <Card
            card={activeCard}
            listId={
              lists.find((list) =>
                list.cards.some((card) => card.id === activeId)
              )?.id || ""
            }
          />
        ) : null}
      </DragOverlay>

      <ProjectManagementDialog
        isOpen={showProjectManagement}
        onOpenChange={setShowProjectManagement}
      />
    </DndContext>
  );
}
