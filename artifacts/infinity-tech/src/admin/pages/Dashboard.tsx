import { useStore } from "@/admin/data/store";
import {
  DAILY_VISITS, PROJECT_STATS, TRAFFIC_SOURCES, TOTAL_STATS
} from "@/admin/data/analytics";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { motion } from "framer-motion";
import {
  FolderOpen, Users, Download, TrendingUp, GitCommit,
  ExternalLink, Clock, Activity
} from "lucide-react";
import { Link } from "wouter";

const STATUS_COLOR: Record<string, string> = {
  completed: "text-chart-4 bg-chart-4/10",
  active: "text-primary bg-primary/10",
  archived: "text-muted-foreground bg-muted",
};

const COMMIT_COLOR: Record<string, string> = {
  create: "bg-chart-4",
  update: "bg-primary",
  release: "bg-chart-2",
  fix: "bg-chart-3",
  design: "bg-chart-5",
};

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: any; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-card-border rounded-xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg bg-card border border-border`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
}

const chartTheme = {
  stroke: "hsl(215 30% 15%)",
  tick: "hsl(218 11% 55%)",
  grid: "hsl(215 30% 12%)",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { projects } = useStore();

  const activeCount = projects.filter(p => p.status === "active").length;
  const totalViews = projects.reduce((s, p) => s + p.views, 0);
  const totalDownloads = projects.reduce((s, p) => s + p.downloads, 0);

  const visitorData = DAILY_VISITS.slice(-14).map(d => ({
    date: d.date.slice(5),
    Visitors: d.visitors,
    "Page Views": d.pageViews,
  }));

  const recentCommits = projects
    .flatMap(p => p.commits.map(c => ({ ...c, projectTitle: p.title, projectId: p.id })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, Fares <span className="text-primary">👋</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderOpen} label="Total Projects" value={projects.length} sub={`${activeCount} active`} />
        <StatCard icon={Users} label="Total Visitors" value={TOTAL_STATS.totalVisitors.toLocaleString()} sub="Last 30 days" color="text-chart-2" />
        <StatCard icon={Download} label="Total Downloads" value={totalDownloads.toLocaleString()} sub="All time" color="text-chart-4" />
        <StatCard icon={TrendingUp} label="Total Views" value={totalViews.toLocaleString()} sub="All projects" color="text-chart-3" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visitor trend */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Visitor Trend</h2>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
            </div>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={visitorData}>
              <defs>
                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(188 86% 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(188 86% 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(271 80% 70%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(271 80% 70%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="date" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Visitors" stroke="hsl(188 86% 53%)" fill="url(#visitorsGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Page Views" stroke="hsl(271 80% 70%)" fill="url(#pvGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic sources */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Traffic Sources</h2>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={TRAFFIC_SOURCES} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {TRAFFIC_SOURCES.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: "hsl(216 29% 10%)", border: "1px solid hsl(215 30% 15%)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {TRAFFIC_SOURCES.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.fill }} />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
                <span className="font-medium text-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project views bar chart + Recent commits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project views */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Project Performance</h2>
              <p className="text-xs text-muted-foreground">Views vs Downloads</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={PROJECT_STATS.map(p => ({ name: p.title.split(" ").slice(0, 2).join(" "), Views: p.views, Downloads: p.downloads }))} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 10 }} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: chartTheme.tick }} />
              <Bar dataKey="Views" fill="hsl(188 86% 53%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Downloads" fill="hsl(271 80% 70%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent commits */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
              <p className="text-xs text-muted-foreground">Commit log</p>
            </div>
            <GitCommit className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-3 relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            {recentCommits.map((c, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 ${COMMIT_COLOR[c.type] || "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/projects/${c.projectId}`}>
                    <p className="text-xs font-medium text-foreground hover:text-primary truncate cursor-pointer">{c.message}</p>
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{c.hash}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground truncate">{c.projectTitle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects quick list */}
      <div className="bg-card border border-card-border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">All Projects</h2>
          <Link href="/admin/projects">
            <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
              Manage <ExternalLink className="w-3 h-3" />
            </span>
          </Link>
        </div>
        <div className="divide-y divide-border">
          {projects.map(p => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <FolderOpen className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status]}`}>
                  {p.status}
                </span>
                <div className="text-xs text-muted-foreground">{p.views.toLocaleString()} views</div>
                <Link href={`/admin/projects/${p.id}`}>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary cursor-pointer transition-all" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
