import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaterialType } from "@prisma/client";

const DIFFICULTY_STARS = (n: number) => "⭐".repeat(n) + "☆".repeat(5 - n);

export default async function MaterialsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const materials = await prisma.material.findMany({
    orderBy: [{ type: "asc" }, { difficulty: "asc" }],
    include: { _count: { select: { assignments: true } } },
  });

  const wordLists = materials.filter((m) => m.type === MaterialType.WORD_LIST);
  const books = materials.filter((m) => m.type === MaterialType.BOOK);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Materials Library</h1>
        <p className="text-slate-500 mt-1">
          Available word lists and books to assign to your classes
        </p>
      </div>

      <section>
        <h2 className="text-xl font-bold text-slate-700 mb-4">📝 Word Lists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {wordLists.map((m) => {
            const content = m.content as { words: { word: string; emoji: string }[] };
            return (
              <Card key={m.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{m.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                      Used {m._count.assignments}x
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{DIFFICULTY_STARS(m.difficulty)}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {content.words.slice(0, 10).map((w) => (
                      <span
                        key={w.word}
                        className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                      >
                        {w.emoji} {w.word}
                      </span>
                    ))}
                    {content.words.length > 10 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">
                        +{content.words.length - 10} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-700 mb-4">📖 Books</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {books.map((m) => {
            const content = m.content as {
              pages: { text: string; vocabularyWords: string[] }[];
              questions: { question: string }[];
            };
            const vocabWords = content.pages.flatMap((p) => p.vocabularyWords);
            return (
              <Card key={m.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{m.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                      Used {m._count.assignments}x
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{DIFFICULTY_STARS(m.difficulty)}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>📄 {content.pages.length} pages</span>
                    <span>❓ {content.questions.length} questions</span>
                    <span>🔤 {vocabWords.length} vocab words</span>
                  </div>
                  <p className="text-sm text-slate-500 italic line-clamp-2">
                    "{content.pages[0]?.text}"
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
