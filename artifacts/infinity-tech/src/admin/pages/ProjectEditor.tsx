import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/admin/data/store";
import { motion, AnimatePresence } from "framer-motion";
import type {
  AdminProject, ProjectStatus, FileType, UpdateType, ProjectFile, ProjectUpdate
} from "@/admin/data/types";
import {
  ArrowLeft, Save, Plus, Trash2, Upload, FileText, Image, Video,
  Code2, GitCommit, Calendar, Tag, Globe, Lock, ChevronDown, X,
  Link2, CheckCircle2, AlertCircle, FolderArchive, FileCode,
  Cpu, Box, Film, Eye, EyeOff, ImagePlus, Loader2, ExternalLink,
} from "lucide-react";
import { Link } from "wouter";
import BilingualField from "@/admin/components/BilingualField";

const COMMIT_TYPE_COLOR: Record<string, string> = {
  create: "bg-chart-4 text-white",
  update: "bg-primary text-primary-foreground",
  release: "bg-chart-2 text-white",
  fix: "bg-chart-3 text-foreground",
  design: "bg-chart-5 text-white",
};
const FILE_TYPE_ICON: Record<FileType, any> = {
  gerbers: FolderArchive,
  schematic: FileText,
  model3d: Box,
  source: FileCode,
};
const FILE_TYPE_LABEL: Record<FileType, string> = {
  gerbers: "Gerber Files",
  schematic: "Schematic (PDF/Image)",
  model3d: "3D Model (STEP/OBJ)",
  source: "Source Code",
};
const UPDATE_TYPE_COLOR: Record<UpdateType, string> = {
  release: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  feature: "bg-primary/10 text-primary border-primary/20",
  fix: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  design: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  test: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  note: "bg-muted text-muted-foreground border-border",
};

const STATUS_OPTIONS: ProjectStatus[] = ["active", "completed", "archived"];
const UPDATE_TYPES: UpdateType[] = ["release", "feature", "fix", "design", "test", "note"];
const LANG_OPTIONS = ["c", "cpp", "python", "typescript", "rust", "vhdl", "assembly", "other"];

const EMPTY_PROJECT: Omit<AdminProject, "id" | "createdAt" | "updatedAt" | "commits" | "views" | "downloads"> = {
  title: "", titleAr: "",
  description: "", descriptionAr: "",
  overview: "", overviewAr: "",
  problem: "", problemAr: "",
  solution: "", solutionAr: "",
  tags: [], status: "active",
  codeSnippet: "", language: "c", githubUrl: "",
  liveUrl: "", category: "", thumbnailUrl: "" as string,
  timeline: [], files: [], media: [], updates: [],
};

interface ProjectEditorProps {
  mode: "create" | "edit";
  projectId?: string;
}

type Tab = "content" | "files" | "media" | "updates" | "history";

function TabButton({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );
}

function Field({ label, children, sub }: { label: string; children: React.ReactNode; sub?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      {sub && <p className="text-xs text-muted-foreground mb-1.5">{sub}</p>}
      {children}
    </div>
  );
}

const inputCls = "w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";
const textareaCls = `${inputCls} resize-none`;

