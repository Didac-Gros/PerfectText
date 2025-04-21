import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
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
