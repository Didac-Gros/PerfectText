import { create } from "zustand";
import type {
  Board,
  List,
  Card,
  FeelComment,
  CommentAttachment,
} from "../types/global";
import { storage } from "../services/firestore/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  addCommentToFirestore,
  createBoardInFirestore,
  deleteBoardFromFirestore,
  getBoardsForUser,
  updateBoardFields,
  updateBoardLists,
} from "../services/firestore/boardsRepository";
import { auth } from "../services/firestore/firebase";
import { getAuth } from "firebase/auth";
import { color } from "framer-motion";

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  addBoard: (title: string) => Promise<Board | undefined>;
  updateBoard: (id: string, title: string, dueDate?: string | null) => void;
  updateBoardBackground: (id: string, background: Board["background"]) => void;
  deleteBoard: (id: string) => void;
  setCurrentBoard: (boardId: string) => void;
  addList: (title: string) => void;
  updateList: (id: string, title: string, color?: string) => void;
  deleteList: (id: string) => void;
  duplicateList: (id: string) => void;
  addCard: (listId: string, title: string) => void;
  updateCard: (card: Card) => void;
  deleteCard: (listId: string, cardId: string) => void;
  moveCard: (
    cardId: string,
    fromListId: string,
    toListId: string,
    newPosition: number
  ) => void;
  addComment: (
    cardId: string,
    text: string,
    boardId: string,
    listId: string,
    userName: string,
    photoURL: string,
    attachments?: File[]
  ) => Promise<void>;
  deleteComment: (cardId: string, commentId: string) => void;
  fetchBoardsForUser: (userId: string) => Promise<void>;
}

const defaultBackgrounds = [
  {
    type: "image" as const,
    value:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
  },
  {
    type: "image" as const,
    value:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    type: "image" as const,
    value:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop",
  },
  {
    type: "gradient" as const,
    value: "bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500",
  },
  {
    type: "gradient" as const,
    value: "bg-gradient-to-r from-emerald-500 to-emerald-900",
  },
  {
    type: "gradient" as const,
    value: "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900",
  },
];

const createStudyTemplate = (): List[] => [
  {
    id: crypto.randomUUID(),
    title: "Temas del examen",
    color: "#3b82f6", // Blue
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Tema 1: Introducción",
        description: "Conceptos básicos y fundamentos de la asignatura",
        views: 0,
        comments: [],
      },
      {
        id: crypto.randomUUID(),
        title: "Tema 2: Desarrollo",
        description: "Temas principales y conceptos clave",
        views: 0,
        comments: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "Pendiente de estudiar",
    color: "#ef4444", // Red
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Tema 3: Aplicaciones",
        description: "Casos prácticos y ejemplos de aplicación",
        views: 0,
        comments: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "En progreso",
    color: "#f59e0b", // Amber
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Tema 4: Metodología",
        description: "Procedimientos y técnicas de resolución",
        views: 0,
        comments: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "Dudas/Preguntas",
    color: "#8b5cf6", // Purple
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Duda sobre fórmulas",
        description: "Consultar con el profesor la aplicación correcta",
        views: 0,
        comments: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "Repasado",
    color: "#10b981", // Emerald
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Conceptos básicos",
        description: "Fundamentos y definiciones principales",
        views: 0,
        comments: [],
      },
    ],
  },
];

