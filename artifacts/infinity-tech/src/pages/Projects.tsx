import { motion } from "framer-motion";
import { Link } from "wouter";
import { Code, Github, Terminal, ExternalLink, Tag } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
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

export function Projects() {
  const { data: projects, isLoading } = useProjects();
  const { t, isRTL } = useLanguage();

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 sm:mb-16"
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

        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-label="Loading projects"
            aria-busy="true"
          >
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse"
              >
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
        ) : projects && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Terminal className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              {t("No projects yet", "لا توجد مشاريع بعد")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("Projects will appear here once added from the admin panel.", "ستظهر المشاريع هنا بعد إضافتها من لوحة الإدارة.")}
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects?.map(project => {
              const displayTitle = t(project.title, project.titleAr || project.title);
              const displayDesc  = t(project.description, project.descriptionAr || project.description);
              const statusLabel  = STATUS_LABELS[project.status] ?? STATUS_LABELS.active;

              return (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="group flex flex-col bg-card rounded-2xl border border-border hover:border-primary/50 hover-card-anim overflow-hidden relative"
                >
                  {/* Status badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`px-2 py-1 text-[10px] font-mono font-bold rounded border ${STATUS_COLORS[project.status] ?? STATUS_COLORS.active}`}>
                      {t(statusLabel.en, statusLabel.ar)}
                    </span>
                  </div>

                  {/* Thumbnail / cover image */}
                  <div className="h-44 w-full relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#1A2330] to-[#0B0F14]">
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt={displayTitle}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

                    {/* Category + tech tags at bottom */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
                      {project.category && (
                        <span className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider font-mono font-bold rounded bg-primary/20 backdrop-blur-[8px] border border-primary/30 text-primary">
                          <Tag className="w-2.5 h-2.5" />
                          {project.category}
                        </span>
                      )}
                      {project.tags.slice(0, project.category ? 2 : 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-[10px] uppercase tracking-wider font-mono font-medium rounded bg-background/70 backdrop-blur-[8px] border border-border text-primary"
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
                      {/* GitHub icon link */}
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
                          title={t("Live Demo", "عرض مباشر")}
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
      </div>
    </div>
  );
}
