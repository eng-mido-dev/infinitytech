import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Code, Github, Terminal, ExternalLink } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const gridVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const STATUS_COLORS: Record<string, string> = {
  completed: "text-green-400 bg-green-400/10 border-green-400/20",
  active:    "text-primary bg-primary/10 border-primary/20",
  archived:  "text-muted-foreground bg-muted/30 border-border",
};

const STATUS_LABELS: Record<string, { en: string; ar: string }> = {
  completed: { en: "Completed", ar: "مكتمل" },
  active:    { en: "Active",    ar: "نشط"    },
  archived:  { en: "Archived",  ar: "مؤرشف"  },
};

type FilterKey = "all" | "gripper" | "3d" | "simatic";

const CATEGORY_STYLE: Record<string, string> = {
  gripper: "text-amber-400 bg-amber-500/15 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]",
  "3d":    "text-blue-400 bg-blue-500/15 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]",
  simatic: "text-violet-400 bg-violet-500/15 border-violet-500/30 shadow-[0_0_8px_rgba(139,92,246,0.2)]",
};

const CATEGORY_LABEL: Record<string, { en: string; ar: string }> = {
  gripper: { en: "Gripper",    ar: "Gripper"    },
  "3d":    { en: "3D Design",  ar: "تصميم ثلاثي" },
  simatic: { en: "Simatic",    ar: "Simatic"     },
};

function IconAll() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
      <rect x="2" y="2" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11.5" y="2" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="11.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11.5" y="11.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconGripper() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
      <path d="M10 16v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="7.5" y="12" width="5" height="1.5" rx="0.75" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 12 C3.5 12 2.5 11 2.5 9.5 L2.5 7 C2.5 6 3 5 4 4.5 L5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M15 12 C16.5 12 17.5 11 17.5 9.5 L17.5 7 C17.5 6 17 5 16 4.5 L15 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 4 C5 3 6 2 7.5 2 L12.5 2 C14 2 15 3 15 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="10" cy="17.5" r="1" fill="currentColor"/>
    </svg>
  );
}

function Icon3D() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
      <path d="M10 2 L18 6.5 L18 13.5 L10 18 L2 13.5 L2 6.5 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M10 2 L10 18" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 1.5"/>
      <path d="M2 6.5 L10 11 L18 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSimatic() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
      <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="5.5" y="7.5" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="10" y="7.5" width="3" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="10" y="10.5" width="3" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M1 8.5 H3 M17 8.5 H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M1 11.5 H3 M17 11.5 H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

const FILTERS: { key: FilterKey; en: string; ar: string; Icon: () => JSX.Element }[] = [
  { key: "all",     en: "All",        ar: "الكل",         Icon: IconAll     },
  { key: "gripper", en: "Gripper",    ar: "Gripper",      Icon: IconGripper },
  { key: "3d",      en: "3D Design",  ar: "تصميم ثلاثي",  Icon: Icon3D      },
  { key: "simatic", en: "Simatic",    ar: "Simatic",      Icon: IconSimatic },
];

const FILTER_ACTIVE: Record<FilterKey, string> = {
  all:     "bg-primary text-primary-foreground border-primary/50 shadow-[0_0_12px_rgba(34,211,238,0.35)]",
  gripper: "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
  "3d":    "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.3)]",
  simatic: "bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.3)]",
};

