"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Material, MaterialType } from "@prisma/client";
import { format } from "date-fns";

type AssignmentWithLabel = {
  id: string;
  mode: string;
  modeLabel: string;
  targetScore: number | null;
  dueDate: Date | null;
  materialId: string | null;
  material: Material | null;
  createdAt: Date;
};

const MODE_OPTIONS = [
  { value: "LETTERS", label: "🔤 Letters", description: "Letter recognition" },
  { value: "WORDS", label: "📝 Words", description: "Sight word matching" },
  { value: "BOOKS", label: "📖 Books", description: "Reading comprehension" },
];

const MODE_COLORS: Record<string, string> = {
  LETTERS: "bg-blue-100 text-blue-700",
  WORDS: "bg-green-100 text-green-700",
  BOOKS: "bg-purple-100 text-purple-700",
};

export default function AssignmentPanel({
  assignments,
  classId,
  materials,
}: {
  assignments: AssignmentWithLabel[];
  classId: string;
  materials: Material[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState("WORDS");
  const [targetScore, setTargetScore] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [materialId, setMaterialId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMaterials = materials.filter((m) => {
    if (mode === "WORDS") return m.type === MaterialType.WORD_LIST;
    if (mode === "BOOKS") return m.type === MaterialType.BOOK;
    return false;
  });

  async function handleCreate() {
    setLoading(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        mode,
        targetScore: targetScore || null,
        dueDate: dueDate || null,
        materialId: materialId || null,
      }),
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Assignment created!");
      setTargetScore("");
      setDueDate("");
      setMaterialId("");
      router.refresh();
    } else {
      toast.error("Failed to create assignment");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      toast.success("Assignment removed");
      router.refresh();
    } else {
      toast.error("Failed to remove assignment");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Game Mode</Label>
            <Select value={mode} onValueChange={(v) => { if (v) { setMode(v); setMaterialId(""); } }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span>{opt.label}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      ({opt.description})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredMaterials.length > 0 && (
            <div className="space-y-1.5">
              <Label>Material (optional)</Label>
              <Select
                value={materialId || "none"}
                onValueChange={(v) => setMaterialId(v === "none" ? "" : (v ?? ""))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a material..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Default content</SelectItem>
                  {filteredMaterials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}{" "}
                      <span className="text-muted-foreground text-xs">
                        (Difficulty {m.difficulty}/5)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Target Score</Label>
              <Input
                type="number"
                placeholder="e.g., 8"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleCreate} disabled={loading} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            {loading ? "Creating..." : "Create Assignment"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Assignments */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-700 text-sm">
          All Assignments ({assignments.length})
        </h3>
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm">No assignments yet</p>
          </div>
        ) : (
          assignments.map((a) => {
            const isExpired = a.dueDate && new Date(a.dueDate) < new Date();
            return (
              <Card key={a.id} className={isExpired ? "opacity-60" : ""}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border-0 ${MODE_COLORS[a.mode]}`}>
                        {a.modeLabel}
                      </Badge>
                      {isExpired && (
                        <Badge variant="outline" className="text-xs text-slate-400">
                          Expired
                        </Badge>
                      )}
                    </div>
                    {a.material && (
                      <p className="text-sm text-slate-600">{a.material.title}</p>
                    )}
                    <div className="flex gap-3 text-xs text-slate-400">
                      {a.targetScore && <span>Target: {a.targetScore} pts</span>}
                      {a.dueDate && (
                        <span>Due: {format(new Date(a.dueDate), "MMM d, yyyy")}</span>
                      )}
                      <span>Created {format(new Date(a.createdAt), "MMM d")}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
