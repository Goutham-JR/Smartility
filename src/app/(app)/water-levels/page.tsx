"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { waterLevelsApi, ApiWaterLevel } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Droplets, Plus, RefreshCw } from "lucide-react";

function WaterGauge({ percent }: { percent: number }) {
  const color = percent > 60 ? "bg-emerald-500" : percent > 30 ? "bg-amber-500" : "bg-red-500";
  const bgColor = percent > 60 ? "bg-emerald-100 dark:bg-emerald-900/20" : percent > 30 ? "bg-amber-100 dark:bg-amber-900/20" : "bg-red-100 dark:bg-red-900/20";
  return (
    <div className={`relative h-24 w-full overflow-hidden rounded-xl ${bgColor}`}>
      <div className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${color}`} style={{ height: `${percent}%` }}>
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(180deg,transparent_50%,rgba(255,255,255,0.3)_100%)]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-foreground drop-shadow-sm">{percent}%</span>
      </div>
    </div>
  );
}

export default function WaterLevelsPage() {
  const { communities, userName, addNotification } = useStore();
  const [latest, setLatest] = useState<ApiWaterLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selCommunity, setSelCommunity] = useState("");
  const [level, setLevel] = useState("50");
  const [tankName, setTankName] = useState("Main Tank");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const d = await waterLevelsApi.getLatest(); setLatest(d); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRecord = async () => {
    if (!selCommunity || !level) return;
    try {
      await waterLevelsApi.create({ communityId: selCommunity, tankName, levelPercent: parseInt(level), recordedBy: userName });
      addNotification("Water level recorded");
      setAddOpen(false);
      fetchData();
    } catch { addNotification("Failed to record", "error"); }
  };

  const getReading = (commId: string) => latest.find((l) => l.communityId === commId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Water Levels</h1>
          <p className="text-muted-foreground">Monitor water tank levels across communities</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/80">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90">
              <Plus className="h-4 w-4" /> Record Level
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Record Water Level</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Community</Label>
                  <select value={selCommunity} onChange={(e) => setSelCommunity(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select community...</option>
                    {communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><Label>Tank Name</Label><Input value={tankName} onChange={(e) => setTankName(e.target.value)} className="mt-1" /></div>
                <div><Label>Level (%)</Label><Input type="number" min="0" max="100" value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1" /></div>
                <button onClick={handleRecord} disabled={!selCommunity} className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">Record</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {communities.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
          <Droplets className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">No communities</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {communities.map((comm) => {
          const reading = getReading(comm.id);
          const pct = reading?.levelPercent ?? 0;
          return (
            <Card key={comm.id} className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{comm.name}</p>
                    <p className="text-xs text-muted-foreground">{reading?.tankName || "Main Tank"}</p>
                  </div>
                  <Droplets className={`h-5 w-5 ${pct > 60 ? "text-emerald-500" : pct > 30 ? "text-amber-500" : "text-red-500"}`} />
                </div>
                <WaterGauge percent={pct} />
                <p className="text-xs text-muted-foreground text-center">
                  {reading ? `Updated ${new Date(reading.recordedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : "No reading"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