const createGroupWorkTemplate = (): List[] => [
  {
    id: crypto.randomUUID(),
    title: "Ideas y planificación",
    color: "#3b82f6", // Blue
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Lluvia de ideas inicial",
        description: "Recopilar todas las ideas y propuestas del equipo",
        views: 0,
        comments: [],
      },
      {
        id: crypto.randomUUID(),
        title: "Definir alcance del proyecto",
        description: "Establecer límites y objetivos claros",
        views: 0,
        comments: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "Tareas pendientes",
    color: "#ef4444", // Red
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Investigación inicial",
        description: "Recopilar información y recursos necesarios",
        views: 0,
        comments: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "En proceso",
    color: "#f59e0b", // Amber
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Desarrollo de contenido",
        description: "Creación del contenido principal del trabajo",
        views: 0,
        comments: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "En revisión",
    color: "#8b5cf6", // Purple
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Revisión de la primera sección",
        description: "Revisar y corregir el contenido inicial",
        views: 0,
        comments: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "Completado",
    color: "#10b981", // Emerald
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Planificación inicial",
        description: "Estructura y organización del trabajo",
        views: 0,
        comments: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: "Notas y recursos",
    color: "#6b7280", // Gray
    cards: [
      {
        id: crypto.randomUUID(),
        title: "Enlaces útiles",
        description: "Recursos y referencias importantes",
        views: 0,
        comments: [],
      },
    ],
  },
];

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  lists: [],

  fetchBoardsForUser: async (userId) => {
    const boards = await getBoardsForUser(userId);
    console.log("Fetched boards:", boards);

    set({ boards });
  },

  addBoard: async (title: string) => {
    const user = getAuth().currentUser;
    if (!user) return;

    const newBoard: Board = {
      id: crypto.randomUUID(),
      title,
      background:
        defaultBackgrounds[
          Math.floor(Math.random() * defaultBackgrounds.length)
        ],
      members: [
        {
          userId: user.uid,
          isAdmin: true,
          image: user.photoURL || "/default_avatar.jpg",
          name: user.displayName || "Usuario",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastViewed: new Date().toISOString(),
      lists: [],
    };

    await createBoardInFirestore(newBoard);

    set((state) => ({
      boards: [...state.boards, newBoard],
    }));

    return newBoard;
  },

  updateBoard: async (id, title, dueDate) => {
    await updateBoardFields(id, {
      title,
      dueDate: dueDate || null,
    });

    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === id
          ? { ...b, title, dueDate, updatedAt: new Date().toISOString() }
          : b
      ),
      currentBoard:
        state.currentBoard?.id === id
          ? {
              ...state.currentBoard,
              title,
              dueDate,
              updatedAt: new Date().toISOString(),
            }
          : state.currentBoard,
    }));
  },

  updateBoardBackground: async (id, background) => {
    await updateBoardFields(id, { background });

    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === id
          ? { ...b, background, updatedAt: new Date().toISOString() }
          : b
      ),
      currentBoard:
        state.currentBoard?.id === id
          ? {
              ...state.currentBoard,
              background,
              updatedAt: new Date().toISOString(),
            }
          : state.currentBoard,
    }));
  },

  deleteBoard: async (id) => {
    await deleteBoardFromFirestore(id);

    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
      currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
      lists: state.currentBoard?.id === id ? [] : state.lists,
    }));
  },

  setCurrentBoard: (boardId) => {
    const board = get().boards.find((b) => b.id === boardId);
    if (board) {
      const lists: List[] = Array.isArray(board.lists)
        ? board.lists
        : Object.values(board.lists || {});
      set({ currentBoard: board, lists });
    } else {
      set({ currentBoard: null, lists: [] });
    }
  },

  addList: async (title: string) => {
    const state = get();
    const board = state.currentBoard;
    if (!board) return;

    const newList = {
      id: crypto.randomUUID(),
      title,
      cards: [],
      color: "#f8f9fa",
    };

    const updatedLists = [...state.lists, newList];

    // 🔥 Crida a la funció externa per actualitzar Firestore
    await updateBoardLists(board.id, updatedLists);

    // 🧠 Actualitza l'estat local
    set({
      lists: updatedLists,
      currentBoard: {
        ...board,
        lists: updatedLists,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // 🛠️ UPDATE LIST
  updateList: async (id: string, title: string, color?: string) => {
    const state = get();
    const board = state.currentBoard;
    if (!board) return;

    const updatedLists = state.lists.map((list) =>
      list.id === id ? { ...list, title, color } : list
    );

    await updateBoardLists(board.id, updatedLists);

    set({
      lists: updatedLists,
      currentBoard: {
        ...board,
        lists: updatedLists,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // 🗑️ DELETE LIST
  deleteList: async (id: string) => {
    const state = get();
    const board = state.currentBoard;
    if (!board) return;

    const updatedLists = state.lists.filter((list) => list.id !== id);

    await updateBoardLists(board.id, updatedLists);

    set({
      lists: updatedLists,
      currentBoard: {
        ...board,
        lists: updatedLists,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // 📋 DUPLICATE LIST
  duplicateList: async (id: string) => {
    const state = get();
    const board = state.currentBoard;
    if (!board) return;

    const listToDuplicate = state.lists.find((list) => list.id === id);
    if (!listToDuplicate) return;

    const duplicatedCards = listToDuplicate.cards.map((card) => ({
      ...card,
      id: crypto.randomUUID(),
      comments: card.comments.map((comment) => ({
        ...comment,
        id: crypto.randomUUID(),
      })),
    }));

    const newList = {
      id: crypto.randomUUID(),
      title: `${listToDuplicate.title} (copia)`,
      cards: duplicatedCards,
      color: listToDuplicate.color,
    };

    const updatedLists = [...state.lists, newList];

    await updateBoardLists(board.id, updatedLists);

    set({
      lists: updatedLists,
      currentBoard: {
        ...board,
        lists: updatedLists,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  addCard: async (listId: string, title: string) => {
    const state = get();
    const board = state.currentBoard;
    if (!board) return;

    const newCard = {
      id: crypto.randomUUID(),
      title,
      description: "",
      views: 0,
      comments: [],
      checklist: [],
      dueDate: null,
      completed: false,
    };

    const updatedLists = state.lists.map((list) =>
      list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
    );

    await updateBoardLists(board.id, updatedLists);

    set({
      lists: updatedLists,
      currentBoard: { ...board, lists: updatedLists },
    });
  },

  updateCard: async (updatedCard: Card) => {
    const state = get();
    const board = state.currentBoard;
    if (!board) return;

    const updatedLists = state.lists.map((list) => ({
      ...list,
      cards: list.cards.map((card) =>
        card.id === updatedCard.id ? updatedCard : card
      ),
    }));

    await updateBoardLists(board.id, updatedLists);

    set({
      lists: updatedLists,
      currentBoard: { ...board, lists: updatedLists },
    });
  },

  deleteCard: async (listId: string, cardId: string) => {
    const state = get();
    const board = state.currentBoard;
    if (!board) return;

    const updatedLists = state.lists.map((list) =>
      list.id === listId
        ? { ...list, cards: list.cards.filter((card) => card.id !== cardId) }
        : list
    );

    await updateBoardLists(board.id, updatedLists);

    set({
      lists: updatedLists,
      currentBoard: { ...board, lists: updatedLists },
    });
  },

  moveCard: async (
    cardId: string,
    fromListId: string,
    toListId: string,
    newPosition: number
  ) => {
    const state = get();
    const board = state.currentBoard;
    if (!board) return;

    const fromList = state.lists.find((list) => list.id === fromListId);
    const toList = state.lists.find((list) => list.id === toListId);
    if (!fromList || !toList) return;

    const cardToMove = fromList.cards.find((card) => card.id === cardId);
    if (!cardToMove) return;

    const updatedLists = state.lists.map((list) => {
      // 🔵 Si estem movent dins la mateixa llista
      if (list.id === fromListId && fromListId === toListId) {
        const cards = [...list.cards];
        const oldIndex = cards.findIndex((card) => card.id === cardId);

        // Extreure i reposicionar la carta
        const [movedCard] = cards.splice(oldIndex, 1);
        cards.splice(newPosition, 0, movedCard);

        return { ...list, cards };
      }

      // 🟢 Si estem movent entre dues llistes diferents
      if (list.id === fromListId) {
        return {
          ...list,
          cards: list.cards.filter((card) => card.id !== cardId),
        };
      }

      if (list.id === toListId) {
        const newCards = [...list.cards];
        newCards.splice(newPosition, 0, cardToMove);
        return { ...list, cards: newCards };
      }

      return list;
    });

    set({
      lists: updatedLists,
      currentBoard: { ...board, lists: updatedLists },
    });

    await updateBoardLists(board.id, updatedLists);
  },

  addComment: async (cardId: string, text: string, boardId: string, listId: string, userName: string, photoURL: string, attachments?: File[]) => {
    const newComment: FeelComment = {
      id: crypto.randomUUID(),
      text,
      author: userName,
      photoURL: photoURL,
      createdAt: new Date().toISOString(),
      // attachments: []
    };

    if (attachments && attachments.length > 0) {
      const uploadedAttachments: CommentAttachment[] = [];

      for (const file of attachments) {
        if (file.type.startsWith("image/")) {
          const storageRef = ref(
            storage,
            `comments/${cardId}/${newComment.id}/${file.name}`
          );
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);

          uploadedAttachments.push({
            id: crypto.randomUUID(),
            type: "image",
            url,
            name: file.name,
            size: file.size,
          });
        }
      }

      // newComment.attachments = uploadedAttachments;
    }

    await addCommentToFirestore(boardId, listId, cardId, newComment);

    set((state) => ({
      lists: state.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                comments: [...card.comments, newComment],
              }
            : card
        ),
      })),
    }));
  },

  deleteComment: (cardId: string, commentId: string) => {
    set((state) => ({
      lists: state.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                comments: card.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              }
            : card
        ),
      })),
    }));
  },
}));
