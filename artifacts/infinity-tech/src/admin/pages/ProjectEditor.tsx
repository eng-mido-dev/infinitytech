import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/admin/data/store";
import { motion, AnimatePresence } from "framer-motion";
import type {
  AdminProject, ProjectStatus, FileType, UpdateType, ProjectFile, ProjectUpdate, CustomSection,
} from "@/admin/data/types";
import {
  ArrowLeft, Save, Plus, Trash2, Upload, FileText, Image,
  GitCommit, Calendar, Lock, X,
  CheckCircle2, AlertCircle, FolderArchive, FileCode,
  Box, Film, ImagePlus, Loader2, ExternalLink, Layers,
  GripVertical, ChevronDown, ChevronUp,
} from "lucide-react";
import { Link } from "wouter";
import BilingualField from "@/admin/components/BilingualField";
import CustomSelect from "@/admin/components/CustomSelect";

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

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active",    label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived",  label: "Archived" },
];
const UPDATE_TYPES: UpdateType[] = ["release", "feature", "fix", "design", "test", "note"];
const LANG_OPTIONS: { value: string; label: string }[] = [
  { value: "c",          label: "C" },
  { value: "cpp",        label: "C++" },
  { value: "python",     label: "Python" },
  { value: "typescript", label: "TypeScript" },
  { value: "rust",       label: "Rust" },
  { value: "vhdl",       label: "VHDL" },
  { value: "assembly",   label: "Assembly" },
  { value: "other",      label: "Other" },
];

type FormData = Omit<AdminProject, "id" | "createdAt" | "updatedAt" | "commits" | "views" | "downloads">;

const EMPTY_PROJECT: FormData = {
  title: "", titleAr: "",
  description: "", descriptionAr: "",
  overview: "", overviewAr: "",
  tags: [], status: "active",
  language: "c", githubUrl: "",
  liveUrl: "", category: "",
  thumbnailUrl: "",
  videoUrl: "",
  customSections: [],
  timeline: [], files: [], media: [], updates: [],
};

interface ProjectEditorProps {
  mode: "create" | "edit";
  projectId?: string;
}

type Tab = "content" | "files" | "media" | "updates" | "history";

