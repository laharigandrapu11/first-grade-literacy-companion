import { Role } from "@/types/app";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      schoolId: string;
      schoolName: string;
    };
  }

  interface User {
    role: Role;
    schoolId: string;
    schoolName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    schoolId: string;
    schoolName: string;
  }
}
