import { create } from 'zustand';
import type { Board, List, Card, Comment, CommentAttachment } from '../types/global';
import { storage } from '../services/firestore/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  addBoard: (title: string) => Board;
  updateBoard: (id: string, title: string, dueDate?: string | null) => void;
  updateBoardBackground: (id: string, background: Board['background']) => void;
  deleteBoard: (id: string) => void;
  setCurrentBoard: (boardId: string) => void;
  addList: (title: string) => void;
  updateList: (id: string, title: string, color?: string) => void;
  deleteList: (id: string) => void;
  duplicateList: (id: string) => void;
  addCard: (listId: string, title: string) => void;
  updateCard: (card: Card) => void;
  deleteCard: (listId: string, cardId: string) => void;
  moveCard: (cardId: string, fromListId: string, toListId: string, newPosition: number) => void;
  toggleChecklistItem: (cardId: string, itemId: string) => void;
  addComment: (cardId: string, text: string, attachments?: File[]) => Promise<void>;
  deleteComment: (cardId: string, commentId: string) => void;
}

const defaultBackgrounds = [
  {
    type: 'image' as const,
    value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop'
  },
  {
    type: 'image' as const,
    value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop'
  },
  {
    type: 'image' as const,
    value: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop'
  },
  {
    type: 'gradient' as const,
    value: 'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500'
  },
  {
    type: 'gradient' as const,
    value: 'bg-gradient-to-r from-emerald-500 to-emerald-900'
  },
  {
    type: 'gradient' as const,
    value: 'bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900'
  }
];

const createStudyTemplate = (): List[] => [
  {
    id: crypto.randomUUID(),
    title: 'Temas del examen',
    color: '#3b82f6', // Blue
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Tema 1: Introducción',
        description: 'Conceptos básicos y fundamentos de la asignatura',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Revisar apuntes de clase', completed: false },
          { id: crypto.randomUUID(), text: 'Leer capítulo del libro', completed: false },
          { id: crypto.randomUUID(), text: 'Ver vídeos explicativos', completed: false }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: 'Tema 2: Desarrollo',
        description: 'Temas principales y conceptos clave',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Estudiar fórmulas', completed: false },
          { id: crypto.randomUUID(), text: 'Hacer ejercicios prácticos', completed: false }
        ]
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'Pendiente de estudiar',
    color: '#ef4444', // Red
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Tema 3: Aplicaciones',
        description: 'Casos prácticos y ejemplos de aplicación',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: []
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'En progreso',
    color: '#f59e0b', // Amber
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Tema 4: Metodología',
        description: 'Procedimientos y técnicas de resolución',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Practicar ejercicios tipo', completed: true },
          { id: crypto.randomUUID(), text: 'Repasar teoría', completed: false }
        ]
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'Dudas/Preguntas',
    color: '#8b5cf6', // Purple
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Duda sobre fórmulas',
        description: 'Consultar con el profesor la aplicación correcta',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: []
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'Repasado',
    color: '#10b981', // Emerald
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Conceptos básicos',
        description: 'Fundamentos y definiciones principales',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Hacer resumen', completed: true },
          { id: crypto.randomUUID(), text: 'Repasar ejercicios', completed: true }
        ]
      }
    ]
  }
];