function TabButton({ label, active, onClick, badge }: {
  label: string; active: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
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

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function SectionCard({
  section,
  onUpdate,
  onRemove,
}: {
  section: CustomSection;
  onUpdate: (s: CustomSection) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="border border-border rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
        <input
          className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-foreground placeholder:text-muted-foreground/40"
          value={section.titleEn}
          onChange={e => onUpdate({ ...section, titleEn: e.target.value })}
          placeholder="Section title (e.g. Technical Details)"
        />
        <input
          className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-foreground placeholder:text-muted-foreground/40 text-right"
          value={section.titleAr}
          onChange={e => onUpdate({ ...section, titleAr: e.target.value })}
          placeholder="عنوان القسم"
          dir="rtl"
        />
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
              <div>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1.5">Content (EN)</p>
                <textarea
                  className={textareaCls}
                  rows={5}
                  value={section.contentEn}
                  onChange={e => onUpdate({ ...section, contentEn: e.target.value })}
                  placeholder="Write section content in English…"
                  dir="ltr"
                />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1.5 text-right">المحتوى (AR)</p>
                <textarea
                  className={`${textareaCls} text-right`}
                  rows={5}
                  value={section.contentAr}
                  onChange={e => onUpdate({ ...section, contentAr: e.target.value })}
                  placeholder="اكتب محتوى القسم بالعربية…"
                  dir="rtl"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProjectEditor({ mode, projectId }: ProjectEditorProps) {
  const [, navigate] = useLocation();
  const {
    getProject, createProject, updateProject,
    addFile, removeFile, addMedia, removeMedia,
    addUpdate, removeUpdate, saving, error: storeError,
  } = useStore();

  const existing = projectId ? getProject(projectId) : null;

  function toFormData(p: AdminProject): FormData {
    return {
      title: p.title, titleAr: p.titleAr,
      description: p.description, descriptionAr: p.descriptionAr,
      overview: p.overview, overviewAr: p.overviewAr,
      tags: p.tags, status: p.status,
      language: p.language, githubUrl: p.githubUrl,
      liveUrl: p.liveUrl ?? "", category: p.category ?? "",
      thumbnailUrl: p.thumbnailUrl ?? "",
      videoUrl: p.videoUrl ?? "",
      customSections: p.customSections ?? [],
      timeline: p.timeline, files: p.files, media: p.media, updates: p.updates,
    };
  }

  const [form, setForm] = useState<FormData>(existing ? toFormData(existing) : EMPTY_PROJECT);
  const [tab, setTab] = useState<Tab>("content");
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [commitMsg, setCommitMsg] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoLocalUrl, setVideoLocalUrl] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const currentProject = projectId ? getProject(projectId) : null;

  function setField<K extends keyof FormData>(key: K, val: FormData[K]) {
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
    setThumbnailUploadProgress(0);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  }

  async function uploadToCloudinary(
    file: File,
    resourceType: "image" | "video" | "raw",
    folder: string,
    onProgress?: (pct: number) => void,
  ): Promise<string> {
    const pin = localStorage.getItem("it-admin-pin") || "admin2024";

    // 1. Get a fresh signature from the server
    const sigRes = await fetch("/api/projects/asset-upload-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ resourceType, folder }),
    });
    if (!sigRes.ok) {
      const body = await sigRes.json().catch(() => ({}));
      throw new Error((body as any).error ?? "Failed to get upload signature");
    }
    const sig = await sigRes.json();

    // 2. Build FormData — params must exactly match what was signed (folder + timestamp only)
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.apiKey);
    fd.append("timestamp", String(sig.timestamp));
    fd.append("signature", sig.signature);
    fd.append("folder", sig.folder);   // must match signed folder exactly

    // 3. Upload via XHR so we can track progress
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`,
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText) as { secure_url: string };
          let url = data.secure_url;
          // Inject auto optimisation transforms
          if (resourceType === "image" && url.includes("cloudinary.com")) {
            url = url.replace("/upload/", "/upload/f_auto,q_auto/");
          } else if (resourceType === "video" && url.includes("cloudinary.com")) {
            url = url.replace("/upload/", "/upload/f_auto,q_auto/");
          }
          resolve(url);
        } else {
          let msg = "Upload failed";
          try {
            const err = JSON.parse(xhr.responseText);
            msg = err?.error?.message ?? msg;
          } catch {}
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.ontimeout = () => reject(new Error("Upload timed out"));
      xhr.send(fd);
    });
  }

  async function uploadThumbnail(file: File): Promise<string> {
    return uploadToCloudinary(file, "image", "infinity-tech", (pct) => setThumbnailUploadProgress(pct));
  }

  function handleVideoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoLocalUrl) URL.revokeObjectURL(videoLocalUrl);
    setVideoFile(file);
    setVideoLocalUrl(URL.createObjectURL(file));
    setVideoError(null);
    setVideoUploadProgress(0);
  }

  function clearVideo() {
    setField("videoUrl", "");
    setVideoFile(null);
    if (videoLocalUrl) URL.revokeObjectURL(videoLocalUrl);
    setVideoLocalUrl(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
    setVideoError(null);
    setVideoUploadProgress(0);
  }

  async function handleVideoUpload() {
    if (!videoFile) return;
    setVideoUploading(true);
    setVideoError(null);
    setVideoUploadProgress(0);
    try {
      const url = await uploadToCloudinary(
        videoFile,
        "video",
        "infinity-tech/videos",
        (pct) => setVideoUploadProgress(pct),
      );
      setField("videoUrl", url);
      if (videoLocalUrl) URL.revokeObjectURL(videoLocalUrl);
      setVideoFile(null);
      setVideoLocalUrl(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
      setVideoUploadProgress(100);
    } catch (err: any) {
      setVideoError(err.message ?? "Upload failed");
    } finally {
      setVideoUploading(false);
    }
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
        setThumbnailError(err.message ?? "Image upload failed");
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
    setUpdateForm({
      date: new Date().toISOString().split("T")[0],
      version: "", title: "", titleAr: "", desc: "", descAr: "",
      type: "feature", adminOnly: false,
    });
  }

  function addSection() {
    const newSection: CustomSection = {
      id: genId(), titleEn: "", titleAr: "", contentEn: "", contentAr: "",
    };
    setField("customSections", [...form.customSections, newSection]);
  }

  function updateSection(id: string, updated: CustomSection) {
    setField("customSections", form.customSections.map(s => s.id === id ? updated : s));
  }

  function removeSection(id: string) {
    setField("customSections", form.customSections.filter(s => s.id !== id));
  }

  return (
    <div className="min-h-screen">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 border-b border-border px-6 py-3 flex items-center gap-4"
        style={{ background: "rgba(10,16,25,0.92)", backdropFilter: "blur(16px)" }}
      >
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
            className="text-xs bg-muted/40 border border-border rounded-md px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 w-52 font-mono"
          />
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            saved
              ? "bg-emerald-500 text-white"
              : saveError
              ? "bg-red-500/80 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
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
        <div className="px-6 pt-3">
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {saveError}
          </p>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="border-b border-border px-6 flex gap-0 overflow-x-auto scrollbar-none">
        <TabButton label="Content"  active={tab === "content"}  onClick={() => setTab("content")} />
        <TabButton label="Files"    active={tab === "files"}    onClick={() => setTab("files")}   badge={currentProject?.files.length} />
        <TabButton label="Media"    active={tab === "media"}    onClick={() => setTab("media")}   badge={currentProject?.media.length} />
        <TabButton label="Updates"  active={tab === "updates"}  onClick={() => setTab("updates")} badge={currentProject?.updates.length} />
        {mode === "edit" && (
          <TabButton label="History" active={tab === "history"} onClick={() => setTab("history")} badge={currentProject?.commits.length} />
        )}
      </div>

      {/* ── Tab content ── */}
      <div className="p-6 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ── CONTENT TAB ── */}
          {tab === "content" && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-7">

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
                multiline rows={3}
                enPlaceholder="Brief project description…"
                arPlaceholder="وصف مختصر للمشروع…"
              />

              {/* ── Cover Image ── */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Cover Image
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload an image or paste a URL. Displayed at 16:9 ratio without distortion.
                </p>

                {/* 16:9 preview */}
                <div
                  className="relative w-full rounded-xl overflow-hidden border border-border bg-muted/20 flex items-center justify-center mb-3"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  {(thumbnailPreview || form.thumbnailUrl) ? (
                    <>
                      <img
                        src={thumbnailPreview || form.thumbnailUrl || ""}
                        alt="Thumbnail preview"
                        className="absolute inset-0 w-full h-full"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {thumbnailPreview && (
                        <div className="absolute bottom-3 left-3">
                          <span className="text-[10px] font-mono font-bold text-white bg-amber-500/80 px-2 py-0.5 rounded">
                            PENDING UPLOAD
                          </span>
                        </div>
                      )}
                      {form.thumbnailUrl && !thumbnailPreview && (
                        <div className="absolute bottom-3 left-3">
                          <span className="text-[10px] font-mono text-white/60 bg-black/50 px-2 py-0.5 rounded">
                            16:9 · object-fit: cover
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={thumbnailPreview ? clearThumbnailFile : () => setField("thumbnailUrl", "")}
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500/80 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {form.thumbnailUrl && !thumbnailPreview && (
                        <a
                          href={form.thumbnailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-primary/80 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/40 select-none pointer-events-none">
                      <ImagePlus className="w-12 h-12" />
                      <span className="text-xs">No image — 16:9 preview</span>
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={thumbnailUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {thumbnailUploading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                      : <><Upload className="w-4 h-4" /> Choose Image</>
                    }
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

                {thumbnailUploading && (
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading image…
                      </span>
                      <span className="font-mono text-primary">{thumbnailUploadProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200 rounded-full"
                        style={{ width: `${thumbnailUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {thumbnailError && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {thumbnailError}
                  </p>
                )}

                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Or paste a URL</p>
                  <input
                    className={inputCls}
                    value={form.thumbnailUrl || ""}
                    onChange={e => { setField("thumbnailUrl", e.target.value); if (e.target.value) clearThumbnailFile(); }}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {/* ── Status + Language + Links ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Status">
                  <CustomSelect
                    value={form.status}
                    onChange={v => setField("status", v as ProjectStatus)}
                    options={STATUS_OPTIONS}
                  />
                </Field>
                <Field label="Code Language">
                  <CustomSelect
                    value={form.language}
                    onChange={v => setField("language", v)}
                    options={LANG_OPTIONS}
                  />
                </Field>
                <Field label="GitHub URL">
                  <input className={inputCls} value={form.githubUrl} onChange={e => setField("githubUrl", e.target.value)} placeholder="https://github.com/..." />
                </Field>
                <Field label="Live / Demo URL">
                  <input className={inputCls} value={form.liveUrl ?? ""} onChange={e => setField("liveUrl", e.target.value)} placeholder="https://..." />
                </Field>
              </div>

              {/* ── Tags ── */}
              <Field label="Tags" sub="Press Enter or comma to add a tag">
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 border border-border rounded-lg min-h-[48px] focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-all">
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
                    placeholder={form.tags.length === 0 ? "Add tag…" : ""}
                    className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50 flex-1 min-w-24"
                  />
                </div>
              </Field>

              {/* ── Overview ── */}
              <BilingualField
                label="Overview"
                enValue={form.overview}
                arValue={form.overviewAr}
                onEnChange={v => setField("overview", v)}
                onArChange={v => setField("overviewAr", v)}
                multiline rows={5}
                enPlaceholder="Detailed project overview…"
                arPlaceholder="نظرة عامة مفصلة…"
              />

              {/* ── Custom Sections ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Custom Sections
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Define your own bilingual content blocks — e.g. "Technical Details", "Process", "Results"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSection}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Section
                  </button>
                </div>

                {form.customSections.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-border text-muted-foreground/50 cursor-pointer hover:border-primary/30 hover:text-muted-foreground transition-all"
                    onClick={addSection}
                  >
                    <Layers className="w-8 h-8" />
                    <div className="text-center">
                      <p className="text-sm font-medium">No custom sections yet</p>
                      <p className="text-xs mt-0.5">Click to add a section with a custom title and bilingual content</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {form.customSections.map(section => (
                        <SectionCard
                          key={section.id}
                          section={section}
                          onUpdate={updated => updateSection(section.id, updated)}
                          onRemove={() => removeSection(section.id)}
                        />
                      ))}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={addSection}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border text-muted-foreground/60 hover:border-primary/30 hover:text-primary text-xs font-medium transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add another section
                    </button>
                  </div>
                )}
              </div>

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

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.keys(FILE_TYPE_LABEL) as FileType[]).map(type => {
                  const Icon = FILE_TYPE_ICON[type];
                  const count = currentProject?.files.filter(f => f.type === type).length || 0;
                  return (
                    <div key={type} className={`p-3 rounded-xl border transition-all ${count > 0 ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${count > 0 ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${count > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{count}</span>
                      </div>
                      <p className={`text-xs font-medium ${count > 0 ? "text-foreground" : "text-muted-foreground"}`}>{FILE_TYPE_LABEL[type]}</p>
                    </div>
                  );
                })}
              </div>

              {currentProject && currentProject.files.length > 0 ? (
                <div className="space-y-2">
                  {currentProject.files.map(f => {
                    const Icon = FILE_TYPE_ICON[f.type];
                    return (
                      <div key={f.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 group hover:border-primary/20 transition-all">
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
                <div className="text-center py-14 text-muted-foreground border border-dashed border-border rounded-xl">
                  <Upload className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No files yet. Add your first file.</p>
                </div>
              ) : null}

              {/* Add file dialog */}
              <AnimatePresence>
                {addFileOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ scale: 0.95, y: 8 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95 }}
                      className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">Add File</h3>
                        <button onClick={() => setAddFileOpen(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <Field label="File Type">
                        <CustomSelect
                          value={fileForm.type}
                          onChange={v => setFileForm(f => ({ ...f, type: v as FileType }))}
                          options={(Object.keys(FILE_TYPE_LABEL) as FileType[]).map(t => ({ value: t, label: FILE_TYPE_LABEL[t] }))}
                        />
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
                        <input className={inputCls} value={fileForm.description} onChange={e => setFileForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" />
                      </Field>

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setAddFileOpen(false)} className="flex-1 border border-border rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                        <button onClick={submitFile} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-semibold hover:bg-primary/90 transition-all">Add File</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── MEDIA TAB ── */}
          {tab === "media" && (
            <motion.div key="media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

              {/* ── Hero Video ── */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Film className="w-4 h-4 text-primary" /> Hero Video
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Full-quality project video shown in the header. Delivered via Cloudinary (f_auto, q_auto).</p>
                  </div>
                </div>

                {/* Video preview — local staged file */}
                {videoLocalUrl && (
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-muted-foreground">Preview (not uploaded yet)</p>
                    <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-black" style={{ aspectRatio: "16/9" }}>
                      <video
                        src={videoLocalUrl}
                        controls
                        playsInline
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-amber-400 font-mono">{videoFile?.name} — {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB` : ""}</p>
                  </div>
                )}

                {/* Video preview — already uploaded (form.videoUrl) */}
                {form.videoUrl && !videoLocalUrl && (
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-muted-foreground">Current video (saved)</p>
                    <div className="relative rounded-xl overflow-hidden border border-border bg-black" style={{ aspectRatio: "16/9" }}>
                      <video
                        src={form.videoUrl}
                        controls
                        playsInline
                        poster={form.thumbnailUrl || undefined}
                        className="absolute inset-0 w-full h-full object-contain"
                        preload="metadata"
                      />
                    </div>
                    <p className="text-[11px] text-primary/60 font-mono truncate">{form.videoUrl}</p>
                  </div>
                )}

                {/* Upload progress bar */}
                {videoUploading && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-foreground font-medium">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        Uploading to Cloudinary…
                      </span>
                      <span className="font-mono font-bold text-primary text-base">{videoUploadProgress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 rounded-full"
                        style={{ width: `${videoUploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB · ` : ""}
                      Large files may take a few minutes — keep this tab open.
                    </p>
                  </div>
                )}

                {videoError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {videoError}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                    className="hidden"
                    onChange={handleVideoPick}
                  />
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    disabled={videoUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:border-primary/40 transition-all disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {videoFile ? "Change File" : "Choose Video"}
                  </button>

                  {videoFile && !videoUploading && (
                    <button
                      onClick={handleVideoUpload}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
                    >
                      <Upload className="w-4 h-4" /> Upload to Cloudinary
                    </button>
                  )}

                  {(form.videoUrl || videoFile) && !videoUploading && (
                    <button
                      onClick={clearVideo}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-all"
                    >
                      <X className="w-4 h-4" /> Remove Video
                    </button>
                  )}

                  {form.videoUrl && !videoFile && (
                    <a
                      href={form.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" /> Open URL
                    </a>
                  )}
                </div>
              </div>

              {/* ── Media Gallery ── */}
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
                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
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
                      placeholder={addMediaType === "image" ? "https://... (image URL)" : "https://youtube.com/embed/..."}
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

              {currentProject && currentProject.media.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentProject.media.map(m => (
                    <div key={m.id} className="group relative rounded-xl overflow-hidden border border-border bg-card"
                      style={{ aspectRatio: "16/9" }}
                    >
                      {m.type === "image" ? (
                        <img src={m.url} alt={m.caption} className="w-full h-full" style={{ objectFit: "cover" }} />
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
                <div className="text-center py-14 text-muted-foreground border border-dashed border-border rounded-xl">
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

              {currentProject && currentProject.updates.length > 0 ? (
                <div className="space-y-3 relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                  {[...currentProject.updates].reverse().map(u => (
                    <div key={u.id} className="flex gap-3 items-start group">
                      <div className={`w-3.5 h-3.5 rounded-full shrink-0 mt-1.5 border-2 border-background ${
                        u.type === "release" ? "bg-chart-2" :
                        u.type === "feature" ? "bg-primary" :
                        u.type === "fix" ? "bg-chart-3" :
                        u.type === "design" ? "bg-chart-5" : "bg-muted-foreground"
                      }`} />
                      <div className="flex-1 bg-card border border-border rounded-xl p-4 min-w-0 hover:border-primary/20 transition-all">
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
                <div className="text-center py-14 text-muted-foreground border border-dashed border-border rounded-xl">
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
                    <motion.div
                      initial={{ scale: 0.95, y: 8 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95 }}
                      className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4"
                    >
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
                          multiline rows={2}
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
                    </motion.div>
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

              <div className="font-mono text-xs space-y-0 bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                  <GitCommit className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-semibold">main</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{currentProject.commits.length} commits</span>
                </div>
                {[...currentProject.commits].reverse().map((c, i) => (
                  <div
                    key={c.hash}
                    className={`flex items-start gap-4 px-4 py-3 group hover:bg-muted/10 transition-colors ${i < currentProject.commits.length - 1 ? "border-b border-border/40" : ""}`}
                  >
                    <span className={`shrink-0 mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${COMMIT_TYPE_COLOR[c.type] ?? "bg-muted text-muted-foreground"}`}>
                      {c.type.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-foreground/90 group-hover:text-foreground transition-colors break-all">{c.message}</span>
                      {c.fields.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.fields.map(f => (
                            <span key={f} className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border/50">{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-3 text-muted-foreground">
                      <span className="text-primary/80">{c.hash}</span>
                      <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {currentProject.commits.length === 0 && (
                  <div className="px-4 py-8 text-center text-muted-foreground/50">
                    <p>No commits yet. Save the project to create the first commit.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
