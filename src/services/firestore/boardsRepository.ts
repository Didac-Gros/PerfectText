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

const db = getFirestore();

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

export async function addMemberToBoard(boardId: string, newMember: Member): Promise<void> {
  try {
    const boardRef = doc(db, "boards", boardId);
    const snapshot = await getDoc(boardRef);

    if (!snapshot.exists()) {
      throw new Error("El tauler no existeix");
    }

    const boardData = snapshot.data();
    const currentMembers: Member[] = boardData.members || [];

    // Evitem duplicats per userId
    const alreadyExists = currentMembers.some(m => m.userId === newMember.userId);
    if (alreadyExists) {
      console.warn("Aquest usuari ja és membre del tauler.");
      return;
    }

    const updatedMembers = [...currentMembers, newMember];

    await updateDoc(boardRef, {
      members: updatedMembers,
      updatedAt: new Date().toISOString()
    });

    console.log("Membre afegit correctament al tauler.");
  } catch (error) {
    console.error("Error afegint el membre:", (error as Error).message);
  }
}

