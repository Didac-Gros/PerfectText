import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { Board, List, Member } from "../../types/global"; // ajusta el path a tu archivo de interfaces
import { getAuth } from "firebase/auth";

const db = getFirestore();

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

export async function createDefaultBoards() {
  const auth = getAuth();
  const user = auth.currentUser;
  let boards: Board[] = [];
  if (user) {
    boards = [
      {
        id: crypto.randomUUID(),
        title: "Examen",
        background: defaultBackgrounds[0],
        members: [
          {
            userId: user.uid,
            isAdmin: true,
            image: user.photoURL!,
            name: user.displayName!,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastViewed: new Date().toISOString(),
        lists: createStudyTemplate(),
      },
      {
        id: crypto.randomUUID(),
        title: "Trabajo en Grupo",
        background: defaultBackgrounds[1],
        members: [
          {
            userId: user.uid,
            isAdmin: true,
            image: user.photoURL!,
            name: user.displayName!,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastViewed: new Date().toISOString(),
        lists: createGroupWorkTemplate(),
      },
      {
        id: crypto.randomUUID(),
        title: "Notas - Tareas",
        background: defaultBackgrounds[2],
        members: [
          {
            userId: user.uid,
            isAdmin: true,
            image: user.photoURL!,
            name: user.displayName!,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastViewed: new Date().toISOString(),
        lists: [],
      },
    ];
    for (const board of boards) {
      const boardRef = doc(db, "boards", board.id);
      await setDoc(boardRef, board);
    }
  }


}

export async function createBoardInFirestore(board: Board) {
  const boardRef = doc(db, "boards", board.id);
  await setDoc(boardRef, board);
}

export async function updateBoardFields(id: string, fields: Partial<Board>) {
  const boardRef = doc(db, "boards", id);
  await updateDoc(boardRef, {
    ...fields,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteBoardFromFirestore(id: string) {
  const boardRef = doc(db, "boards", id);
  await deleteDoc(boardRef);
}

export async function getBoardsForUser(userId: string): Promise<Board[]> {
  const boardsRef = collection(db, "boards");
  const snapshot = await getDocs(boardsRef);

  const userBoards: Board[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    const members = data.members || [];

    const isMember = members.some((m: Member) => m.userId === userId);

    if (isMember) {
      const board: Board = {
        id: doc.id,
        title: data.title,
        members: data.members,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lists: data.lists || [],
        dueDate: data.dueDate || null,
        background: data.background || undefined,
        lastViewed: data.lastViewed,
      };

      userBoards.push(board);
    }
  });

  return userBoards;
}

export async function updateBoardLists(boardId: string, lists: List[]) {
  const boardRef = doc(db, "boards", boardId);

  await updateDoc(boardRef, {
    lists,
    updatedAt: new Date().toISOString(),
  });
}

export async function getBoardById(boardId: string): Promise<Board | null> {
  try {
    const boardRef = doc(db, "boards", boardId);
    const snapshot = await getDoc(boardRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      title: data.title,
      members: data.members,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lists: data.lists,
      dueDate: data.dueDate || null,
      background: data.background || undefined,
    } as Board;
  } catch (error) {
    console.error("Error recuperant el board:", error);
    return null;
  }
}

export async function addMemberToBoard(
  boardId: string,
  newMember: Member
): Promise<void> {
  try {
    const boardRef = doc(db, "boards", boardId);
    const snapshot = await getDoc(boardRef);

    if (!snapshot.exists()) {
      throw new Error("El tauler no existeix");
    }

    const boardData = snapshot.data();
    const currentMembers: Member[] = boardData.members || [];

    // Evitem duplicats per userId
    const alreadyExists = currentMembers.some(
      (m) => m.userId === newMember.userId
    );
    if (alreadyExists) {
      console.warn("Aquest usuari ja és membre del tauler.");
      return;
    }

    const updatedMembers = [...currentMembers, newMember];

    await updateDoc(boardRef, {
      members: updatedMembers,
      updatedAt: new Date().toISOString(),
    });

    console.log("Membre afegit correctament al tauler.");
  } catch (error) {
    console.error("Error afegint el membre:", (error as Error).message);
  }
}

export const removeMemberFromBoard = async (boardId: string, userId: string) => {
  try {
    const boardRef = doc(db, "boards", boardId);
    const boardSnap = await getDoc(boardRef);

    if (!boardSnap.exists()) {
      throw new Error("El board no existeix");
    }

    const boardData = boardSnap.data() as Board;

    const updatedMembers = boardData.members.filter(
      (member) => member.userId !== userId
    );

    await updateDoc(boardRef, {
      members: updatedMembers,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error eliminant el membre:", error);
    throw error;
  }
};

export const toggleAdminStatus = async (boardId: string, memberId: string) => {
  try {
    const boardRef = doc(db, "boards", boardId);
    const boardSnap = await getDoc(boardRef);

    if (!boardSnap.exists()) {
      throw new Error("El board no existeix");
    }

    const boardData = boardSnap.data() as Board;

    const updatedMembers = boardData.members.map((member) =>
      member.userId === memberId
        ? { ...member, isAdmin: !member.isAdmin }
        : member
    );

    await updateDoc(boardRef, {
      members: updatedMembers,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error alternant estat d'admin:", error);
    throw error;
  }
};