export function Projects() {
  const { data: projects, isLoading } = useProjects();
  const { t, isRTL } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (activeFilter === "all") return projects;
    return projects.filter(p =>
      (p.category ?? "").toLowerCase().trim() === activeFilter
    );
  }, [projects, activeFilter]);

  const counts = useMemo(() => {
    if (!projects) return {} as Record<FilterKey, number>;
    return {
      all:     projects.length,
      gripper: projects.filter(p => (p.category ?? "").toLowerCase() === "gripper").length,
      "3d":    projects.filter(p => (p.category ?? "").toLowerCase() === "3d").length,
      simatic: projects.filter(p => (p.category ?? "").toLowerCase() === "simatic").length,
    } satisfies Record<FilterKey, number>;
  }, [projects]);

  return (
    <div className="min-h-screen w-full pt-24 sm:pt-32 pb-16 sm:pb-24">
      <SEO
        title={t("Projects & Research", "المشاريع والبحوث")}
        description={t(
          "A comprehensive portfolio of hardware engineering work: multi-layer PCB design, embedded firmware, autonomous robotics, and edge AI systems.",
          "مجموعة متكاملة من أعمال الهندسة الإلكترونية: تصميم PCB متعددة الطبقات، البرمجيات المدمجة، الروبوتات المستقلة، وأنظمة الذكاء الاصطناعي الطرفي.",
        )}
        keywords="PCB projects, embedded systems portfolio, hardware engineering projects, robotics research, FPGA projects"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 sm:mb-12"
        >
          <h1
            className="fluid-h1 font-black tracking-tighter text-foreground mb-4"
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            {t(
              <>Projects <span className="text-primary">&</span> Research</>,
              <>المشاريع <span className="text-primary">&</span> البحوث</>,
            )}
          </h1>
          <p
            className="text-lg text-muted-foreground max-w-2xl"
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            {t(
              "A comprehensive log of my engineering work across hardware design, multi-layer PCB layout, embedded firmware, and robotics systems.",
              "سجل شامل لأعمالي الهندسية في تصميم الأجهزة، تصميم لوحات PCB متعددة الطبقات، البرمجيات المدمجة، وأنظمة الروبوتات.",
            )}
          </p>
        </motion.div>

        {/* ── Filter navigation ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1"
            style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {FILTERS.map(({ key, en, ar, Icon }) => {
              const isActive = activeFilter === key;
              const count = counts[key] ?? 0;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0
                    ${isActive
                      ? FILTER_ACTIVE[key]
                      : "bg-card/60 backdrop-blur-sm text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
                    }`}
                >
                  <Icon />
                  {t(en, ar)}
                  {!isLoading && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md
                      ${isActive ? "bg-white/20" : "bg-muted text-muted-foreground/70"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active filter indicator line */}
          <div className="mt-3 h-px bg-border/50 relative overflow-hidden rounded-full">
            <motion.div
              layoutId="filter-line"
              className="absolute h-full rounded-full"
              style={{
                background: activeFilter === "all"
                  ? "rgba(34,211,238,0.6)"
                  : activeFilter === "gripper"
                  ? "rgba(245,158,11,0.6)"
                  : activeFilter === "3d"
                  ? "rgba(59,130,246,0.6)"
                  : "rgba(139,92,246,0.6)",
                width: "120px",
                left: 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* ── Content ───────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
                <div className="h-44 bg-muted/40" />
                <div className="p-5 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-muted/50" />
                    <div className="h-5 w-20 rounded-full bg-muted/50" />
                  </div>
                  <div className="h-5 w-3/4 rounded bg-muted/50" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-full rounded bg-muted/35" />
                    <div className="h-3.5 w-5/6 rounded bg-muted/35" />
                    <div className="h-3.5 w-2/3 rounded bg-muted/35" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-4 w-24 rounded bg-muted/35" />
                    <div className="h-8 w-28 rounded-lg bg-muted/40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <Terminal className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-semibold text-foreground mb-2">
                    {activeFilter === "all"
                      ? t("No projects yet", "لا توجد مشاريع بعد")
                      : t(`No ${activeFilter.toUpperCase()} projects yet`, `لا توجد مشاريع ${activeFilter} بعد`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("Projects will appear here once added from the admin panel.", "ستظهر المشاريع هنا بعد إضافتها من لوحة الإدارة.")}
                  </p>
                  {activeFilter !== "all" && (
                    <button
                      onClick={() => setActiveFilter("all")}
                      className="mt-6 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      {t("View all projects", "عرض كل المشاريع")}
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  variants={gridVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filtered.map(project => {
                    const displayTitle = t(project.title, project.titleAr || project.title);
                    const displayDesc  = t(project.description, project.descriptionAr || project.description);
                    const statusLabel  = STATUS_LABELS[project.status] ?? STATUS_LABELS.active;
                    const catKey = (project.category ?? "").toLowerCase().trim() as string;
                    const catStyle = CATEGORY_STYLE[catKey] ?? "text-primary bg-primary/15 border-primary/30";
                    const catLabel = CATEGORY_LABEL[catKey];

                    return (
                      <motion.div
                        key={project.id}
                        variants={itemVariants}
                        className="group flex flex-col bg-card/80 backdrop-blur-sm rounded-2xl border border-border hover:border-primary/40 hover-card-anim overflow-hidden relative"
                      >
                        {/* Status badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <span className={`px-2 py-1 text-[10px] font-mono font-bold rounded border ${STATUS_COLORS[project.status] ?? STATUS_COLORS.active}`}>
                            {t(statusLabel.en, statusLabel.ar)}
                          </span>
                        </div>

                        {/* Thumbnail */}
                        <div className="h-44 w-full relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#1A2330] to-[#0B0F14]">
                          {project.thumbnailUrl ? (
                            <img
                              src={project.thumbnailUrl}
                              alt={displayTitle}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <>
                              <div
                                className="absolute inset-0 opacity-30"
                                style={{
                                  backgroundImage:
                                    "radial-gradient(circle at 2px 2px, rgba(34,211,238,0.15) 1px, transparent 0)",
                                  backgroundSize: "20px 20px",
                                }}
                              />
                              <Terminal className="w-10 h-10 text-primary/30 group-hover:text-primary/50 transition-colors duration-200" />
                            </>
                          )}

                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />

                          {/* Category badge — glassmorphism */}
                          {catLabel && (
                            <div className="absolute top-3 left-3 z-10">
                              <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono font-bold rounded-lg border backdrop-blur-[10px] ${catStyle}`}>
                                {catKey === "gripper" && <IconGripper />}
                                {catKey === "3d"      && <Icon3D />}
                                {catKey === "simatic" && <IconSimatic />}
                                {t(catLabel.en, catLabel.ar)}
                              </span>
                            </div>
                          )}

                          {/* Tech tags at bottom */}
                          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
                            {project.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono font-medium rounded bg-background/60 backdrop-blur-[8px] border border-border text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-start justify-between mb-3 gap-2">
                            <h3
                              className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight flex-1"
                              style={{ textAlign: isRTL ? "right" : "left" }}
                            >
                              {displayTitle}
                            </h3>
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t("View Repository", "عرض المستودع")}
                                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                onClick={e => e.stopPropagation()}
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                          </div>

                          <p
                            className="text-sm text-muted-foreground flex-grow mb-6 line-clamp-3"
                            style={{ textAlign: isRTL ? "right" : "left" }}
                          >
                            {displayDesc}
                          </p>

                          {/* Action buttons */}
                          <div className="flex gap-2 mt-auto">
                            <Link
                              href={`/projects/${project.id}`}
                              className="flex-1 py-2.5 text-center text-sm font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors btn-primary-glow"
                            >
                              {t("View Details", "عرض التفاصيل")}
                            </Link>
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={catKey === "3d" ? t("View 3D Model", "عرض النموذج ثلاثي الأبعاد") : t("Live Demo", "عرض مباشر")}
                                className="flex items-center justify-center px-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
                                onClick={e => e.stopPropagation()}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t("View Code", "عرض الكود")}
                                className="flex items-center justify-center px-3 rounded-lg bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                                onClick={e => e.stopPropagation()}
                              >
                                <Code className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
