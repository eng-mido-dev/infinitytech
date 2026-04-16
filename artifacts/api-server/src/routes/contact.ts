import { Router } from "express";
import { db, contactMessages } from "@workspace/db";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { broadcastPush } from "./push";

const router = Router();

const contactSchema = z.object({
  name:    z.string().min(2).max(100),
  phone:   z.string().min(7).max(30),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(5000),
});

router.post("/contact", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  try {
    await db.insert(contactMessages).values(parsed.data);

    // Fire-and-forget push notification to all admin subscriptions
    broadcastPush({
      title: `📩 New message from ${parsed.data.name}`,
      body:  `${parsed.data.subject} — ${parsed.data.message.slice(0, 100)}${parsed.data.message.length > 100 ? "…" : ""}`,
      icon:  "/favicon.svg",
      tag:   "new-contact",
    }).catch(() => {}); // never block the HTTP response

    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/messages?pin=<pin>  — private, PIN-protected
router.get("/admin/messages", async (req, res) => {
  const validPin = process.env.ADMIN_PIN || "admin2024";
  if (req.query.pin !== validPin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const msgs = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.created_at));
    return res.json({ messages: msgs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
