import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SchoolNav from "@/components/school/SchoolNav";

export default async function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "SCHOOL_ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <SchoolNav user={session.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