export default function ProjectEditor({ mode, projectId }: ProjectEditorProps) {
  const [, navigate] = useLocation();
  const { getProject, createProject, updateProject, addFile, removeFile, addMedia, removeMedia, addUpdate, removeUpdate, saving, error: storeError } = useStore();

  const existing = projectId ? getProject(projectId) : null;
  const [form, setForm] = useState<typeof EMPTY_PROJECT>(existing ?? EMPTY_PROJECT);
  const [tab, setTab] = useState<Tab>("content");
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [commitMsg, setCommitMsg] = useState("");

  // Thumbnail image upload state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // File/media upload state
  const [addFileOpen, setAddFileOpen] = useState(false);
  const [fileForm, setFileForm] = useState<Omit<ProjectFile, "id" | "uploadedAt">>({
    name: "", type: "gerbers", description: "", size: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [addMediaUrl, setAddMediaUrl] = useState("");
  const [addMediaCaption, setAddMediaCaption] = useState("");
  const [addMediaType, setAddMediaType] = useState<"image" | "video">("image");

  const [addUpdateOpen, setAddUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState<Omit<ProjectUpdate, "id">>({
    date: new Date().toISOString().split("T")[0],
    version: "", title: "", titleAr: "", desc: "", descAr: "",
    type: "feature", adminOnly: false,
  });

  const project = projectId ? getProject(projectId) : null;

  function setField<K extends keyof typeof EMPTY_PROJECT>(key: K, val: typeof EMPTY_PROJECT[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleThumbnailPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailError(null);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearThumbnailFile() {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setThumbnailError(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  }

  async function uploadThumbnail(file: File): Promise<string> {
    const pin = localStorage.getItem("it-admin-pin") || "admin2024";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-admin-pin": pin },
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as any).error ?? "Image upload failed");
    }
    const { url } = await res.json();
    return url as string;
  }

  async function handleSave() {
    setSaveError(null);
    let finalForm = { ...form };

    if (thumbnailFile) {
      setThumbnailUploading(true);
      try {
        const url = await uploadThumbnail(thumbnailFile);
        finalForm = { ...finalForm, thumbnailUrl: url };
        setField("thumbnailUrl", url);
        clearThumbnailFile();
      } catch (err: any) {
        const msg = err.message ?? "Image upload failed";
        setThumbnailError(msg);
        setThumbnailUploading(false);
        return;
      }
      setThumbnailUploading(false);
    }

    try {
      if (mode === "create") {
        const p = await createProject(finalForm);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        navigate(`/admin/projects/${p.id}`);
      } else if (projectId) {
        await updateProject(projectId, finalForm, commitMsg || undefined);
        setCommitMsg("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err: any) {
      setSaveError(err.message ?? "Save failed");
    }
  }

  function handleTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !form.tags.includes(tag)) {
        setField("tags", [...form.tags, tag]);
      }
      setTagInput("");
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileForm(f => ({
      ...f,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
  }

  async function submitFile() {
    if (!projectId || !fileForm.name) return;
    await addFile(projectId, fileForm);
    setFileForm({ name: "", type: "gerbers", description: "", size: "" });
    setAddFileOpen(false);
  }

  async function submitMedia() {
    if (!projectId || !addMediaUrl) return;
    await addMedia(projectId, { type: addMediaType, url: addMediaUrl, caption: addMediaCaption, captionAr: "" });
    setAddMediaUrl("");
    setAddMediaCaption("");
  }

  async function submitUpdate() {
    if (!projectId || !updateForm.title) return;
    await addUpdate(projectId, updateForm);
    setAddUpdateOpen(false);
    setUpdateForm({ date: new Date().toISOString().split("T")[0], version: "", title: "", titleAr: "", desc: "", descAr: "", type: "feature", adminOnly: false });
  }

  const currentProject = projectId ? getProject(projectId) : null;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-4">
        <Link href="/admin/projects">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Projects
          </button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-sm font-semibold text-foreground truncate flex-1">
          {mode === "create" ? "New Project" : (form.title || "Edit Project")}
        </h1>

        {mode === "edit" && (
          <input
            value={commitMsg}
            onChange={e => setCommitMsg(e.target.value)}
            placeholder="Commit message (optional)"
            className="text-xs bg-muted border border-border rounded-md px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 w-56 font-mono"
          />
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            saved ? "bg-chart-4 text-white" :
            saveError ? "bg-red-500/80 text-white" :
            "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md hover:shadow-primary/20"
          }`}
        >
          {saving
            ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Saving…</>
            : saved
            ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            : saveError
            ? <><AlertCircle className="w-4 h-4" /> Error</>
            : <><Save className="w-4 h-4" /> {mode === "create" ? "Create" : "Save"}</>
          }
        </button>
      </div>
      {saveError && (
        <div className="px-6 pt-2">
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{saveError}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border px-6 flex gap-0 overflow-x-auto scrollbar-none">
        <TabButton label="Content" active={tab === "content"} onClick={() => setTab("content")} />
        <TabButton label="Files" active={tab === "files"} onClick={() => setTab("files")} badge={currentProject?.files.length} />
        <TabButton label="Media" active={tab === "media"} onClick={() => setTab("media")} badge={currentProject?.media.length} />
        <TabButton label="Updates" active={tab === "updates"} onClick={() => setTab("updates")} badge={currentProject?.updates.length} />
        {mode === "edit" && <TabButton label="History" active={tab === "history"} onClick={() => setTab("history")} badge={currentProject?.commits.length} />}
      </div>

      {/* Tab content */}
      <div className="p-6 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ── CONTENT TAB ── */}
          {tab === "content" && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <BilingualField
                label="Title"
                enValue={form.title}
                arValue={form.titleAr}
                onEnChange={v => setField("title", v)}
                onArChange={v => setField("titleAr", v)}
                enPlaceholder="Neural PCB Controller"
                arPlaceholder="وحدة تحكم PCB العصبية"
              />

              <BilingualField
                label="Short Description"
                enValue={form.description}
                arValue={form.descriptionAr}
                onEnChange={v => setField("description", v)}
                onArChange={v => setField("descriptionAr", v)}
                multiline
                rows={3}
                enPlaceholder="Brief project description…"
                arPlaceholder="وصف مختصر للمشروع…"
              />

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Cover Image
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload an image directly, or paste a URL below. Uploads are saved to the server.
                </p>

                {/* Preview area */}
                <div className="relative mb-3 rounded-xl overflow-hidden border border-border bg-muted/20 flex items-center justify-center"
                  style={{ height: "180px" }}>
                  {(thumbnailPreview || form.thumbnailUrl) ? (
                    <>
                      <img
                        src={thumbnailPreview || form.thumbnailUrl || ""}
                        alt="Thumbnail preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {thumbnailPreview && (
                        <div className="absolute bottom-2 left-2">
                          <span className="text-[10px] font-mono font-bold text-white/80 bg-black/50 px-2 py-0.5 rounded">
                            PENDING UPLOAD
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={thumbnailPreview ? clearThumbnailFile : () => setField("thumbnailUrl", "")}
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {form.thumbnailUrl && !thumbnailPreview && (
                        <a
                          href={form.thumbnailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-primary/80 transition-colors"
                          title="Open image"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/50 select-none pointer-events-none">
                      <ImagePlus className="w-10 h-10" />
                      <span className="text-xs">No image selected</span>
                    </div>
                  )}
                </div>

                {/* Upload button row */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={thumbnailUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {thumbnailUploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Choose Image</>
                    )}
                  </button>
                  {thumbnailFile && (
                    <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 rounded-lg bg-muted/30 border border-border">
                      <Image className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-xs text-foreground truncate font-mono">{thumbnailFile.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        ({(thumbnailFile.size / 1024).toFixed(0)} KB)
                      </span>
                      <button onClick={clearThumbnailFile} className="ml-auto text-muted-foreground hover:text-red-400 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={handleThumbnailPick}
                  />
                </div>

                {thumbnailError && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                    {thumbnailError}
                  </p>
                )}

                {/* URL fallback */}
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Or paste a URL
                  </p>
                  <input
                    className={inputCls}
                    value={form.thumbnailUrl || ""}
                    onChange={e => {
                      setField("thumbnailUrl", e.target.value);
                      if (e.target.value) clearThumbnailFile();
                    }}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Category" sub="Used for filtering on the Projects page">
                  <select className={inputCls} value={form.category || ""} onChange={e => setField("category", e.target.value)}>
                    <option value="">— No Category —</option>
                    <option value="gripper">Gripper</option>
                    <option value="3d">3D Design</option>
                    <option value="simatic">Simatic</option>
                  </select>
                </Field>
              </div>

              {/* Status + Language + Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Status">
                  <select className={inputCls} value={form.status} onChange={e => setField("status", e.target.value as ProjectStatus)}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="Code Language">
                  <select className={inputCls} value={form.language} onChange={e => setField("language", e.target.value)}>
                    {LANG_OPTIONS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                  </select>
                </Field>
                <Field label="GitHub URL">
                  <input className={inputCls} value={form.githubUrl} onChange={e => setField("githubUrl", e.target.value)} placeholder="https://github.com/..." />
                </Field>
                <Field label="Live / Demo URL">
                  <input className={inputCls} value={form.liveUrl} onChange={e => setField("liveUrl", e.target.value)} placeholder="https://..." />
                </Field>
              </div>

              {/* Tags */}
              <Field label="Tags" sub="Press Enter or comma to add a tag">
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 border border-border rounded-lg min-h-[48px]">
                  {form.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs font-mono bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded">
                      {tag}
                      <button onClick={() => setField("tags", form.tags.filter(t => t !== tag))}>
                        <X className="w-3 h-3 hover:text-red-400 transition-colors" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTag}
                    placeholder="Add tag..."
                    className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50 flex-1 min-w-24"
                  />
                </div>
              </Field>

              <BilingualField
                label="Overview"
                enValue={form.overview}
                arValue={form.overviewAr}
                onEnChange={v => setField("overview", v)}
                onArChange={v => setField("overviewAr", v)}
                multiline
                rows={5}
                enPlaceholder="Detailed project overview…"
                arPlaceholder="نظرة عامة مفصلة…"
              />

              <BilingualField
                label="Problem"
                enValue={form.problem}
                arValue={form.problemAr}
                onEnChange={v => setField("problem", v)}
                onArChange={v => setField("problemAr", v)}
                multiline
                rows={4}
                enPlaceholder="What problem does this solve?"
                arPlaceholder="ما المشكلة التي يحلها؟"
              />

              <BilingualField
                label="Solution"
                enValue={form.solution}
                arValue={form.solutionAr}
                onEnChange={v => setField("solution", v)}
                onArChange={v => setField("solutionAr", v)}
                multiline
                rows={4}
                enPlaceholder="How was it solved?"
                arPlaceholder="كيف تم حلها؟"
              />

              {/* Code snippet */}
              <Field label="Code Snippet">
                <div className="relative">
                  <div className="absolute top-2.5 right-3 flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground uppercase">{form.language}</span>
                  </div>
                  <textarea
                    className={`${textareaCls} font-mono text-xs`}
                    rows={10}
                    value={form.codeSnippet}
                    onChange={e => setField("codeSnippet", e.target.value)}
                    placeholder="// Paste your code snippet here..."
                  />
                </div>
              </Field>
            </motion.div>
          )}

          {/* ── FILES TAB ── */}
          {tab === "files" && (
            <motion.div key="files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Project Files</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Gerbers, schematics, 3D models, and source code</p>
                </div>
                {mode === "edit" && (
                  <button
                    onClick={() => setAddFileOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add File
                  </button>
                )}
              </div>

              {mode === "create" && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Save the project first, then you can add files from the Files tab.</span>
                </div>
              )}

              {/* File type guide */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.keys(FILE_TYPE_LABEL) as FileType[]).map(type => {
                  const Icon = FILE_TYPE_ICON[type];
                  const count = currentProject?.files.filter(f => f.type === type).length || 0;
                  return (
                    <div key={type} className={`p-3 rounded-lg border transition-all ${count > 0 ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${count > 0 ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${count > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{count}</span>
                      </div>
                      <p className={`text-xs font-medium ${count > 0 ? "text-foreground" : "text-muted-foreground"}`}>{FILE_TYPE_LABEL[type]}</p>
                    </div>
                  );
                })}
              </div>

              {/* Files list */}
              {currentProject && currentProject.files.length > 0 ? (
                <div className="space-y-2">
                  {currentProject.files.map(f => {
                    const Icon = FILE_TYPE_ICON[f.type];
                    return (
                      <div key={f.id} className="flex items-center gap-3 bg-card border border-card-border rounded-xl p-4 group">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground capitalize">{f.type}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-xs font-mono text-muted-foreground">{f.size}</span>
                          </div>
                          {f.description && <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>}
                        </div>
                        <button
                          onClick={() => projectId && removeFile(projectId, f.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : mode === "edit" ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  <Upload className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No files yet. Add your first file.</p>
                </div>
              ) : null}

              {/* Add file dialog */}
              <AnimatePresence>
                {addFileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  >
                    <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">Add File</h3>
                        <button onClick={() => setAddFileOpen(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <Field label="File Type">
                        <select className={inputCls} value={fileForm.type} onChange={e => setFileForm(f => ({ ...f, type: e.target.value as FileType }))}>
                          {(Object.keys(FILE_TYPE_LABEL) as FileType[]).map(t => (
                            <option key={t} value={t}>{FILE_TYPE_LABEL[t]}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Upload File">
                        <div
                          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {fileForm.name ? (
                            <p className="text-sm font-medium text-primary">{fileForm.name}</p>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                              <p className="text-xs text-muted-foreground/50 mt-1">ZIP, PDF, STEP, IGES up to 100MB</p>
                            </>
                          )}
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                      </Field>

                      <Field label="Name (overrides filename)">
                        <input className={inputCls} value={fileForm.name} onChange={e => setFileForm(f => ({ ...f, name: e.target.value }))} placeholder="neural-pcb-gerbers-v1.2.zip" />
                      </Field>

                      <Field label="Description">
                        <input className={inputCls} value={fileForm.description} onChange={e => setFileForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this file..." />
                      </Field>

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setAddFileOpen(false)} className="flex-1 border border-border rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                        <button onClick={submitFile} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-semibold hover:bg-primary/90 transition-all">Add File</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── MEDIA TAB ── */}
          {tab === "media" && (
            <motion.div key="media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Media Gallery</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Images and video embeds for the project gallery</p>
              </div>

              {mode === "create" && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Save the project first, then you can add media from this tab.</span>
                </div>
              )}

              {mode === "edit" && (
                <div className="bg-card border border-card-border rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Add Media</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAddMediaType("image")}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${addMediaType === "image" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-border/80"}`}
                    >
                      <Image className="w-4 h-4" /> Image URL
                    </button>
                    <button
                      onClick={() => setAddMediaType("video")}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${addMediaType === "video" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-border/80"}`}
                    >
                      <Film className="w-4 h-4" /> Video Embed
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className={`${inputCls} flex-1`}
                      value={addMediaUrl}
                      onChange={e => setAddMediaUrl(e.target.value)}
                      placeholder={addMediaType === "image" ? "https://... (image URL)" : "https://youtube.com/embed/... or similar"}
                    />
                    <button onClick={submitMedia} className="bg-primary text-primary-foreground px-4 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">Add</button>
                  </div>
                  <input
                    className={inputCls}
                    value={addMediaCaption}
                    onChange={e => setAddMediaCaption(e.target.value)}
                    placeholder="Caption (optional)"
                  />
                </div>
              )}

              {/* Media grid */}
              {currentProject && currentProject.media.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentProject.media.map(m => (
                    <div key={m.id} className="group relative rounded-xl overflow-hidden border border-card-border bg-card aspect-video">
                      {m.type === "image" ? (
                        <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Film className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                        <button
                          onClick={() => projectId && removeMedia(projectId, m.id)}
                          className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {m.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-3 py-2">
                          <p className="text-xs text-white/80 truncate">{m.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : mode === "edit" ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  <Image className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No media yet. Add images or videos above.</p>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* ── UPDATES TAB ── */}
          {tab === "updates" && (
            <motion.div key="updates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Progress Updates</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Version log and milestone entries shown on the public project page</p>
                </div>
                {mode === "edit" && (
                  <button
                    onClick={() => setAddUpdateOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Update
                  </button>
                )}
              </div>

              {mode === "create" && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Save the project first, then add updates from this tab.</span>
                </div>
              )}

              {/* Updates timeline */}
              {currentProject && currentProject.updates.length > 0 ? (
                <div className="space-y-3 relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                  {[...currentProject.updates].reverse().map(u => (
                    <div key={u.id} className="flex gap-3 items-start group">
                      <div className={`w-3.5 h-3.5 rounded-full shrink-0 mt-1.5 border-2 border-background ${
                        u.type === "release" ? "bg-chart-2" :
                        u.type === "feature" ? "bg-primary" :
                        u.type === "fix" ? "bg-chart-3" :
                        u.type === "design" ? "bg-chart-5" :
                        "bg-muted-foreground"
                      }`} />
                      <div className="flex-1 bg-card border border-card-border rounded-xl p-4 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-foreground">{u.title}</span>
                              {u.version && <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{u.version}</span>}
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded border capitalize ${UPDATE_TYPE_COLOR[u.type]}`}>{u.type}</span>
                              {u.adminOnly && <span className="text-xs flex items-center gap-1 text-muted-foreground"><Lock className="w-3 h-3" />Admin</span>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{u.date}</p>
                          </div>
                          <button
                            onClick={() => projectId && removeUpdate(projectId, u.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {u.desc && <p className="text-xs text-muted-foreground mt-2">{u.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : mode === "edit" ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  <Calendar className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No updates yet. Add the first milestone.</p>
                </div>
              ) : null}

              {/* Add update dialog */}
              <AnimatePresence>
                {addUpdateOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  >
                    <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">Add Update</h3>
                        <button onClick={() => setAddUpdateOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Date">
                          <input type="date" className={inputCls} value={updateForm.date} onChange={e => setUpdateForm(f => ({ ...f, date: e.target.value }))} />
                        </Field>
                        <Field label="Version">
                          <input className={inputCls} value={updateForm.version} onChange={e => setUpdateForm(f => ({ ...f, version: e.target.value }))} placeholder="v1.0.0" />
                        </Field>
                      </div>

                      <Field label="Type">
                        <div className="flex flex-wrap gap-2">
                          {UPDATE_TYPES.map(t => (
                            <button
                              key={t}
                              onClick={() => setUpdateForm(f => ({ ...f, type: t }))}
                              className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border capitalize transition-all ${updateForm.type === t ? UPDATE_TYPE_COLOR[t] : "border-border text-muted-foreground hover:border-border/80"}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </Field>

                      <div className="space-y-4">
                        <BilingualField
                          label="Title"
                          enValue={updateForm.title}
                          arValue={updateForm.titleAr}
                          onEnChange={v => setUpdateForm(f => ({ ...f, title: v }))}
                          onArChange={v => setUpdateForm(f => ({ ...f, titleAr: v }))}
                          enPlaceholder="Power Optimization"
                          arPlaceholder="تحسين الطاقة"
                        />
                        <BilingualField
                          label="Description"
                          enValue={updateForm.desc}
                          arValue={updateForm.descAr}
                          onEnChange={v => setUpdateForm(f => ({ ...f, desc: v }))}
                          onArChange={v => setUpdateForm(f => ({ ...f, descAr: v }))}
                          multiline
                          rows={2}
                          enPlaceholder="What changed?"
                          arPlaceholder="ماذا تغير؟"
                        />
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setUpdateForm(f => ({ ...f, adminOnly: !f.adminOnly }))}
                          className={`w-9 h-5 rounded-full transition-colors ${updateForm.adminOnly ? "bg-primary" : "bg-muted"} relative`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${updateForm.adminOnly ? "left-4" : "left-0.5"}`} />
                        </div>
                        <span className="text-sm text-foreground">Admin-only (hidden from public)</span>
                      </label>

                      <div className="flex gap-3">
                        <button onClick={() => setAddUpdateOpen(false)} className="flex-1 border border-border rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                        <button onClick={submitUpdate} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-semibold hover:bg-primary/90">Add Update</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === "history" && currentProject && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Version History</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{currentProject.commits.length} commits · Git-style change log</p>
              </div>

              {/* Branch line + commits */}
              <div className="font-mono text-xs space-y-0 bg-card border border-card-border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                  <GitCommit className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-semibold">main</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{currentProject.commits.length} commits</span>
                </div>

                <div className="divide-y divide-border/50">
                  {[...currentProject.commits].reverse().map((c, i) => (
                    <div key={c.hash} className="flex items-start gap-4 px-4 py-3 hover:bg-muted/20 transition-colors group">
                      {/* Graph line */}
                      <div className="flex flex-col items-center gap-0 pt-1 shrink-0">
                        <div className={`w-3 h-3 rounded-full ${COMMIT_TYPE_COLOR[c.type]?.split(" ")[0] || "bg-primary"}`} />
                        {i < currentProject.commits.length - 1 && (
                          <div className="w-px h-8 bg-border mt-1" />
                        )}
                      </div>

                      {/* Commit info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-foreground font-medium">{c.message}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${COMMIT_TYPE_COLOR[c.type] || "bg-primary text-primary-foreground"}`}>
                            {c.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                          <span className="text-primary">{c.hash}</span>
                          <span>·</span>
                          <span>{new Date(c.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                          <span>·</span>
                          <span className="text-muted-foreground/60">{new Date(c.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {c.fields.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {c.fields.map(f => (
                              <span key={f} className="text-[10px] bg-muted/50 border border-border/50 text-muted-foreground px-1.5 py-0.5 rounded">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
