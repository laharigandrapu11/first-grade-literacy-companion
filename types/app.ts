// Shared app types for client components
// Mirrors Prisma enums without importing from @prisma/client

export type Role = "TEACHER" | "SCHOOL_ADMIN";
export type GameMode = "LETTERS" | "WORDS" | "BOOKS";
export type MaterialType = "WORD_LIST" | "BOOK";

// Runtime enum values (needed so the module has actual JS exports)
export const GameModeEnum = {
  LETTERS: "LETTERS" as GameMode,
  WORDS: "WORDS" as GameMode,
  BOOKS: "BOOKS" as GameMode,
};

export const MaterialTypeEnum = {
  WORD_LIST: "WORD_LIST" as MaterialType,
  BOOK: "BOOK" as MaterialType,
};

export const RoleEnum = {
  TEACHER: "TEACHER" as Role,
  SCHOOL_ADMIN: "SCHOOL_ADMIN" as Role,
};

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
