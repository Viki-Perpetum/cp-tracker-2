import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, Clock, Search, FileText, Euro, Building2, ChevronRight } from "lucide-react";

type Status = "Completed" | "In Progress" | "Blocked" | "At Risk";

interface CPItem {
  id: string;
  cp: string;
  contractor: string;
  milestone: string;
  dueDate: string;
  drawdownDate: string;
  status: Status;
  missingDocs: string[];
  financeCondition: string;
  amount: number;
  notes: string;
}

const DATA: CPItem[] = [
  { id: "1", cp: "CP-01", contractor: "Heijmans NV", milestone: "Foundations Complete", dueDate: "2024-03-15", drawdownDate: "2024-03-28", status: "Completed", missingDocs: [], financeCondition: "FC-A: Site Handover Certificate", amount: 1200000, notes: "All docs received, Belfius approved drawdown." },
  { id: "2", cp: "CP-02", contractor: "BAM Construct", milestone: "Structural Frame Level 3", dueDate: "2024-05-10", drawdownDate: "2024-05-24", status: "In Progress", missingDocs: ["Progress Report May", "Insurance Certificate"], financeCondition: "FC-B: Frame Inspection Sign-off", amount: 2450000, notes: "Inspection scheduled 08-May. Insurance renewal delayed." },
  { id: "3", cp: "CP-03", contractor: "Democo Group", milestone: "Facade & Roofing", dueDate: "2024-06-01", drawdownDate: "2024-06-15", status: "At Risk", missingDocs: ["Architect Completion Cert", "Thermal Performance Report", "Subcontractor Warranty"], financeCondition: "FC-C: Watertight Certificate", amount: 3100000, notes: "Facade supplier 3 weeks behind. Risk to drawdown deadline." },
  { id: "4", cp: "CP-04", contractor: "Besix SA", milestone: "MEP Rough-In", dueDate: "2024-07-20", drawdownDate: "2024-08-05", status: "Blocked", missingDocs: ["MEP Design Approval", "Fire Safety Submission", "Permit Variation Order"], financeCondition: "FC-D: MEP Stage Approval", amount: 1875000, notes: "Permit variation blocked by municipality. Legal review ongoing." },
  { id: "5", cp: "CP-05", contractor: "Cordeel NV", milestone: "Interior Fit-Out Shell", dueDate: "2024-09-05", drawdownDate: "2024-09-19", status: "In Progress", missingDocs: ["Fit-Out Programme"], financeCondition: "FC-E: Shell Completion Report", amount: 980000, notes: "On track. Programme doc expected next week." },
  { id: "6", cp: "CP-06", contractor: "Jan De Nul", milestone: "External Works & Landscaping", dueDate: "2024-10-30", drawdownDate: "2024-11-15", status: "In Progress", missingDocs: [], financeCondition: "FC-F: Practical Completion Certificate", amount: 560000, notes: "Early stage. No issues flagged." },
];

