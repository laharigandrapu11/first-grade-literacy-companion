// Shared app types for client components
// Mirrors Prisma enums without importing from @prisma/client

export type Role = "TEACHER" | "SCHOOL_ADMIN";
export type GameMode = "LETTERS" | "WORDS" | "BOOKS";
export type MaterialType = "WORD_LIST" | "BOOK";

export interface AppMaterial {
  id: string;
  title: string;
  type: MaterialType;
  content: unknown;
  difficulty: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppGameSession {
  id: string;
  mode: GameMode;
  score: number;
  maxScore: number;
  duration: number;
  completed: boolean;
  createdAt: Date;
  studentId: string;
  assignmentId: string | null;
}

export interface AppAssignment {
  id: string;
  mode: GameMode;
  targetScore: number | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  classId: string;
  materialId: string | null;
  material?: AppMaterial | null;
}
