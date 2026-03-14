"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Role } from "@/types/app";

interface NavUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  schoolName: string;
}

export default function DashboardNav({ user }: { user: NavUser }) {
  const pathname = usePathname();

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
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span className="font-extrabold text-violet-700 text-lg hidden sm:block">
                Literacy Companion
              </span>
            </Link>

            <div className="flex gap-1">
              <Link href="/dashboard">
                <Button
                  variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                  size="sm"
                  className="font-semibold"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/materials">
                <Button
                  variant={pathname.startsWith("/dashboard/materials") ? "secondary" : "ghost"}
                  size="sm"
                  className="font-semibold"
                >
                  Materials
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/play" target="_blank">
              <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 hover:bg-amber-50">
                🎮 Student Play
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger render={<button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400" />}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                    <p className="text-xs text-violet-600 font-medium mt-0.5">{user.schoolName}</p>
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
      </div>
    </nav>
  );
}