const createGroupWorkTemplate = (): List[] => [
  {
    id: crypto.randomUUID(),
    title: 'Ideas y planificación',
    color: '#3b82f6', // Blue
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Lluvia de ideas inicial',
        description: 'Recopilar todas las ideas y propuestas del equipo',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Organizar reunión de equipo', completed: false },
          { id: crypto.randomUUID(), text: 'Documentar todas las ideas', completed: false },
          { id: crypto.randomUUID(), text: 'Definir objetivos principales', completed: false }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: 'Definir alcance del proyecto',
        description: 'Establecer límites y objetivos claros',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Listar objetivos específicos', completed: false },
          { id: crypto.randomUUID(), text: 'Establecer cronograma', completed: false }
        ]
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'Tareas pendientes',
    color: '#ef4444', // Red
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Investigación inicial',
        description: 'Recopilar información y recursos necesarios',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Buscar fuentes académicas', completed: false },
          { id: crypto.randomUUID(), text: 'Analizar casos similares', completed: false }
        ]
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'En proceso',
    color: '#f59e0b', // Amber
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Desarrollo de contenido',
        description: 'Creación del contenido principal del trabajo',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Redactar introducción', completed: true },
          { id: crypto.randomUUID(), text: 'Desarrollar marco teórico', completed: false }
        ]
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'En revisión',
    color: '#8b5cf6', // Purple
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Revisión de la primera sección',
        description: 'Revisar y corregir el contenido inicial',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Revisar ortografía', completed: false },
          { id: crypto.randomUUID(), text: 'Verificar referencias', completed: false }
        ]
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'Completado',
    color: '#10b981', // Emerald
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Planificación inicial',
        description: 'Estructura y organización del trabajo',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Crear índice', completed: true },
          { id: crypto.randomUUID(), text: 'Asignar roles', completed: true }
        ]
      }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'Notas y recursos',
    color: '#6b7280', // Gray
    cards: [
      {
        id: crypto.randomUUID(),
        title: 'Enlaces útiles',
        description: 'Recursos y referencias importantes',
        views: 0,
        comments: [],
        assignees: [],
        labels: [],
        checklist: [
          { id: crypto.randomUUID(), text: 'Organizar bibliografía', completed: false },
          { id: crypto.randomUUID(), text: 'Compartir documentos clave', completed: false }
        ]
      }
    ]
  }
];

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [
    {
      id: '1',
      title: 'Examen',
      background: defaultBackgrounds[0],
      members: ['1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lists: createStudyTemplate()
    },
    {
      id: '2',
      title: 'Trabajo en Grupo',
      background: defaultBackgrounds[1],
      members: ['1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lists: createGroupWorkTemplate()
    },
    {
      id: '3',
      title: 'Notas - Tareas',
      background: defaultBackgrounds[2],
      members: ['1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lists: []
    }
  ],
  currentBoard: null,
  lists: [],

  addBoard: (title: string) => {
    const newBoard: Board = {
      id: crypto.randomUUID(),
      title,
      background: defaultBackgrounds[Math.floor(Math.random() * defaultBackgrounds.length)],
      members: ['1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lists: []
    };

    set((state) => ({
      boards: [...state.boards, newBoard]
    }));

    return newBoard;
  },

  updateBoard: (id: string, title: string, dueDate?: string | null) => {
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === id
          ? {
              ...board,
              title,
              dueDate,
              updatedAt: new Date().toISOString()
            }
          : board
      ),
      currentBoard: state.currentBoard?.id === id
        ? {
            ...state.currentBoard,
            title,
            dueDate,
            updatedAt: new Date().toISOString()
          }
        : state.currentBoard
    }));
  },

  updateBoardBackground: (id: string, background: Board['background']) => {
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === id
          ? {
              ...board,
              background,
              updatedAt: new Date().toISOString()
            }
          : board
      ),
      currentBoard: state.currentBoard?.id === id
        ? {
            ...state.currentBoard,
            background,
            updatedAt: new Date().toISOString()
          }
        : state.currentBoard
    }));
  },

  deleteBoard: (id: string) => {
    set((state) => ({
      boards: state.boards.filter((board) => board.id !== id),
      currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
      lists: state.currentBoard?.id === id ? [] : state.lists
    }));
  },

  setCurrentBoard: (boardId: string) => {
    const board = get().boards.find(b => b.id === boardId);
    if (board) {
      set({ currentBoard: board, lists: board.lists });
    } else {
      set({ currentBoard: null, lists: [] });
    }
  },

  addList: (title: string) => {
    set((state) => ({
      lists: [
        ...state.lists,
        {
          id: crypto.randomUUID(),
          title,
          cards: []
        }
      ]
    }));
  },

  updateList: (id: string, title: string, color?: string) => {
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { ...list, title, color } : list
      )
    }));
  },

  deleteList: (id: string) => {
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== id)
    }));
  },

  duplicateList: (id: string) => {
    const state = get();
    const listToDuplicate = state.lists.find(list => list.id === id);
    
    if (listToDuplicate) {
      const duplicatedCards = listToDuplicate.cards.map(card => ({
        ...card,
        id: crypto.randomUUID(),
        comments: card.comments.map(comment => ({
          ...comment,
          id: crypto.randomUUID()
        })),
        checklist: card.checklist.map(item => ({
          ...item,
          id: crypto.randomUUID()
        }))
      }));

      const newList: List = {
        id: crypto.randomUUID(),
        title: `${listToDuplicate.title} (copia)`,
        cards: duplicatedCards,
        color: listToDuplicate.color
      };

      set((state) => ({
        lists: [...state.lists, newList]
      }));
    }
  },

  addCard: (listId: string, title: string) => {
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              cards: [
                ...list.cards,
                {
                  id: crypto.randomUUID(),
                  title,
                  description: '',
                  views: 0,
                  comments: [],
                  assignees: [],
                  labels: [],
                  checklist: [],
                  dueDate: null,
                  completed: false
                }
              ]
            }
          : list
      )
    }));
  },

  updateCard: (updatedCard: Card) => {
    set((state) => ({
      lists: state.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        )
      }))
    }));
  },

  deleteCard: (listId: string, cardId: string) => {
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              cards: list.cards.filter((card) => card.id !== cardId)
            }
          : list
      )
    }));
  },

  moveCard: (cardId: string, fromListId: string, toListId: string, newPosition: number) => {
    const state = get();
    const fromList = state.lists.find((list) => list.id === fromListId);
    const toList = state.lists.find((list) => list.id === toListId);
    
    if (!fromList || !toList) return;

    // Find the card to move
    const cardToMove = fromList.cards.find((card) => card.id === cardId);
    if (!cardToMove) return;

    set((state) => ({
      lists: state.lists.map((list) => {
        // If this is the source list
        if (list.id === fromListId) {
          // If moving within the same list
          if (fromListId === toListId) {
            const cards = [...list.cards];
            const oldIndex = cards.findIndex(card => card.id === cardId);
            const [removed] = cards.splice(oldIndex, 1);
            cards.splice(newPosition, 0, removed);
            return { ...list, cards };
          }
          // If moving to a different list, remove the card
          return {
            ...list,
            cards: list.cards.filter((card) => card.id !== cardId)
          };
        }
        
        // If this is the destination list and it's a different list
        if (list.id === toListId && fromListId !== toListId) {
          const cards = [...list.cards];
          cards.splice(newPosition, 0, cardToMove);
          return { ...list, cards };
        }
        
        return list;
      })
    }));
  },

  toggleChecklistItem: (cardId: string, itemId: string) => {
    set((state) => ({
      lists: state.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                checklist: card.checklist.map((item) =>
                  item.id === itemId
                    ? { ...item, completed: !item.completed }
                    : item
                )
              }
            : card
        )
      }))
    }));
  },

  addComment: async (cardId: string, text: string, attachments?: File[]) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      text,
      author: 'Usuario',
      createdAt: new Date().toISOString(),
      attachments: []
    };

    if (attachments && attachments.length > 0) {
      const uploadedAttachments: CommentAttachment[] = [];

      for (const file of attachments) {
        if (file.type.startsWith('image/')) {
          const storageRef = ref(storage, `comments/${cardId}/${newComment.id}/${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);

          uploadedAttachments.push({
            id: crypto.randomUUID(),
            type: 'image',
            url,
            name: file.name,
            size: file.size
          });
        }
      }

      newComment.attachments = uploadedAttachments;
    }

    set((state) => ({
      lists: state.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                comments: [...card.comments, newComment]
              }
            : card
        )
      }))
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
                comments: card.comments.filter((comment) => comment.id !== commentId)
              }
            : card
        )
      }))
    }));
  }
}));