import { Router } from "express";
import { db, projects, projectStats, pool } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getUploadSignature } from "../lib/cloudinary";
import { autoTranslateFields } from "../lib/translate";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  const pin = req.headers["x-admin-pin"];
  const validPin = process.env.ADMIN_PIN || "admin2024";
  if (!pin || pin !== validPin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * Verify the projects table exists and is writable before attempting an INSERT.
 * Uses a raw SQL query against information_schema so the check is independent
 * of Drizzle's connection state.
 */
async function checkTable(): Promise<void> {
  const client = await pool.connect();
  try {
    const result = await client.query<{ column_name: string }>(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'projects'
      ORDER BY ordinal_position
    `);

    if (result.rowCount === 0) {
      throw new Error("projects table does not exist — run initDatabase() first");
    }

    const cols = result.rows.map(r => r.column_name);
    console.log(`[checkTable] ✓ projects table ready — ${result.rowCount} columns: ${cols.join(", ")}`);
  } catch (err) {
    console.error("[checkTable] ✗ Table check failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

const ALLOWED_WRITE_FIELDS = new Set([
  "title_en", "title_ar", "description_en", "description_ar",
  "overview_en", "overview_ar", "thumbnail_url", "video_url",
  "assets_zip_url", "model_3d_url", "bom_url",
  "tags", "status", "github_url", "language",
  "timeline", "files", "media", "updates",
  "category", "live_link", "custom_sections",
]);

function sanitizeBody(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const key of ALLOWED_WRITE_FIELDS) {
    if (key in body) out[key] = body[key];
  }
  return out;
}

// GET /api/projects — public
router.get("/projects", async (_req, res) => {
  try {
    const rows = await db.select().from(projects).orderBy(desc(projects.created_at));
    res.json({ projects: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id — public; includes live view/download counts
router.get("/projects/:id", async (req, res) => {
  try {
    const [[row], [stats]] = await Promise.all([
      db.select().from(projects).where(eq(projects.id, req.params.id)),
      db.select().from(projectStats).where(eq(projectStats.projectId, req.params.id)),
    ]);
    if (!row) return res.status(404).json({ error: "Project not found" });

    res.json({
      project: {
        ...row,
        analytics: {
          views:     stats?.viewsCount     ?? 0,
          downloads: stats?.downloadsCount ?? 0,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects — admin only
router.post("/projects", requireAdmin, async (req, res) => {
  // ── STEP A ── diagnostic marker visible in every log stream ─────────────────
  console.log("--- ATTEMPTING SAVE ---", req.body);

  try {
    // ── Table readiness check ──────────────────────────────────────────────────
    await checkTable();

    let body = sanitizeBody(req.body) as any;

    if (!body.title_en && !body.title_ar) {
      console.warn("[POST /projects] ✗ Rejected — title_en and title_ar are both empty");
      return res.status(400).json({ error: "title_en or title_ar is required" });
    }

    // ── Log all media URLs so we can confirm they arrived ─────────────────────
    console.log("[POST /projects] ▶ Media URLs received:", {
      thumbnail_url:  body.thumbnail_url  ?? "(none)",
      video_url:      body.video_url      ?? "(none)",
      assets_zip_url: body.assets_zip_url ?? "(none)",
      model_3d_url:   body.model_3d_url   ?? "(none)",
      bom_url:        body.bom_url        ?? "(none)",
    });

    // ── Auto-translate missing bilingual fields ────────────────────────────────
    console.log("[POST /projects] ▶ Running auto-translate…");
    body = await autoTranslateFields(body);
    console.log("[POST /projects] ✓ Auto-translate done");

    // ── Build DB payload ──────────────────────────────────────────────────────
    // JSONB field (custom_sections) must be a valid JSON value — never undefined.
    // Default to an empty object {} so Postgres accepts it without a type error.
    const payload = {
      ...body,
      tags:            Array.isArray(body.tags) ? body.tags : [],
      status:          body.status ?? "active",
      custom_sections: body.custom_sections ?? {},
      timeline:        body.timeline   ?? null,
      files:           body.files      ?? null,
      media:           body.media      ?? null,
      updates:         body.updates    ?? null,
      // Engineering files — store NULL rather than empty string so queries stay clean
      model_3d_url:    body.model_3d_url  || null,
      bom_url:         body.bom_url       || null,
      thumbnail_url:   body.thumbnail_url || null,
      video_url:       body.video_url     || null,
      assets_zip_url:  body.assets_zip_url || null,
    };

    // ── Equivalent SQL for visibility ─────────────────────────────────────────
    // INSERT INTO projects (title_en, title_ar, thumbnail_url, video_url,
    //   assets_zip_url, custom_sections, tags, status, ...) VALUES (...) RETURNING *;
    console.log("[POST /projects] ▶ INSERT INTO projects …", {
      title_en:             payload.title_en,
      title_ar:             payload.title_ar,
      thumbnail_url:        payload.thumbnail_url,
      video_url:            payload.video_url,
      status:               payload.status,
      tags:                 payload.tags,
      custom_sections_type: Array.isArray(payload.custom_sections) ? "array" : typeof payload.custom_sections,
      custom_sections_len:  Array.isArray(payload.custom_sections) ? payload.custom_sections.length : "(object)",
    });

    const [row] = await db.insert(projects).values(payload).returning();

    if (!row) throw new Error("INSERT returned no row — check DB constraints");

    // ── STEP D — success ──────────────────────────────────────────────────────
    console.log(`[POST /projects] ✓ Project saved — id=${row.id} title="${row.title_en}"`);
    res.status(201).json({ project: row });

  } catch (err: any) {
    // Log the FULL error object so every pg/Drizzle field is visible
    console.error("[POST /projects] ✗ FULL ERROR OBJECT:", err);
    console.error("[POST /projects] ✗ Summary:", {
      message: err.message,
      code:    err.code,
      detail:  err.detail,
      hint:    err.hint,
      where:   err.where,
      stack:   err.stack?.split("\n").slice(0, 8).join("\n"),
    });
    res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

// PUT /api/projects/:id — admin only (full replace)
router.put("/projects/:id", requireAdmin, async (req, res) => {
  try {
    let body = sanitizeBody(req.body) as any;
    if (Object.keys(body).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    body = await autoTranslateFields(body);

    const [row] = await db.update(projects)
      .set({ ...body, updated_at: new Date() })
      .where(eq(projects.id, req.params.id))
      .returning();

    if (!row) return res.status(404).json({ error: "Project not found" });
    console.log(`[DB] PUT project ${req.params.id} — fields: ${Object.keys(body).join(", ")}`);
    res.json({ project: row });
  } catch (err: any) {
    console.error(`[DB] PUT /projects/${req.params.id} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id — admin only
router.patch("/projects/:id", requireAdmin, async (req, res) => {
  const id = req.params.id;
  console.log(`[PATCH /projects/${id}] ▶ Incoming fields:`, Object.keys(req.body));
  console.log(`[PATCH /projects/${id}] ▶ Media URLs:`, {
    thumbnail_url: req.body.thumbnail_url ?? "(unchanged)",
    video_url:     req.body.video_url     ?? "(unchanged)",
    model_3d_url:  req.body.model_3d_url  ?? "(unchanged)",
    bom_url:       req.body.bom_url       ?? "(unchanged)",
  });

  try {
    let body = sanitizeBody(req.body) as any;
    if (Object.keys(body).length === 0) {
      console.warn(`[PATCH /projects/${id}] ✗ No writable fields in body`);
      return res.status(400).json({ error: "No valid fields to update" });
    }

    console.log(`[PATCH /projects/${id}] ▶ Running auto-translate…`);
    body = await autoTranslateFields(body);
    console.log(`[PATCH /projects/${id}] ✓ Translate done`);

    console.log(`[PATCH /projects/${id}] ▶ UPDATE projects SET … — ${Object.keys(body).join(", ")}`);
    const [row] = await db.update(projects)
      .set({ ...body, updated_at: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (!row) {
      console.warn(`[PATCH /projects/${id}] ✗ Project not found`);
      return res.status(404).json({ error: "Project not found" });
    }

    console.log(`[PATCH /projects/${id}] ✓ Updated — id=${row.id}`);
    res.json({ project: row });
  } catch (err: any) {
    console.error(`[PATCH /projects/${id}] ✗ Error:`, {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack?.split("\n").slice(0, 5).join("\n"),
    });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/translate — admin only
router.post("/projects/:id/translate", requireAdmin, async (req, res) => {
  try {
    const [existing] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!existing) return res.status(404).json({ error: "Project not found" });

    const fields = {
      title_en: existing.title_en,
      title_ar: existing.title_ar || "",
      description_en: existing.description_en,
      description_ar: existing.description_ar || "",
      overview_en: existing.overview_en,
      overview_ar: existing.overview_ar || "",
      problem_en: existing.problem_en,
      problem_ar: existing.problem_ar || "",
      solution_en: existing.solution_en,
      solution_ar: existing.solution_ar || "",
    } as any;

    const translated = await autoTranslateFields(fields);

    const [row] = await db.update(projects)
      .set({ ...translated, updated_at: new Date() })
      .where(eq(projects.id, req.params.id))
      .returning();

    res.json({ project: row, translated: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id — admin only
router.delete("/projects/:id", requireAdmin, async (req, res) => {
  // ── MANUAL DELETE — only reachable by clicking "Delete Project" in the admin UI ──
  // This route requires the x-admin-pin header; it is never called automatically.
  console.warn(`[DELETE /projects/${req.params.id}] ⚠  Manual deletion requested — origin: ${req.headers.origin ?? "direct call"}`);
  try {
    const result = await db.delete(projects).where(eq(projects.id, req.params.id)).returning();
    if (result.length === 0) {
      console.warn(`[DELETE /projects/${req.params.id}] ✗ Project not found`);
      return res.status(404).json({ error: "Project not found" });
    }
    console.log(`[DELETE /projects/${req.params.id}] ✓ Project permanently deleted`);
    res.json({ success: true });
  } catch (err: any) {
    console.error(`[DELETE /projects/${req.params.id}] ✗ Error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id/updates — public; returns the updates log array
router.get("/projects/:id/updates", async (req, res) => {
  try {
    const [row] = await db.select({ updates: projects.updates })
      .from(projects)
      .where(eq(projects.id, req.params.id));
    if (!row) return res.status(404).json({ error: "Project not found" });
    res.json({ updates: (row.updates as any[]) || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/updates — admin only; append a new update log entry
router.post("/projects/:id/updates", requireAdmin, async (req, res) => {
  try {
    const { message } = req.body as { message?: string };
    if (!message?.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const [existing] = await db.select({ updates: projects.updates })
      .from(projects)
      .where(eq(projects.id, req.params.id));
    if (!existing) return res.status(404).json({ error: "Project not found" });

    const newEntry = { message: message.trim(), date: new Date().toISOString() };
    const currentUpdates = (existing.updates as any[]) || [];
    const updatedList = [newEntry, ...currentUpdates];

    const [row] = await db.update(projects)
      .set({ updates: updatedList, updated_at: new Date() })
      .where(eq(projects.id, req.params.id))
      .returning();

    res.status(201).json({ update: newEntry, updates: row.updates });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/upload-signature — admin only (images)
router.post("/projects/upload-signature", requireAdmin, async (req, res) => {
  try {
    const { folder, publicId } = req.body as { folder?: string; publicId?: string };
    const sig = getUploadSignature(folder || "infinity-tech", publicId, "image");
    res.json(sig);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/video-upload-signature — admin only (videos)
router.post("/projects/video-upload-signature", requireAdmin, async (req, res) => {
  try {
    const { folder, publicId } = req.body as { folder?: string; publicId?: string };
    const sig = getUploadSignature(folder || "infinity-tech/videos", publicId, "video");
    res.json(sig);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/asset-upload-signature — admin only (all types: image | video | raw)
// resource_type: "image" for thumbnails, "video" for demos, "raw" for 3D models (GLB/STEP)
router.post("/projects/asset-upload-signature", requireAdmin, async (req, res) => {
  try {
    const { folder, publicId, resourceType } = req.body as {
      folder?: string;
      publicId?: string;
      resourceType?: "image" | "video" | "raw";
    };
    const type = (resourceType ?? "image") as "image" | "video" | "raw";
    const defaultFolder =
      type === "video" ? "infinity-tech/videos" :
      type === "raw"   ? "infinity-tech/models"  : "infinity-tech";
    const sig = getUploadSignature(folder ?? defaultFolder, publicId, type);
    res.json(sig);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
