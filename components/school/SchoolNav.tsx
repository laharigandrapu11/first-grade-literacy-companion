"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Role } from "@prisma/client";

interface NavUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  schoolName: string;
}

export default function SchoolNav({ user }: { user: NavUser }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/school" className="flex items-center gap-2">
            <span className="text-2xl">🏫</span>
            <div>
              <span className="font-extrabold text-violet-700 text-lg block leading-tight">
                {user.schoolName}
              </span>
              <span className="text-xs text-slate-400 leading-tight">Admin Dashboard</span>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400" />}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
