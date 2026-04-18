import { Router } from "express";
import webpush from "web-push";
import { db, pushSubscriptions } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// ── Initialise VAPID once ─────────────────────────────────────────────────────
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const VAPID_EMAIL   = process.env.VAPID_EMAIL || "mailto:admin@example.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  try {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
  } catch (err) {
    logger.warn({ err }, "VAPID keys invalid — push notifications disabled");
  }
} else {
  logger.warn("VAPID keys missing — push notifications disabled");
}

// ── GET /api/push/vapid-public-key ────────────────────────────────────────────
router.get("/push/vapid-public-key", (_req, res) => {
  if (!VAPID_PUBLIC) return res.status(503).json({ error: "Push not configured" });
  return res.json({ publicKey: VAPID_PUBLIC });
});

// ── POST /api/push/subscribe — save a browser push subscription ───────────────
router.post("/push/subscribe", async (req, res) => {
  const pin = req.headers["x-admin-pin"] as string;
  const validPin = process.env.ADMIN_PIN || "admin2024";
  if (pin !== validPin) return res.status(401).json({ error: "Unauthorized" });

  const { endpoint, keys } = req.body ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Invalid subscription object" });
  }

  try {
    // Upsert — same endpoint can re-subscribe after key rotation
    await db
      .insert(pushSubscriptions)
      .values({
        endpoint,
        p256dh:     keys.p256dh,
        auth:       keys.auth,
        user_agent: (req.headers["user-agent"] ?? "").slice(0, 512),
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: { p256dh: keys.p256dh, auth: keys.auth },
      });
    logger.info({ endpoint: endpoint.slice(0, 60) }, "Push subscription saved");
    return res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err }, "Failed to save push subscription");
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/push/subscribe — remove a subscription ───────────────────────
router.delete("/push/subscribe", async (req, res) => {
  const pin = req.headers["x-admin-pin"] as string;
  const validPin = process.env.ADMIN_PIN || "admin2024";
  if (pin !== validPin) return res.status(401).json({ error: "Unauthorized" });

  const { endpoint } = req.body ?? {};
  if (!endpoint) return res.status(400).json({ error: "endpoint required" });

  try {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/push/test — fire a test notification to all subscriptions ────────
router.post("/push/test", async (req, res) => {
  const pin = req.headers["x-admin-pin"] as string;
  const validPin = process.env.ADMIN_PIN || "admin2024";
  if (pin !== validPin) return res.status(401).json({ error: "Unauthorized" });

  const subs = await db.select().from(pushSubscriptions);
  if (subs.length === 0) return res.json({ ok: true, sent: 0 });

  const payload = JSON.stringify({
    title: "🔔 Push Test",
    body: "Web Push is working correctly!",
    icon: "/favicon.svg",
    tag: "push-test",
  });

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      );
      sent++;
    } catch (err: any) {
      logger.error({ err, endpoint: sub.endpoint.slice(0, 60) }, "Push send failed");
      // 410 Gone = subscription expired, clean it up
      if (err.statusCode === 410) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
        logger.info("Removed expired push subscription");
      }
    }
  }

  return res.json({ ok: true, sent, total: subs.length });
});

// ── Exported helper: broadcast a push to ALL stored subscriptions ─────────────
export async function broadcastPush(payload: { title: string; body: string; icon?: string; tag?: string }) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  let subs: { endpoint: string; p256dh: string; auth: string }[] = [];
  try {
    subs = await db.select().from(pushSubscriptions);
  } catch (err) {
    logger.error({ err }, "Failed to fetch push subscriptions");
    return;
  }

  const json = JSON.stringify({ icon: "/favicon.svg", ...payload });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        json,
      );
      logger.info({ endpoint: sub.endpoint.slice(0, 60) }, "Push notification sent");
    } catch (err: any) {
      logger.error({ err, status: err.statusCode, endpoint: sub.endpoint.slice(0, 60) }, "Push send error");
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
        logger.info("Removed expired/invalid push subscription");
      }
    }
  }
}

export default router;