const STATUS_CONFIG: Record<Status, { color: string; icon: React.ReactNode; badge: string }> = {
  Completed: { color: "text-emerald-600", icon: <CheckCircle2 className="w-4 h-4" />, badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "In Progress": { color: "text-blue-600", icon: <Clock className="w-4 h-4" />, badge: "bg-blue-100 text-blue-700 border-blue-200" },
  "At Risk": { color: "text-amber-600", icon: <AlertTriangle className="w-4 h-4" />, badge: "bg-amber-100 text-amber-700 border-amber-200" },
  Blocked: { color: "text-red-600", icon: <AlertTriangle className="w-4 h-4" />, badge: "bg-red-100 text-red-700 border-red-200" },
};

function fmt(n: number) { return "€" + n.toLocaleString("en-EU"); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }

export default function CpTracker() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<CPItem | null>(null);

  const filtered = useMemo(() => {
    let d = DATA;
    if (tab !== "all") d = d.filter(r => r.status.toLowerCase().replace(/ /g, "-") === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      d = d.filter(r => r.cp.toLowerCase().includes(q) || r.contractor.toLowerCase().includes(q) || r.milestone.toLowerCase().includes(q));
    }
    return d;
  }, [search, tab]);

  const kpi = useMemo(() => ({
    total: DATA.length,
    blocked: DATA.filter(d => d.status === "Blocked").length,
    atRisk: DATA.filter(d => d.status === "At Risk").length,
    totalMissing: DATA.reduce((a, d) => a + d.missingDocs.length, 0),
    nextDrawdown: DATA.filter(d => d.status !== "Completed").sort((a, b) => a.drawdownDate.localeCompare(b.drawdownDate))[0],
  }), []);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> CP Milestone &amp; Drawdown Tracker</h1>
        <p className="text-muted-foreground text-sm">Single source of truth for Construction Packages, Belfius financing conditions, and contractor deliverables.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total CPs</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-foreground">{kpi.total}</p><p className="text-xs text-muted-foreground mt-1">{DATA.filter(d => d.status === "Completed").length} completed</p></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Blocked / At Risk</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-red-600">{kpi.blocked + kpi.atRisk}</p><p className="text-xs text-muted-foreground mt-1">{kpi.blocked} blocked · {kpi.atRisk} at risk</p></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Missing Documents</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-amber-600">{kpi.totalMissing}</p><p className="text-xs text-muted-foreground mt-1">across all active CPs</p></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Next Drawdown</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            {kpi.nextDrawdown ? <><p className="text-lg font-bold text-foreground">{fmtDate(kpi.nextDrawdown.drawdownDate)}</p><p className="text-xs text-muted-foreground mt-1">{kpi.nextDrawdown.cp} · {fmt(kpi.nextDrawdown.amount)}</p></> : <p className="text-sm text-muted-foreground">None pending</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <CardTitle className="text-base font-semibold text-foreground">Construction Packages</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search CP, contractor…" className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-3 h-8">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="blocked" className="text-xs">Blocked</TabsTrigger>
              <TabsTrigger value="at-risk" className="text-xs">At Risk</TabsTrigger>
              <TabsTrigger value="in-progress" className="text-xs">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">CP</TableHead>
                      <TableHead className="text-xs">Contractor</TableHead>
                      <TableHead className="text-xs">Milestone</TableHead>
                      <TableHead className="text-xs">Due</TableHead>
                      <TableHead className="text-xs">Drawdown</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Missing Docs</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && (
                      <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground text-sm py-8">No results found.</TableCell></TableRow>
                    )}
                    {filtered.map(row => (
                      <TableRow key={row.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSelected(row)}>
                        <TableCell className="font-semibold text-sm text-primary">{row.cp}</TableCell>
                        <TableCell className="text-sm">{row.contractor}</TableCell>
                        <TableCell className="text-sm max-w-[160px] truncate">{row.milestone}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{fmtDate(row.dueDate)}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{fmtDate(row.drawdownDate)}</TableCell>
                        <TableCell className="text-sm font-medium">{fmt(row.amount)}</TableCell>
                        <TableCell>
                          {row.missingDocs.length === 0
                            ? <span className="text-xs text-emerald-600 font-medium">None</span>
                            : <span className="text-xs font-semibold text-red-600">{row.missingDocs.length} missing</span>}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_CONFIG[row.status].badge}`}>
                            {STATUS_CONFIG[row.status].icon}{row.status}
                          </span>
                        </TableCell>
                        <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <span className={STATUS_CONFIG[selected.status].color}>{STATUS_CONFIG[selected.status].icon}</span>
                  {selected.cp} — {selected.milestone}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">{selected.contractor} · Drawdown {fmtDate(selected.drawdownDate)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 rounded-lg p-3"><p className="text-xs text-muted-foreground mb-1">Drawdown Amount</p><p className="font-bold text-foreground flex items-center gap-1"><Euro className="w-3.5 h-3.5" />{selected.amount.toLocaleString()}</p></div>
                  <div className="bg-muted/40 rounded-lg p-3"><p className="text-xs text-muted-foreground mb-1">Milestone Due</p><p className="font-bold text-foreground">{fmtDate(selected.dueDate)}</p></div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Belfius Finance Condition</p>
                  <p className="text-sm font-medium text-foreground">{selected.financeCondition}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Missing Documents ({selected.missingDocs.length})</p>
                  {selected.missingDocs.length === 0
                    ? <p className="text-sm text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> All documents received</p>
                    : <ul className="space-y-1">{selected.missingDocs.map(d => <li key={d} className="flex items-center gap-2 text-sm text-foreground"><AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />{d}</li>)}</ul>}
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground">{selected.notes}</p>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Close</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
